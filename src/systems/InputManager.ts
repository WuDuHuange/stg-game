/**
 * 输入管理器
 * 管理键盘和手柄输入，支持按键映射和自定义
 */

import Phaser from 'phaser';
import { logger } from '@utils/Logger';

/**
 * 输入类型
 */
export enum InputType {
    KEYBOARD = 'KEYBOARD',
    GAMEPAD = 'GAMEPAD'
}

/**
 * 按键映射
 */
export type KeyMapping = {
    keyboard: number | string;
    gamepad?: number;
};

/**
 * 输入事件
 */
export type InputEvent = {
    action: string;
    type: InputType;
    value: number;
    timestamp: number;
};

/**
 * 动作配置
 */
export type ActionConfig = {
    name: string;
    defaultMapping: KeyMapping;
    currentMapping: KeyMapping;
    isPressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
    value: number;
};

export class InputManager {
    private static instance: InputManager;
    private scene: Phaser.Scene | null = null;
    private actions: Map<string, ActionConfig> = new Map();
    private inputListeners: Map<string, Array<(event: InputEvent) => void>> = new Map();
    private gamepadIndex: number = 0;

    private constructor() {}

    /**
     * 获取InputManager实例
     */
    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    /**
     * 初始化输入管理器
     */
    public initialize(scene: Phaser.Scene): void {
        this.scene = scene;
        logger.info('InputManager initialized');

        // 设置游戏pad
        this.scene.input.gamepad!.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
            logger.info('Gamepad connected', { index: pad.index });
            this.gamepadIndex = pad.index;
        });

        this.scene.input.gamepad!.once('disconnected', (pad: Phaser.Input.Gamepad.Gamepad) => {
            logger.info('Gamepad disconnected', { index: pad.index });
            if (this.gamepadIndex === pad.index) {
                this.gamepadIndex = -1;
            }
        });
    }

    /**
     * 注册动作
     */
    public registerAction(actionName: string, defaultMapping: KeyMapping): void {
        if (this.actions.has(actionName)) {
            logger.warn(`Action ${actionName} already registered`);
            return;
        }

        const actionConfig: ActionConfig = {
            name: actionName,
            defaultMapping: defaultMapping,
            currentMapping: { ...defaultMapping },
            isPressed: false,
            justPressed: false,
            justReleased: false,
            value: 0
        };

        this.actions.set(actionName, actionConfig);
        logger.info(`Action registered: ${actionName}`, defaultMapping);
    }

    /**
     * 更新输入状态
     */
    public update(): void {
        if (!this.scene) return;

        this.actions.forEach((action, actionName) => {
            const previousPressed = action.isPressed;
            action.isPressed = this.isActionPressed(actionName);
            action.value = this.getActionValue(actionName);

            // 检测刚按下
            action.justPressed = action.isPressed && !previousPressed;

            // 检测刚释放
            action.justReleased = !action.isPressed && previousPressed;

            // 触发输入事件
            if (action.justPressed || action.justReleased) {
                this.dispatchInputEvent(actionName);
            }
        });
    }

    /**
     * 检查动作是否按下
     */
    public isActionPressed(actionName: string): boolean {
        const action = this.actions.get(actionName);
        if (!action) return false;

        // 检查键盘输入
        if (typeof action.currentMapping.keyboard === 'string') {
            const key = this.scene!.input.keyboard!.addKey(action.currentMapping.keyboard);
            if (key.isDown) return true;
        } else if (typeof action.currentMapping.keyboard === 'number') {
            const key = this.scene!.input.keyboard!.addKey(action.currentMapping.keyboard);
            if (key.isDown) return true;
        }

        // 检查游戏手柄输入
        if (action.currentMapping.gamepad !== undefined && this.gamepadIndex >= 0) {
            const gamepad = this.scene!.input.gamepad!.getPad(this.gamepadIndex);
            if (gamepad) {
                if (gamepad.getButton(action.currentMapping.gamepad).pressed) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 获取动作值（用于模拟输入，如摇杆）
     */
    public getActionValue(actionName: string): number {
        const action = this.actions.get(actionName);
        if (!action) return 0;

        // 检查键盘输入
        if (typeof action.currentMapping.keyboard === 'string') {
            const key = this.scene!.input.keyboard!.addKey(action.currentMapping.keyboard);
            return key.isDown ? 1 : 0;
        } else if (typeof action.currentMapping.keyboard === 'number') {
            const key = this.scene!.input.keyboard!.addKey(action.currentMapping.keyboard);
            return key.isDown ? 1 : 0;
        }

        // 检查游戏手柄输入
        if (action.currentMapping.gamepad !== undefined && this.gamepadIndex >= 0) {
            const gamepad = this.scene!.input.gamepad!.getPad(this.gamepadIndex);
            if (gamepad) {
                return gamepad.getButton(action.currentMapping.gamepad).value;
            }
        }

        return 0;
    }

    /**
     * 检查动作是否刚按下
     */
    public isActionJustPressed(actionName: string): boolean {
        const action = this.actions.get(actionName);
        return action ? action.justPressed : false;
    }

    /**
     * 检查动作是否刚释放
     */
    public isActionJustReleased(actionName: string): boolean {
        const action = this.actions.get(actionName);
        return action ? action.justReleased : false;
    }

    /**
     * 自定义按键映射
     */
    public remapAction(actionName: string, newMapping: KeyMapping): void {
        const action = this.actions.get(actionName);
        if (!action) {
            logger.warn(`Action ${actionName} not found`);
            return;
        }

        action.currentMapping = { ...newMapping };
        logger.info(`Action remapped: ${actionName}`, newMapping);
    }

    /**
     * 重置按键映射
     */
    public resetActionMapping(actionName: string): void {
        const action = this.actions.get(actionName);
        if (!action) {
            logger.warn(`Action ${actionName} not found`);
            return;
        }

        action.currentMapping = { ...action.defaultMapping };
        logger.info(`Action mapping reset: ${actionName}`);
    }

    /**
     * 重置所有按键映射
     */
    public resetAllMappings(): void {
        this.actions.forEach(action => {
            action.currentMapping = { ...action.defaultMapping };
        });
        logger.info('All action mappings reset');
    }

    /**
     * 注册输入监听器
     */
    public onInput(actionName: string, callback: (event: InputEvent) => void): void {
        if (!this.inputListeners.has(actionName)) {
            this.inputListeners.set(actionName, []);
        }

        this.inputListeners.get(actionName)!.push(callback);
    }

    /**
     * 移除输入监听器
     */
    public offInput(actionName: string, callback: (event: InputEvent) => void): void {
        const listeners = this.inputListeners.get(actionName);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 分发输入事件
     */
    private dispatchInputEvent(actionName: string): void {
        const action = this.actions.get(actionName);
        if (!action) return;

        const event: InputEvent = {
            action: actionName,
            type: this.getInputType(),
            value: action.value,
            timestamp: Date.now()
        };

        const listeners = this.inputListeners.get(actionName);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    logger.error('Error in input listener', error);
                }
            });
        }
    }

    /**
     * 获取当前输入类型
     */
    private getInputType(): InputType {
        if (this.gamepadIndex >= 0) {
            return InputType.GAMEPAD;
        }
        return InputType.KEYBOARD;
    }

    /**
     * 获取按键配置
     */
    public getActionConfig(actionName: string): ActionConfig | undefined {
        return this.actions.get(actionName);
    }

    /**
     * 获取所有动作配置
     */
    public getAllActions(): Map<string, ActionConfig> {
        return new Map(this.actions);
    }

    /**
     * 保存按键配置
     */
    public saveMappings(): string {
        const mappings: Record<string, KeyMapping> = {};
        this.actions.forEach((action, actionName) => {
            mappings[actionName] = action.currentMapping;
        });
        return JSON.stringify(mappings);
    }

    /**
     * 加载按键配置
     */
    public loadMappings(mappingsJson: string): void {
        try {
            const mappings: Record<string, KeyMapping> = JSON.parse(mappingsJson);
            Object.entries(mappings).forEach(([actionName, mapping]) => {
                this.remapAction(actionName, mapping);
            });
            logger.info('Key mappings loaded');
        } catch (error) {
            logger.error('Failed to load key mappings', error);
        }
    }

    /**
     * 销毁输入管理器
     */
    public destroy(): void {
        this.actions.clear();
        this.inputListeners.clear();
        logger.info('InputManager destroyed');
    }
}

// 导出单例实例
export const inputManager = InputManager.getInstance();

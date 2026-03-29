/**
 * UI管理器
 * 管理UI元素的创建、更新和销毁
 */

import Phaser from 'phaser';
import { logger } from '@utils/Logger';

/**
 * UI层级
 */
export enum UILayer {
    BACKGROUND = 0,    // 背景
    NORMAL = 100,      // 普通
    DIALOG = 200,      // 对话框
    POPUP = 300,       // 弹窗
    TOOLTIP = 400,     // 提示
    TOAST = 500        // 通知
}

/**
 * UI元素信息
 */
type UIElementInfo = {
    id: string;
    element: Phaser.GameObjects.GameObject;
    layer: UILayer;
    visible: boolean;
    interactive: boolean;
    data: any;
};

/**
 * UI事件类型
 */
export enum UIEventType {
    CLICK = 'CLICK',
    HOVER = 'HOVER',
    DRAG = 'DRAG',
    SCROLL = 'SCROLL',
    INPUT = 'INPUT',
    FOCUS = 'FOCUS',
    BLUR = 'BLUR'
}

/**
 * UI事件
 */
export type UIEvent = {
    type: UIEventType;
    elementId: string;
    target: Phaser.GameObjects.GameObject;
    data: any;
    timestamp: number;
};

/**
 * UI动画配置
 */
export type UIAnimationConfig = {
    duration: number;
    ease?: string;
    delay?: number;
    repeat?: number;
    yoyo?: boolean;
    onComplete?: () => void;
};

export class UIManager {
    private static instance: UIManager;
    private scene: Phaser.Scene | null = null;
    private uiElements: Map<string, UIElementInfo> = new Map();
    private eventListeners: Map<UIEventType, Array<(event: UIEvent) => void>> = new Map();
    private nextId: number = 1;

    private constructor() {}

    /**
     * 获取UIManager实例
     */
    public static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    /**
     * 初始化UI管理器
     */
    public initialize(scene: Phaser.Scene): void {
        this.scene = scene;
        logger.info('UIManager initialized');
    }

    /**
     * 创建UI元素
     */
    public createUIElement(
        element: Phaser.GameObjects.GameObject,
        layer: UILayer = UILayer.NORMAL,
        data?: any
    ): string {
        const id = `ui_${this.nextId++}`;

        // 设置层级
        element.setDepth(layer);

        const elementInfo: UIElementInfo = {
            id,
            element,
            layer,
            visible: true,
            interactive: false,
            data: data || {}
        };

        this.uiElements.set(id, elementInfo);
        logger.debug(`UI element created: ${id}`);

        return id;
    }

    /**
     * 创建文本
     */
    public createText(
        x: number,
        y: number,
        text: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        layer: UILayer = UILayer.NORMAL
    ): string {
        const textObject = this.scene!.add.text(x, y, text, style);
        return this.createUIElement(textObject, layer);
    }

    /**
     * 创建图片
     */
    public createImage(
        x: number,
        y: number,
        key: string,
        layer: UILayer = UILayer.NORMAL
    ): string {
        const image = this.scene!.add.image(x, y, key);
        return this.createUIElement(image, layer);
    }

    /**
     * 创建按钮
     */
    public createButton(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        layer: UILayer = UILayer.NORMAL
    ): string {
        // 创建容器
        const container = this.scene!.add.container(x, y);

        // 创建背景
        const background = this.scene!.add.rectangle(0, 0, width, height, 0x0f3460, 0.8);
        background.setStrokeStyle(2, 0xe94560);

        // 创建文本
        const textObject = this.scene!.add.text(0, 0, text, style || {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([background, textObject]);

        const id = this.createUIElement(container, layer);

        // 设置交互
        this.setInteractive(id, true);
        this.setupButtonInteraction(id, background, textObject);

        return id;
    }

    /**
     * 设置按钮交互
     */
    private setupButtonInteraction(
        id: string,
        background: Phaser.GameObjects.Rectangle,
        text: Phaser.GameObjects.Text
    ): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        const container = elementInfo.element as Phaser.GameObjects.Container;

        background.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                background.setFillStyle(0xe94560, 0.8);
                text.setColor('#000000');
                this.dispatchEvent(UIEventType.HOVER, id, { hovered: true });
            })
            .on('pointerout', () => {
                background.setFillStyle(0x0f3460, 0.8);
                text.setColor('#ffffff');
                this.dispatchEvent(UIEventType.HOVER, id, { hovered: false });
            })
            .on('pointerdown', () => {
                this.dispatchEvent(UIEventType.CLICK, id, {});
            });
    }

    /**
     * 设置交互
     */
    public setInteractive(id: string, interactive: boolean): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.interactive = interactive;
        logger.debug(`UI element ${id} interactive set to: ${interactive}`);
    }

    /**
     * 显示UI元素
     */
    public show(id: string): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.setVisible(true);
        elementInfo.visible = true;
        logger.debug(`UI element shown: ${id}`);
    }

    /**
     * 隐藏UI元素
     */
    public hide(id: string): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.setVisible(false);
        elementInfo.visible = false;
        logger.debug(`UI element hidden: ${id}`);
    }

    /**
     * 切换UI元素显示状态
     */
    public toggle(id: string): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        if (elementInfo.visible) {
            this.hide(id);
        } else {
            this.show(id);
        }
    }

    /**
     * 设置UI元素位置
     */
    public setPosition(id: string, x: number, y: number): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.setPosition(x, y);
    }

    /**
     * 获取UI元素位置
     */
    public getPosition(id: string): { x: number; y: number } {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return { x: 0, y: 0 };

        return { x: elementInfo.element.x, y: elementInfo.element.y };
    }

    /**
     * 设置UI元素大小
     */
    public setSize(id: string, width: number, height: number): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.setSize(width, height);
    }

    /**
     * 设置UI元素旋转
     */
    public setRotation(id: string, angle: number): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.setRotation(angle);
    }

    /**
     * 设置UI元素透明度
     */
    public setAlpha(id: string, alpha: number): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.setAlpha(alpha);
    }

    /**
     * UI动画 - 淡入
     */
    public fadeIn(id: string, duration: number = 300, onComplete?: () => void): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.setAlpha(0);
        this.show(id);

        this.scene!.tweens.add({
            targets: elementInfo.element,
            alpha: 1,
            duration,
            onComplete
        });
    }

    /**
     * UI动画 - 淡出
     */
    public fadeOut(id: string, duration: number = 300, onComplete?: () => void): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        this.scene!.tweens.add({
            targets: elementInfo.element,
            alpha: 0,
            duration,
            onComplete: () => {
                this.hide(id);
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * UI动画 - 缩放
     */
    public scale(id: string, scaleX: number, scaleY: number, config?: UIAnimationConfig): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        this.scene!.tweens.add({
            targets: elementInfo.element,
            scaleX,
            scaleY,
            duration: config?.duration || 300,
            ease: config?.ease || 'Power2',
            delay: config?.delay || 0,
            repeat: config?.repeat || 0,
            yoyo: config?.yoyo || false,
            onComplete: config?.onComplete
        });
    }

    /**
     * UI动画 - 移动
     */
    public move(id: string, x: number, y: number, config?: UIAnimationConfig): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        this.scene!.tweens.add({
            targets: elementInfo.element,
            x,
            y,
            duration: config?.duration || 300,
            ease: config?.ease || 'Power2',
            delay: config?.delay || 0,
            repeat: config?.repeat || 0,
            yoyo: config?.yoyo || false,
            onComplete: config?.onComplete
        });
    }

    /**
     * UI动画 - 旋转
     */
    public rotate(id: string, angle: number, config?: UIAnimationConfig): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        this.scene!.tweens.add({
            targets: elementInfo.element,
            angle,
            duration: config?.duration || 300,
            ease: config?.ease || 'Power2',
            delay: config?.delay || 0,
            repeat: config?.repeat || 0,
            yoyo: config?.yoyo || false,
            onComplete: config?.onComplete
        });
    }

    /**
     * 停止动画
     */
    public stopAnimation(id: string): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        this.scene!.tweens.killTweensOf(elementInfo.element);
    }

    /**
     * 注册事件监听器
     */
    public on(eventType: UIEventType, callback: (event: UIEvent) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }

        this.eventListeners.get(eventType)!.push(callback);
    }

    /**
     * 移除事件监听器
     */
    public off(eventType: UIEventType, callback: (event: UIEvent) => void): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 分发事件
     */
    private dispatchEvent(type: UIEventType, elementId: string, data: any): void {
        const elementInfo = this.uiElements.get(elementId);
        if (!elementInfo) return;

        const event: UIEvent = {
            type,
            elementId,
            target: elementInfo.element,
            data,
            timestamp: Date.now()
        };

        const listeners = this.eventListeners.get(type);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    logger.error('Error in UI event listener', error);
                }
            });
        }
    }

    /**
     * 销毁UI元素
     */
    public destroy(id: string): void {
        const elementInfo = this.uiElements.get(id);
        if (!elementInfo) return;

        elementInfo.element.destroy();
        this.uiElements.delete(id);
        logger.debug(`UI element destroyed: ${id}`);
    }

    /**
     * 销毁指定层级的所有UI元素
     */
    public destroyLayer(layer: UILayer): void {
        const toDestroy: string[] = [];

        this.uiElements.forEach((elementInfo, id) => {
            if (elementInfo.layer === layer) {
                toDestroy.push(id);
            }
        });

        toDestroy.forEach(id => this.destroy(id));
        logger.info(`Destroyed layer: ${layer}`);
    }

    /**
     * 销毁所有UI元素
     */
    public destroyAll(): void {
        this.uiElements.forEach((_, id) => {
            this.destroy(id);
        });
        logger.info('All UI elements destroyed');
    }

    /**
     * 获取UI元素
     */
    public getUIElement(id: string): Phaser.GameObjects.GameObject | null {
        const elementInfo = this.uiElements.get(id);
        return elementInfo ? elementInfo.element : null;
    }

    /**
     * 获取UI元素信息
     */
    public getUIElementInfo(id: string): UIElementInfo | undefined {
        return this.uiElements.get(id);
    }

    /**
     * 获取所有UI元素
     */
    public getAllUIElements(): Map<string, UIElementInfo> {
        return new Map(this.uiElements);
    }

    /**
     * 销毁UI管理器
     */
    public destroy(): void {
        this.destroyAll();
        this.eventListeners.clear();
        logger.info('UIManager destroyed');
    }
}

// 导出单例实例
export const uiManager = UIManager.getInstance();

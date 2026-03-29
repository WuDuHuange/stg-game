/**
 * 游戏状态管理器
 * 管理游戏的不同状态（菜单、游戏、暂停等）
 */

import { logger } from '@utils/Logger';

/**
 * 游戏状态枚举
 */
export enum GameState {
    BOOT = 'BOOT',       // 启动
    MENU = 'MENU',       // 主菜单
    GAME = 'GAME',       // 游戏中
    PAUSED = 'PAUSED',   // 暂停
    GAME_OVER = 'GAME_OVER', // 游戏结束
    VICTORY = 'VICTORY', // 胜利
    SETTINGS = 'SETTINGS', // 设置
}

/**
 * 状态变化事件
 */
export type GameStateChangeEvent = {
    previousState: GameState;
    currentState: GameState;
};

export class GameStateManager {
    private static instance: GameStateManager;
    private currentState: GameState = GameState.BOOT;
    private stateHistory: GameState[] = [];
    private stateChangeListeners: Array<(event: GameStateChangeEvent) => void> = [];

    private constructor() {
        this.stateHistory.push(this.currentState);
    }

    /**
     * 获取GameStateManager实例
     */
    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    /**
     * 获取当前状态
     */
    public getCurrentState(): GameState {
        return this.currentState;
    }

    /**
     * 切换到指定状态
     */
    public changeState(newState: GameState): void {
        if (this.currentState === newState) {
            logger.warn(`Already in state: ${newState}`);
            return;
        }

        const previousState = this.currentState;
        logger.info(`Changing state from ${previousState} to ${newState}`);

        this.currentState = newState;
        this.stateHistory.push(newState);

        // 触发状态变化事件
        this.notifyStateChange({
            previousState,
            currentState: newState
        });
    }

    /**
     * 检查是否在指定状态
     */
    public isState(state: GameState): boolean {
        return this.currentState === state;
    }

    /**
     * 检查是否在游戏中
     */
    public isInGame(): boolean {
        return this.currentState === GameState.GAME;
    }

    /**
     * 检查是否暂停
     */
    public isPaused(): boolean {
        return this.currentState === GameState.PAUSED;
    }

    /**
     * 检查是否在菜单
     */
    public isInMenu(): boolean {
        return this.currentState === GameState.MENU;
    }

    /**
     * 获取状态历史
     */
    public getStateHistory(): GameState[] {
        return [...this.stateHistory];
    }

    /**
     * 返回上一个状态
     */
    public goToPreviousState(): void {
        if (this.stateHistory.length <= 1) {
            logger.warn('No previous state to go back to');
            return;
        }

        // 移除当前状态
        this.stateHistory.pop();

        // 获取上一个状态
        const previousState = this.stateHistory[this.stateHistory.length - 1];
        logger.info(`Going back to previous state: ${previousState}`);

        const currentState = this.currentState;
        this.currentState = previousState;

        // 触发状态变化事件
        this.notifyStateChange({
            previousState: currentState,
            currentState: previousState
        });
    }

    /**
     * 注册状态变化监听器
     */
    public onStateChange(listener: (event: GameStateChangeEvent) => void): void {
        this.stateChangeListeners.push(listener);
    }

    /**
     * 移除状态变化监听器
     */
    public offStateChange(listener: (event: GameStateChangeEvent) => void): void {
        const index = this.stateChangeListeners.indexOf(listener);
        if (index !== -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }

    /**
     * 通知状态变化
     */
    private notifyStateChange(event: GameStateChangeEvent): void {
        this.stateChangeListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                logger.error('Error in state change listener', error);
            }
        });
    }

    /**
     * 重置状态历史
     */
    public resetHistory(): void {
        this.stateHistory = [this.currentState];
        logger.info('State history reset');
    }

    /**
     * 获取状态名称
     */
    public getStateName(state: GameState): string {
        switch (state) {
            case GameState.BOOT:
                return '启动';
            case GameState.MENU:
                return '主菜单';
            case GameState.GAME:
                return '游戏中';
            case GameState.PAUSED:
                return '暂停';
            case GameState.GAME_OVER:
                return '游戏结束';
            case GameState.VICTORY:
                return '胜利';
            case GameState.SETTINGS:
                return '设置';
            default:
                return '未知';
        }
    }
}

// 导出单例实例
export const gameStateManager = GameStateManager.getInstance();

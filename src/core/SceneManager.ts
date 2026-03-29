/**
 * 场景管理器
 * 管理场景的加载、卸载和切换
 */

import Phaser from 'phaser';
import { logger } from '@utils/Logger';

/**
 * 场景加载事件
 */
export type SceneLoadEvent = {
    sceneKey: string;
    isLoading: boolean;
    progress: number;
};

export class SceneManager {
    private static instance: SceneManager;
    private game: Phaser.Game | null = null;
    private sceneLoadListeners: Array<(event: SceneLoadEvent) => void> = [];
    private loadingProgress: number = 0;
    private isLoading: boolean = false;

    private constructor() {}

    /**
     * 获取SceneManager实例
     */
    public static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    /**
     * 初始化场景管理器
     */
    public initialize(game: Phaser.Game): void {
        this.game = game;
        logger.info('SceneManager initialized');
    }

    /**
     * 切换到指定场景
     */
    public switchTo(sceneKey: string, data?: any): void {
        if (!this.game) {
            logger.error('Game not initialized');
            return;
        }

        logger.info(`Switching to scene: ${sceneKey}`, data);

        try {
            this.game.scene.start(sceneKey, data);
        } catch (error) {
            logger.error(`Failed to switch to scene: ${sceneKey}`, error);
            throw error;
        }
    }

    /**
     * 启动场景（不停止当前场景）
     */
    public launch(sceneKey: string, data?: any): void {
        if (!this.game) {
            logger.error('Game not initialized');
            return;
        }

        logger.info(`Launching scene: ${sceneKey}`, data);

        try {
            this.game.scene.launch(sceneKey, data);
        } catch (error) {
            logger.error(`Failed to launch scene: ${sceneKey}`, error);
            throw error;
        }
    }

    /**
     * 停止场景
     */
    public stop(sceneKey: string, data?: any): void {
        if (!this.game) {
            logger.error('Game not initialized');
            return;
        }

        logger.info(`Stopping scene: ${sceneKey}`, data);

        try {
            this.game.scene.stop(sceneKey, data);
        } catch (error) {
            logger.error(`Failed to stop scene: ${sceneKey}`, error);
            throw error;
        }
    }

    /**
     * 暂停场景
     */
    public pause(sceneKey: string): void {
        if (!this.game) {
            logger.error('Game not initialized');
            return;
        }

        logger.info(`Pausing scene: ${sceneKey}`);

        try {
            this.game.scene.pause(sceneKey);
        } catch (error) {
            logger.error(`Failed to pause scene: ${sceneKey}`, error);
            throw error;
        }
    }

    /**
     * 恢复场景
     */
    public resume(sceneKey: string): void {
        if (!this.game) {
            logger.error('Game not initialized');
            return;
        }

        logger.info(`Resuming scene: ${sceneKey}`);

        try {
            this.game.scene.resume(sceneKey);
        } catch (error) {
            logger.error(`Failed to resume scene: ${sceneKey}`, error);
            throw error;
        }
    }

    /**
     * 重新启动场景
     */
    public restart(sceneKey: string, data?: any): void {
        if (!this.game) {
            logger.error('Game not initialized');
            return;
        }

        logger.info(`Restarting scene: ${sceneKey}`, data);

        try {
            this.game.scene.restart(sceneKey, data);
        } catch (error) {
            logger.error(`Failed to restart scene: ${sceneKey}`, error);
            throw error;
        }
    }

    /**
     * 获取场景
     */
    public getScene(sceneKey: string): Phaser.Scene | null {
        if (!this.game) return null;

        try {
            return this.game.scene.getScene(sceneKey);
        } catch (error) {
            logger.error(`Failed to get scene: ${sceneKey}`, error);
            return null;
        }
    }

    /**
     * 获取当前活动场景
     */
    public getActiveScene(): Phaser.Scene | null {
        if (!this.game) return null;

        const scenes = this.game.scene.scenes;
        if (scenes.length === 0) return null;

        // 返回第一个活动场景
        return scenes.find(scene => scene.scene.isActive()) || scenes[0];
    }

    /**
     * 检查场景是否存在
     */
    public hasScene(sceneKey: string): boolean {
        if (!this.game) return false;

        return this.game.scene.getScene(sceneKey) !== null;
    }

    /**
     * 检查场景是否活动
     */
    public isSceneActive(sceneKey: string): boolean {
        const scene = this.getScene(sceneKey);
        return scene && scene.scene.isActive();
    }

    /**
     * 检查场景是否暂停
     */
    public isScenePaused(sceneKey: string): boolean {
        const scene = this.getScene(sceneKey);
        return scene && scene.scene.isPaused();
    }

    /**
     * 获取所有场景
     */
    public getAllScenes(): Phaser.Scene[] {
        if (!this.game) return [];
        return [...this.game.scene.scenes];
    }

    /**
     * 注册场景加载监听器
     */
    public onSceneLoad(listener: (event: SceneLoadEvent) => void): void {
        this.sceneLoadListeners.push(listener);
    }

    /**
     * 移除场景加载监听器
     */
    public offSceneLoad(listener: (event: SceneLoadEvent) => void): void {
        const index = this.sceneLoadListeners.indexOf(listener);
        if (index !== -1) {
            this.sceneLoadListeners.splice(index, 1);
        }
    }

    /**
     * 通知场景加载事件
     */
    private notifySceneLoad(event: SceneLoadEvent): void {
        this.sceneLoadListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                logger.error('Error in scene load listener', error);
            }
        });
    }

    /**
     * 获取加载进度
     */
    public getLoadingProgress(): number {
        return this.loadingProgress;
    }

    /**
     * 检查是否正在加载
     */
    public isLoading(): boolean {
        return this.isLoading;
    }
}

// 导出单例实例
export const sceneManager = SceneManager.getInstance();

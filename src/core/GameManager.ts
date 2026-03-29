/**
 * 游戏管理器
 * 管理游戏的生命周期、初始化、更新和销毁
 */

import Phaser from 'phaser';
import { logger } from '@utils/Logger';

export class GameManager {
    private static instance: GameManager;
    private game: Phaser.Game | null = null;
    private isInitialized: boolean = false;
    private isPaused: boolean = false;

    private constructor() {}

    /**
     * 获取GameManager实例
     */
    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    /**
     * 初始化游戏
     */
    public initialize(config: Phaser.Types.Core.GameConfig): void {
        if (this.isInitialized) {
            logger.warn('Game already initialized');
            return;
        }

        logger.info('Initializing game...', config);

        try {
            this.game = new Phaser.Game(config);
            this.isInitialized = true;
            logger.info('Game initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize game', error);
            throw error;
        }
    }

    /**
     * 获取游戏实例
     */
    public getGame(): Phaser.Game | null {
        return this.game;
    }

    /**
     * 检查游戏是否已初始化
     */
    public isGameInitialized(): boolean {
        return this.isInitialized;
    }

    /**
     * 暂停游戏
     */
    public pauseGame(): void {
        if (!this.game || this.isPaused) return;

        this.game.loop.sleep();
        this.isPaused = true;
        logger.info('Game paused');
    }

    /**
     * 恢复游戏
     */
    public resumeGame(): void {
        if (!this.game || !this.isPaused) return;

        this.game.loop.wake();
        this.isPaused = false;
        logger.info('Game resumed');
    }

    /**
     * 检查游戏是否暂停
     */
    public isGamePaused(): boolean {
        return this.isPaused;
    }

    /**
     * 销毁游戏
     */
    public destroy(): void {
        if (!this.game) return;

        logger.info('Destroying game...');
        this.game.destroy(true);
        this.game = null;
        this.isInitialized = false;
        this.isPaused = false;
        logger.info('Game destroyed');
    }

    /**
     * 获取当前场景
     */
    public getCurrentScene(): Phaser.Scene | null {
        if (!this.game) return null;

        const scene = this.game.scene.getScene(this.game.scene.scenes[0].scene.key);
        return scene || null;
    }

    /**
     * 获取游戏时间
     */
    public getGameTime(): number {
        if (!this.game) return 0;
        return this.game.loop.time;
    }

    /**
     * 获取FPS
     */
    public getFPS(): number {
        if (!this.game) return 0;
        return this.game.loop.actualFps;
    }
}

// 导出单例实例
export const gameManager = GameManager.getInstance();

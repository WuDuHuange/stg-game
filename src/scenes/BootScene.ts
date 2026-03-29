/**
 * 启动场景 - 负责加载游戏资源和初始化
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    /**
     * 预加载资源
     */
    preload(): void {
        this.createLoadingBar();

        // 这里可以预加载游戏资源
        // 例如：this.load.image('player', 'assets/textures/player.png');

        // 模拟资源加载
        this.time.delayedCall(1000, () => {
            this.loadComplete();
        });
    }

    /**
     * 创建加载进度条
     */
    private createLoadingBar(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 创建进度条背景
        const progressBar = this.add.graphics();
        progressBar.fillStyle(0x333333, 1);
        progressBar.fillRect(width / 2 - 200, height / 2 + 50, 400, 20);

        // 创建进度条前景
        const progressFill = this.add.graphics();
        progressFill.fillStyle(0xe94560, 1);

        // 监听加载进度
        this.load.on('progress', (value: number) => {
            progressFill.clear();
            progressFill.fillStyle(0xe94560, 1);
            progressFill.fillRect(width / 2 - 200, height / 2 + 50, 400 * value, 20);
        });

        // 加载完成后清理
        this.load.once('complete', () => {
            progressBar.destroy();
            progressFill.destroy();
        });
    }

    /**
     * 加载完成
     */
    private loadComplete(): void {
        console.log('BootScene: 资源加载完成');
        
        // 初始化游戏配置
        this.initGameConfig();

        // 跳转到主菜单
        this.scene.start('MenuScene');
    }

    /**
     * 初始化游戏配置
     */
    private initGameConfig(): void {
        // 这里可以初始化游戏的全局配置
        // 例如：音量设置、难度设置等
    }

    /**
     * 场景创建
     */
    create(): void {
        console.log('BootScene: 场景创建');
    }
}

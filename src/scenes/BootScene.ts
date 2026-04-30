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

        // 代码生成必要纹理（不依赖外部资源文件）
        this.generateTextures();
    }

    /**
     * 生成必要的纹理资源
     */
    private generateTextures(): void {
        // 玩境光点纹理
        if (!this.textures.exists('ambient_dot')) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillCircle(3, 3, 3);
            g.generateTexture('ambient_dot', 6, 6);
            g.destroy();
        }

        // 时间指示器纹理
        if (!this.textures.exists('time_ring')) {
            const g = this.add.graphics();
            g.lineStyle(2, 0xe94560, 0.6);
            g.strokeCircle(8, 8, 7);
            g.fillStyle(0xe94560, 0.3);
            g.fillCircle(8, 8, 5);
            g.generateTexture('time_ring', 16, 16);
            g.destroy();
        }
    }

    /**
     * 创建加载进度条
     */
    private createLoadingBar(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 标题
        this.add.text(width / 2, height / 2 - 40, 'STG 机娘游戏', {
            fontSize: '32px',
            color: '#e94560',
            fontStyle: 'bold'
        }).setOrigin(0.5);

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
     * 场景创建 - 加载完成后初始化并跳转
     */
    create(): void {
        this.initGameConfig();
        this.scene.start('MenuScene');
    }

    /**
     * 初始化游戏配置
     */
    private initGameConfig(): void {
        // 设置物理引擎默认配置
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
        }

        // 设置输入配置
        if (this.input && this.input.mouse) {
            this.input.mouse.disableContextMenu();
        }
    }
}

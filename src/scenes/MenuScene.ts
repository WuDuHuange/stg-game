/**
 * 主菜单场景
 */

import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    private titleText!: Phaser.GameObjects.Text;
    private startButton!: Phaser.GameObjects.Container;
    private settingsButton!: Phaser.GameObjects.Container;
    private exitButton!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'MenuScene' });
    }

    /**
     * 场景创建
     */
    create(): void {
        console.log('MenuScene: 场景创建');

        // 创建背景
        this.createBackground();

        // 创建标题
        this.createTitle();

        // 创建菜单按钮
        this.createMenuButtons();

        // 添加粒子效果
        this.createParticles();
    }

    /**
     * 创建背景
     */
    private createBackground(): void {
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // 添加星星效果
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.8));
            
            // 添加闪烁动画
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    /**
     * 创建标题
     */
    private createTitle(): void {
        this.titleText = this.add.text(
            this.cameras.main.width / 2,
            150,
            'STG机娘游戏',
            {
                fontSize: '64px',
                color: '#e94560',
                fontStyle: 'bold',
                stroke: '#0f3460',
                strokeThickness: 8,
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // 添加标题动画
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 1, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 创建菜单按钮
     */
    private createMenuButtons(): void {
        const buttonStyle = {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        };

        const buttonWidth = 300;
        const buttonHeight = 60;
        const centerX = this.cameras.main.width / 2;
        const startY = 350;
        const spacing = 80;

        // 开始游戏按钮
        this.startButton = this.createButton(
            centerX,
            startY,
            buttonWidth,
            buttonHeight,
            '开始游戏',
            buttonStyle,
            () => this.startGame()
        );

        // 设置按钮
        this.settingsButton = this.createButton(
            centerX,
            startY + spacing,
            buttonWidth,
            buttonHeight,
            '设置',
            buttonStyle,
            () => this.openSettings()
        );

        // 退出按钮
        this.exitButton = this.createButton(
            centerX,
            startY + spacing * 2,
            buttonWidth,
            buttonHeight,
            '退出',
            buttonStyle,
            () => this.exitGame()
        );
    }

    /**
     * 创建按钮
     */
    private createButton(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        style: any,
        callback: () => void
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // 创建按钮背景
        const background = this.add.rectangle(0, 0, width, height, 0x0f3460, 0.8);
        background.setStrokeStyle(2, 0xe94560);

        // 创建按钮文本
        const buttonText = this.add.text(0, 0, text, style).setOrigin(0.5);

        container.add([background, buttonText]);

        // 添加按钮交互
        background.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                background.setFillStyle(0xe94560, 0.8);
                buttonText.setColor('#000000');
            })
            .on('pointerout', () => {
                background.setFillStyle(0x0f3460, 0.8);
                buttonText.setColor('#ffffff');
            })
            .on('pointerdown', () => {
                callback();
            });

        return container;
    }

    /**
     * 创建粒子效果
     */
    private createParticles(): void {
        // 创建粒子管理器
        const particles = this.add.particles(0, 0, 'default', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height },
            speed: 50,
            scale: { start: 1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 3000,
            frequency: 500,
            tint: 0xe94560
        });
    }

    /**
     * 开始游戏
     */
    private startGame(): void {
        console.log('开始游戏');
        this.scene.start('GameScene');
    }

    /**
     * 打开设置
     */
    private openSettings(): void {
        console.log('打开设置');
        // TODO: 实现设置界面
    }

    /**
     * 退出游戏
     */
    private exitGame(): void {
        console.log('退出游戏');
        // 在浏览器中无法真正退出，这里可以显示退出确认
    }
}

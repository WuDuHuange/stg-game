/**
 * 游戏场景 - 主游戏场景
 */

import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private escKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GameScene' });
    }

    /**
     * 预加载资源
     */
    preload(): void {
        // 这里可以加载游戏资源
        // 例如：this.load.image('player', 'assets/textures/player.png');
    }

    /**
     * 场景创建
     */
    create(): void {
        console.log('GameScene: 场景创建');

        // 创建背景
        this.createBackground();

        // 创建玩家
        this.createPlayer();

        // 设置输入
        this.setupInput();

        // 创建HUD
        this.createHUD();

        // 显示提示信息
        this.showInstructions();
    }

    /**
     * 创建背景
     */
    private createBackground(): void {
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0a0a15, 0x0a0a15, 0x1a1a2e, 0x1a1a2e, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // 添加移动的星星
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 2);
            const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.7));
            
            // 添加移动动画
            this.tweens.add({
                targets: star,
                x: x - this.cameras.main.width,
                duration: Phaser.Math.Between(5000, 15000),
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    /**
     * 创建玩家
     */
    private createPlayer(): void {
        // 创建玩家精灵（临时使用圆形代替）
        this.player = this.add.circle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            20,
            0xe94560
        );

        // 添加玩家光晕效果
        const glow = this.add.circle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            30,
            0xe94560,
            0.3
        );

        // 设置玩家属性
        this.player.setData('speed', 300);
        this.player.setData('health', 100);
        this.player.setData('maxHealth', 100);
    }

    /**
     * 设置输入
     */
    private setupInput(): void {
        // 创建键盘输入
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // ESC键返回主菜单
        this.escKey.on('down', () => {
            this.scene.start('MenuScene');
        });
    }

    /**
     * 创建HUD
     */
    private createHUD(): void {
        // 创建血条背景
        const healthBarBg = this.add.rectangle(
            20,
            20,
            200,
            20,
            0x000000,
            0.7
        );

        // 创建血条
        const healthBar = this.add.rectangle(
            20,
            20,
            200,
            20,
            0xe94560
        ).setOrigin(0, 0.5);

        // 创建血条文本
        const healthText = this.add.text(
            120,
            20,
            '100/100',
            {
                fontSize: '14px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // 创建分数显示
        const scoreText = this.add.text(
            this.cameras.main.width - 20,
            20,
            '分数: 0',
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(1, 0.5);

        // 创建暂停提示
        const pauseText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 30,
            '按 ESC 返回主菜单',
            {
                fontSize: '16px',
                color: '#888888'
            }
        ).setOrigin(0.5);
    }

    /**
     * 显示操作提示
     */
    private showInstructions(): void {
        const instructions = [
            '使用 WASD 或 方向键 移动',
            '按 SPACE 发射子弹',
            '按 ESC 返回主菜单'
        ];

        instructions.forEach((text, index) => {
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50 + index * 30,
                text,
                {
                    fontSize: '20px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);
        });

        // 3秒后隐藏提示
        this.time.delayedCall(3000, () => {
            // TODO: 实现提示隐藏逻辑
        });
    }

    /**
     * 更新游戏逻辑
     */
    update(): void {
        if (!this.player) return;

        const speed = this.player.getData('speed');
        let velocityX = 0;
        let velocityY = 0;

        // 检查键盘输入
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = speed;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = speed;
        }

        // 归一化对角线移动
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        // 更新玩家位置
        this.player.x += velocityX * this.game.loop.delta / 1000;
        this.player.y += velocityY * this.game.loop.delta / 1000;

        // 限制玩家在屏幕内
        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            20,
            this.cameras.main.width - 20
        );
        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            20,
            this.cameras.main.height - 20
        );

        // 检查射击
        if (this.spaceKey.isDown) {
            // TODO: 实现射击逻辑
        }
    }
}

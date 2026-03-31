/**
 * 游戏场景 - 主游戏场景
 */

import Phaser from 'phaser';
import { ParticleSystem } from '@game/ParticleSystem';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private playerGlow!: Phaser.GameObjects.GameObject;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private escKey!: Phaser.Input.Keyboard.Key;
    private instructions!: Phaser.GameObjects.Text[];
    private bullets!: Phaser.GameObjects.Group;
    private enemies!: Phaser.GameObjects.Group;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private healthBar!: Phaser.GameObjects.Rectangle;
    private healthText!: Phaser.GameObjects.Text;
    private pauseText!: Phaser.GameObjects.Text;
    private particleSystem!: ParticleSystem;
    private lastShotTime: number = 0;
    private shotCooldown: number = 200; // 射击冷却时间（毫秒）
    private enemySpawnTimer!: Phaser.Time.TimerEvent;
    private gameOver: boolean = false;
    private playerInvincible: boolean = false;

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

        // 创建游戏对象组
        this.bullets = this.add.group();
        this.enemies = this.add.group();

        // 创建粒子系统
        this.particleSystem = new ParticleSystem(this);

        // 创建HUD
        this.createHUD();

        // 显示提示信息
        this.showInstructions();

        // 开始生成敌人
        this.startEnemySpawning();
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

        // 添加玩家光晕效果（保存引用）
        this.playerGlow = this.add.circle(
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
        // 创建血条背景（更明显的边框）
        const healthBarBg = this.add.rectangle(
            110,
            20,
            204,
            24,
            0x1a1a2e,
            0.9
        );
        healthBarBg.setStrokeStyle(2, 0x0f3460);

        // 创建血条
        this.healthBar = this.add.rectangle(
            10,
            20,
            200,
            20,
            0xe94560
        ).setOrigin(0, 0.5);

        // 创建血条文本
        this.healthText = this.add.text(
            120,
            20,
            '100/100',
            {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 创建分数显示
        this.scoreText = this.add.text(
            this.cameras.main.width - 20,
            20,
            '分数: 0',
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(1, 0.5);

        // 创建暂停提示（更明显，但不会干扰游戏）
        this.pauseText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 20,
            'ESC 返回主菜单',
            {
                fontSize: '14px',
                color: '#666666',
                fontStyle: 'italic'
            }
        ).setOrigin(0.5);

        // 5秒后淡出ESC提示
        this.time.delayedCall(5000, () => {
            if (this.pauseText && this.pauseText.active) {
                this.tweens.add({
                    targets: this.pauseText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.pauseText) {
                            this.pauseText.destroy();
                        }
                    }
                });
            }
        });
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

        this.instructions = [];

        instructions.forEach((text, index) => {
            const instructionText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50 + index * 30,
                text,
                {
                    fontSize: '20px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);
            this.instructions.push(instructionText);
        });

        // 3秒后隐藏提示
        this.time.delayedCall(3000, () => {
            this.instructions.forEach(text => {
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => text.destroy()
                });
            });
        });
    }

    /**
     * 更新游戏逻辑
     */
    update(): void {
        // 如果游戏结束，停止更新
        if (this.gameOver) return;

        if (!this.player || !this.player.active) return;

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

        // 更新光晕位置（跟随玩家）
        if (this.playerGlow && this.playerGlow.active) {
            this.playerGlow.x = this.player.x;
            this.playerGlow.y = this.player.y;
        }

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
            const currentTime = Date.now();
            if (currentTime - this.lastShotTime >= this.shotCooldown) {
                this.shoot();
                this.lastShotTime = currentTime;
            }
        }

        // 更新子弹
        this.updateBullets();

        // 更新敌人
        this.updateEnemies();

        // 检查碰撞
        this.checkCollisions();
    }

    /**
     * 射击
     */
    private shoot(): void {
        const bullet = this.add.circle(
            this.player.x,
            this.player.y - 20,
            5,
            0x00ff00
        );

        bullet.setData('speed', 500);
        bullet.setData('damage', 10);

        this.bullets.add(bullet);

        // 添加射击音效（可选）
        // this.sound.play('shoot');
    }

    /**
     * 更新子弹
     */
    private updateBullets(): void {
        this.bullets.getChildren().forEach((bullet: any) => {
            const speed = bullet.getData('speed');
            bullet.y -= speed * this.game.loop.delta / 1000;

            // 移除超出屏幕的子弹
            if (bullet.y < -10) {
                bullet.destroy();
            }
        });
    }

    /**
     * 开始生成敌人
     */
    private startEnemySpawning(): void {
        this.enemySpawnTimer = this.time.addEvent({
            delay: 2000, // 每2秒生成一个敌人
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 生成敌人
     */
    private spawnEnemy(): void {
        const x = Phaser.Math.Between(30, this.cameras.main.width - 30);
        const y = -30;

        const enemy = this.add.circle(x, y, 15, 0xff0000);
        enemy.setData('speed', Phaser.Math.Between(50, 150));
        enemy.setData('health', 20);
        enemy.setData('maxHealth', 20);
        enemy.setData('score', 100);

        // 添加敌人光晕
        const glow = this.add.circle(x, y, 25, 0xff0000, 0.3);

        this.enemies.add(enemy);
    }

    /**
     * 更新敌人
     */
    private updateEnemies(): void {
        this.enemies.getChildren().forEach((enemy: any) => {
            const speed = enemy.getData('speed');
            enemy.y += speed * this.game.loop.delta / 1000;

            // 简单的左右摆动
            enemy.x += Math.sin(Date.now() / 500) * 0.5;

            // 移除超出屏幕的敌人
            if (enemy.y > this.cameras.main.height + 30) {
                enemy.destroy();
            }
        });
    }

    /**
     * 检查碰撞
     */
    private checkCollisions(): void {
        if (this.gameOver) return;

        // 子弹与敌人的碰撞
        const bulletsToDestroy: any[] = [];
        const enemiesToDamage: Map<any, number> = new Map();

        this.bullets.getChildren().forEach((bullet: any) => {
            if (!bullet.active) return;

            this.enemies.getChildren().forEach((enemy: any) => {
                if (!enemy.active) return;

                const distance = Phaser.Math.Distance.Between(
                    bullet.x, bullet.y,
                    enemy.x, enemy.y
                );

                if (distance < 20) {
                    // 标记子弹要销毁
                    if (!bulletsToDestroy.includes(bullet)) {
                        bulletsToDestroy.push(bullet);
                    }

                    // 计算伤害
                    const damage = bullet.getData('damage');
                    const currentDamage = enemiesToDamage.get(enemy) || 0;
                    enemiesToDamage.set(enemy, currentDamage + damage);
                }
            });
        });

        // 应用伤害
        enemiesToDamage.forEach((damage, enemy) => {
            if (!enemy.active) return;

            const health = enemy.getData('health');
            const newHealth = health - damage;

            if (newHealth <= 0) {
                // 敌人死亡
                const score = enemy.getData('score');
                this.score += score;
                this.scoreText.setText(`分数: ${this.score}`);

                // 添加爆炸效果
                this.createExplosion(enemy.x, enemy.y);

                enemy.destroy();
            } else {
                // 敌人受伤
                enemy.setData('health', newHealth);

                // 闪烁效果（保存原始颜色）
                const originalColor = enemy.fillColor;
                enemy.setFillStyle(0xffffff);

                this.time.delayedCall(100, () => {
                    if (enemy.active) {
                        enemy.setFillStyle(originalColor);
                    }
                });
            }
        });

        // 销毁子弹
        bulletsToDestroy.forEach(bullet => {
            if (bullet.active) {
                bullet.destroy();
            }
        });

        // 敌人与玩家的碰撞
        const enemiesToDestroy: any[] = [];
        this.enemies.getChildren().forEach((enemy: any) => {
            // 检查敌人是否仍然有效
            if (!enemy.active) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance < 35) {
                this.playerTakeDamage(10);
                enemiesToDestroy.push(enemy);
            }
        });

        // 统一销毁敌人，避免在遍历过程中修改数组
        enemiesToDestroy.forEach(enemy => {
            if (enemy.active) {
                enemy.destroy();
            }
        });
    }

    /**
     * 玩家受到伤害
     */
    private playerTakeDamage(damage: number): void {
        if (this.playerInvincible || this.gameOver) return;

        const health = this.player.getData('health');
        const newHealth = Math.max(0, health - damage);
        this.player.setData('health', newHealth);

        // 更新血条
        this.updateHealthBar();

        // 创建玩家受伤粒子效果
        this.particleSystem.createPlayerHit(this.player.x, this.player.y);

        // 闪烁效果（保存原始颜色）
        const originalColor = this.player.fillColor;
        this.player.setFillStyle(0xff0000);
        this.playerInvincible = true;

        this.time.delayedCall(100, () => {
            if (this.player && this.player.active) {
                this.player.setFillStyle(originalColor);
            }
        });

        // 1秒无敌时间
        this.time.delayedCall(1000, () => {
            this.playerInvincible = false;
        });

        // 检查游戏结束
        if (newHealth <= 0) {
            this.gameOver = true;
            this.handleGameOver();
        }
    }

    /**
     * 更新血条
     */
    private updateHealthBar(): void {
        const health = this.player.getData('health');
        const maxHealth = this.player.getData('maxHealth');
        const healthPercent = health / maxHealth;

        this.healthBar.width = 200 * healthPercent;
        this.healthText.setText(`${health}/${maxHealth}`);

        // 血量低时改变颜色
        if (healthPercent < 0.3) {
            this.healthBar.fillColor = 0xff0000;
        } else if (healthPercent < 0.6) {
            this.healthBar.fillColor = 0xffaa00;
        } else {
            this.healthBar.fillColor = 0xe94560;
        }
    }

    /**
     * 处理游戏结束
     */
    private handleGameOver(): void {
        console.log('GameScene: 游戏结束，分数:', this.score);

        // 停止生成敌人
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
            this.enemySpawnTimer = null!;
        }

        // 停止所有动画
        this.tweens.killAll();

        // 显示游戏结束界面
        const gameOverBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            600,
            400,
            0x000000,
            0.9
        );

        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            '游戏结束',
            {
                fontSize: '48px',
                color: '#ff0000',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        const finalScoreText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 20,
            `最终分数: ${this.score}`,
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        const restartText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            '按 ESC 返回主菜单',
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // ESC键返回主菜单
        this.escKey.removeAllListeners();
        this.escKey.on('down', () => {
            console.log('GameScene: 返回主菜单');
            this.scene.start('MenuScene');
        });
    }

    /**
     * 创建爆炸效果
     */
    private createExplosion(x: number, y: number): void {
        this.particleSystem.createEnemyDeath(x, y);
    }

    /**
     * 场景销毁
     */
    destroy(): void {
        console.log('GameScene: 场景销毁');

        // 停止所有定时器
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
        }

        // 停止所有动画
        this.tweens.killAll();

        // 停止所有延迟调用
        this.time.removeAllEvents();

        // 清理粒子系统
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }

        // 清理所有游戏对象
        if (this.bullets) {
            this.bullets.clear(true, true);
        }
        if (this.enemies) {
            this.enemies.clear(true, true);
        }

        super.destroy();
    }
}

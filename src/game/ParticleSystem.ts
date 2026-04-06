/**
 * 粒子系统 - 管理所有粒子效果
 */

import Phaser from 'phaser';

export class ParticleSystem {
    private scene: Phaser.Scene;
    private emitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.emitters = new Map();
    }

    /**
     * 创建爆炸粒子效果
     */
    public createExplosion(x: number, y: number, color: number = 0xff0000): void {
        const emitter = this.scene.add.particles(0, 0, 'default', {
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 15,
            tint: color,
            blendMode: Phaser.BlendModes.ADD
        });

        const emitterId = `explosion_${Date.now()}_${Math.random()}`;
        this.emitters.set(emitterId, emitter);

        // 自动销毁
        this.scene.time.delayedCall(600, () => {
            emitter.destroy();
            this.emitters.delete(emitterId);
        });
    }

    /**
     * 创建受击闪光效果
     */
    public createHitFlash(x: number, y: number, color: number = 0xffffff): void {
        const flash = this.scene.add.circle(x, y, 30, color, 0.8);

        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    /**
     * 创建敌人死亡效果
     */
    public createEnemyDeath(x: number, y: number): void {
        // 爆炸效果
        this.createExplosion(x, y, 0xff0000);

        // 创建多个小碎片
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const fragment = this.scene.add.circle(x, y, 5, 0xff4444);

            this.scene.tweens.add({
                targets: fragment,
                x: x + Math.cos(angle) * 100,
                y: y + Math.sin(angle) * 100,
                scale: 0,
                alpha: 0,
                duration: 400,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    fragment.destroy();
                }
            });
        }
    }

    /**
     * 创建玩家受伤效果
     */
    public createPlayerHit(x: number, y: number): void {
        // 闪光效果
        this.createHitFlash(x, y, 0xff0000);

        // 创建伤害数字
        const damageText = this.scene.add.text(x, y - 20, '-10', {
            fontSize: '24px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: damageText,
            y: y - 60,
            alpha: 0,
            duration: 800,
            ease: 'Power2.easeOut',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }

    /**
     * 创建子弹轨迹效果
     */
    public createBulletTrail(x: number, y: number): void {
        const trail = this.scene.add.circle(x, y, 3, 0x00ff00, 0.5);

        this.scene.tweens.add({
            targets: trail,
            scale: 0,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                trail.destroy();
            }
        });
    }

    /**
     * 创建升级效果
     */
    public createLevelUp(x: number, y: number): void {
        const ring = this.scene.add.circle(x, y, 30, 0xffd700, 0.5);

        this.scene.tweens.add({
            targets: ring,
            scale: 3,
            alpha: 0,
            duration: 1000,
            ease: 'Power2.easeOut',
            onComplete: () => {
                ring.destroy();
            }
        });

        // 创建星星粒子
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const star = this.scene.add.circle(x, y, 3, 0xffd700);

            this.scene.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * 80,
                y: y + Math.sin(angle) * 80,
                scale: 0,
                alpha: 0,
                duration: 800,
                delay: i * 50,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    star.destroy();
                }
            });
        }
    }

    /**
     * 创建子弹发射特效
     */
    public createBulletMuzzle(x: number, y: number): void {
        // 创建发射闪光
        const flash = this.scene.add.circle(x, y, 10, 0x00ff00, 0.8);

        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 150,
            ease: 'Power2.easeOut',
            onComplete: () => {
                flash.destroy();
            }
        });

        // 创建小粒子
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const particle = this.scene.add.circle(x, y, 2, 0x88ff88);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 20,
                y: y + Math.sin(angle) * 20,
                scale: 0,
                alpha: 0,
                duration: 200,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 创建技能释放特效
     */
    public createSkillCast(x: number, y: number, color: number = 0x00ffff): void {
        // 创建技能光环
        const ring = this.scene.add.circle(x, y, 40, color, 0.6);

        this.scene.tweens.add({
            targets: ring,
            scale: 2,
            alpha: 0,
            strokeWidth: 5,
            duration: 500,
            ease: 'Power2.easeOut',
            onComplete: () => {
                ring.destroy();
            }
        });

        // 创建能量粒子
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const particle = this.scene.add.circle(x, y, 3, color);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 60,
                y: y + Math.sin(angle) * 60,
                alpha: 0,
                duration: 400,
                delay: i * 20,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 创建武器强化特效
     */
    public createWeaponEnhance(x: number, y: number): void {
        // 创建金色光柱
        const beam = this.scene.add.rectangle(x, y, 10, 100, 0xffd700, 0.8).setOrigin(0.5, 1);

        this.scene.tweens.add({
            targets: beam,
            scaleY: 0,
            alpha: 0,
            duration: 500,
            ease: 'Power2.easeOut',
            onComplete: () => {
                beam.destroy();
            }
        });

        // 创建上升粒子
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(
                x + Phaser.Math.Between(-20, 20),
                y + Phaser.Math.Between(-10, 10),
                3,
                0xffd700
            );

            this.scene.tweens.add({
                targets: particle,
                y: y - 50,
                alpha: 0,
                duration: 600,
                delay: i * 50,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * 创建连击特效
     */
    public createComboEffect(x: number, y: number, count: number): void {
        // 创建连击数字
        const comboText = this.scene.add.text(x, y, `${count} COMBO!`, {
            fontSize: `${24 + Math.min(count, 10) * 2}px`,
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#ff0000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: comboText,
            y: y - 50,
            scale: 1.5,
            alpha: 0,
            duration: 800,
            ease: 'Power2.easeOut',
            onComplete: () => {
                comboText.destroy();
            }
        });

        // 创建星星特效
        for (let i = 0; i < Math.min(count, 5); i++) {
            const star = this.scene.add.circle(
                x + Phaser.Math.Between(-30, 30),
                y + Phaser.Math.Between(-20, 20),
                5,
                0xffff00
            );

            this.scene.tweens.add({
                targets: star,
                scale: 0,
                alpha: 0,
                duration: 400,
                delay: i * 100,
                onComplete: () => {
                    star.destroy();
                }
            });
        }
    }

    /**
     * 创建环境光效（背景动态光效）
     */
    public createAmbientLight(): void {
        const ambientLight = this.scene.add.graphics();
        ambientLight.fillGradientStyle(0x0a0a15, 0x0a0a15, 0x1a1a2e, 0x1a1a2e, 0.1);

        // 创建呼吸效果
        this.scene.tweens.add({
            targets: { alpha: 0.3 },
            alpha: 0.1,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            onUpdate: (tween, targets) => {
                ambientLight.fillGradientStyle(
                    0x0a0a15,
                    0x0a0a15,
                    0x1a1a2e,
                    0x1a1a2e,
                    targets.alpha
                );
            }
        });
    }

    /**
     * 创建天气效果（雨滴）
     */
    public createRainEffect(): void {
        // 创建雨滴粒子
        for (let i = 0; i < 50; i++) {
            const rainDrop = this.scene.add.rectangle(
                Phaser.Math.Between(0, this.scene.cameras.main.width),
                Phaser.Math.Between(-50, 0),
                2,
                0x6699cc,
                0.6
            );

            this.scene.tweens.add({
                targets: rainDrop,
                y: this.scene.cameras.main.height + 100,
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 2000),
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    /**
     * 创建时间流逝效果
     */
    public createTimeEffect(): void {
        // 创建时间指示器（太阳/月亮）
        const timeIndicator = this.scene.add.circle(
            this.scene.cameras.main.width - 80,
            80,
            30,
            0xffd700,
            0.8
        );

        // 添加光晕
        const glow = this.scene.add.circle(
            this.scene.cameras.main.width - 80,
            80,
            50,
            0xffd700,
            0.3
        );

        // 脉动效果 - 上下移动
        this.scene.tweens.add({
            targets: timeIndicator,
            y: 90,  // 向下移动10像素
            duration: 10000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 光晕也跟随脉动
        this.scene.tweens.add({
            targets: glow,
            y: 90,  // 向下移动10像素
            duration: 10000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 创建能量场效果
     */
    public createEnergyField(x: number, y: number, radius: number = 100): void {
        const field = this.scene.add.circle(x, y, radius, 0x00ffff, 0.1);

        this.scene.tweens.add({
            targets: field,
            scale: 1.2,
            alpha: 0.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 创建传送门效果
     */
    public createPortal(x: number, y: number): void {
        // 外圈
        const outerRing = this.scene.add.circle(x, y, 40, 0x9932cc, 0.5);
        outerRing.setStrokeStyle(3, 0x6622aa);

        // 内圈
        const innerRing = this.scene.add.circle(x, y, 25, 0x9932cc, 0.8);

        // 旋转效果
        this.scene.tweens.add({
            targets: outerRing,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // 脉动效果
        this.scene.tweens.add({
            targets: innerRing,
            scale: 1.3,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 粒子效果
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const particle = this.scene.add.circle(
                x + Math.cos(angle) * 30,
                y + Math.sin(angle) * 30,
                3,
                0xccffcc
            );

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                scale: 0,
                alpha: 0,
                duration: 1000,
                delay: i * 50,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * 创建警告区域效果
     */
    public createWarningZone(x: number, y: number, duration: number = 2000, radius: number = 150): Phaser.GameObjects.Circle {
        const zone = this.scene.add.circle(x, y, radius, 0xff0000, 0.2);
        zone.setStrokeStyle(3, 0xff0000);

        // 脉动边框
        this.scene.tweens.add({
            targets: zone,
            alpha: 0.1,
            duration: 500,
            yoyo: true,
            repeat: Math.floor(duration / 1000),
            ease: 'Sine.easeInOut'
        });

        // 波纹效果
        this.scene.tweens.add({
            targets: zone,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: Math.floor(duration / 2000),
            ease: 'Sine.easeInOut'
        });

        // 自动销毁
        this.scene.time.delayedCall(duration, () => {
            if (zone && zone.active) {
                zone.destroy();
            }
        });

        return zone;
    }

    /**
     * 创建激光警告（竖线）
     */
    public createLaserWarning(x: number, duration: number = 1500): Phaser.GameObjects.Rectangle {
        const laser = this.scene.add.rectangle(
            x,
            this.scene.cameras.main.height / 2,
            20,
            this.scene.cameras.main.height,
            0xff0000,
            0.3
        );

        // 闪烁效果
        this.scene.tweens.add({
            targets: laser,
            alpha: 0.6,
            duration: 200,
            yoyo: true,
            repeat: Math.floor(duration / 400),
            ease: 'Sine.easeInOut'
        });

        // 自动销毁
        this.scene.time.delayedCall(duration, () => {
            if (laser && laser.active) {
                laser.destroy();
            }
        });

        return laser;
    }

    /**
     * 创建范围爆炸警告（大圆圈）
     */
    public createExplosionWarning(x: number, y: number, duration: number = 2000, radius: number = 200): Phaser.GameObjects.Circle {
        const warning = this.scene.add.circle(x, y, radius, 0xff6600, 0.3);
        warning.setStrokeStyle(5, 0xff6600);

        // 快速脉动
        this.scene.tweens.add({
            targets: warning,
            scale: 0.9,
            alpha: 0.5,
            duration: 300,
            yoyo: true,
            repeat: Math.floor(duration / 600),
            ease: 'Sine.easeInOut'
        });

        // 自动销毁
        this.scene.time.delayedCall(duration, () => {
            if (warning && warning.active) {
                warning.destroy();
            }
        });

        return warning;
    }

    /**
     * 创建矩形区域警告（用于Boss技能等）
     */
    public createRectWarning(x: number, y: number, width: number, height: number, duration: number = 2000): Phaser.GameObjects.Rectangle {
        const rect = this.scene.add.rectangle(x, y, width, height, 0xff0000, 0.2);
        rect.setStrokeStyle(3, 0xff0000);

        // 波纹边框效果
        this.scene.tweens.add({
            targets: rect,
            alpha: 0.4,
            duration: 500,
            yoyo: true,
            repeat: Math.floor(duration / 1000),
            ease: 'Sine.easeInOut'
        });

        // 自动销毁
        this.scene.time.delayedCall(duration, () => {
            if (rect && rect.active) {
                rect.destroy();
            }
        });

        return rect;
    }

    /**
     * 清理所有粒子
     */
    public clearAll(): void {
        this.emitters.forEach((emitter, id) => {
            emitter.destroy();
        });
        this.emitters.clear();
    }

    /**
     * 销毁粒子系统
     */
    public destroy(): void {
        this.clearAll();
    }
}

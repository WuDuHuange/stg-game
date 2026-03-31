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

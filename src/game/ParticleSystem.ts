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

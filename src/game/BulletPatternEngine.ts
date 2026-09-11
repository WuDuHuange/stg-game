/**
 * 弹幕引擎
 * 数据驱动的弹幕发射与运动控制，兼容 GameScene 现有子弹数据结构
 * （子弹通过 setData 保存 velocityX / velocityY / damage / glow / curve）。
 */

import Phaser from 'phaser';
import { BulletPatternConfig, PATTERNS } from '@data/BulletPatterns';

export class BulletPatternEngine {
    private scene: Phaser.Scene;
    private textureKey: string = 'enemy_bullet_dot';
    private laserTextureKey: string = 'enemy_bullet_laser';
    private textureReady: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 程序化生成敌弹纹理（圆点 / 长条激光）
     */
    public ensureTextures(): void {
        if (this.textureReady) return;

        if (!this.scene.textures.exists(this.textureKey)) {
            const g = this.scene.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillCircle(16, 16, 12);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(16, 16, 7);
            g.generateTexture(this.textureKey, 32, 32);
            g.destroy();
        }

        if (!this.scene.textures.exists(this.laserTextureKey)) {
            const g = this.scene.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillRect(1, 0, 14, 64);
            g.fillStyle(0xffffff, 0.7);
            g.fillRect(1, 6, 14, 52);
            g.generateTexture(this.laserTextureKey, 16, 64);
            g.destroy();
        }

        this.textureReady = true;
    }

    /**
     * 获取谱面配置
     */
    public getPattern(pattern: BulletPatternConfig | string): BulletPatternConfig {
        if (typeof pattern === 'string') {
            const preset = PATTERNS[pattern];
            if (preset) return preset;
            return PATTERNS['aimed_slow'];
        }
        return pattern;
    }

    /**
     * 发射一轮弹幕（激光 / 即时弹出子弹）
     */
    public fire(
        group: Phaser.GameObjects.Group,
        emitterX: number,
        emitterY: number,
        pattern: BulletPatternConfig | string,
        playerX?: number,
        playerY?: number,
        rotation: number = 0,
        speedMult: number = 1
    ): void {
        const cfg = this.getPattern(pattern);
        this.ensureTextures();
        const color = cfg.color ?? 0xff6600;
        const radius = cfg.radius ?? 5;
        const damage = cfg.damage ?? 10;
        const baseAngle = cfg.angle ?? Math.PI / 2;

        if (cfg.kind === 'laser') {
            this.fireLaser(group, emitterX, emitterY, cfg, rotation, damage);
            return;
        }

        const speed = cfg.speed * speedMult;
        const px = playerX ?? emitterX;
        const py = playerY ?? emitterY;

        for (let i = 0; i < cfg.count; i++) {
            let angle: number;
            switch (cfg.kind) {
                case 'aimed':
                    angle = Phaser.Math.Angle.Between(emitterX, emitterY, px, py);
                    if (rotation !== 0) angle += rotation;
                    break;
                case 'spread': {
                    const aim = Phaser.Math.Angle.Between(emitterX, emitterY, px, py);
                    const spread = cfg.spread ?? Math.PI / 3;
                    const offset = (i - (cfg.count - 1) / 2) * (spread / Math.max(1, cfg.count - 1));
                    angle = aim + offset + rotation;
                    break;
                }
                case 'ring':
                    angle = (i / cfg.count) * Math.PI * 2 + (cfg.angleOffset ?? 0) + rotation;
                    break;
                case 'spiral':
                    angle = (cfg.angleOffset ?? 0.3) * i + rotation + baseAngle - Math.PI / 2;
                    break;
                case 'random':
                    angle = Math.random() * Math.PI * 2;
                    break;
                default:
                    angle = baseAngle;
            }

            this.spawnBullet(group, emitterX, emitterY, angle, speed, cfg, color, radius, damage);
        }
    }

    /**
     * 生成单个敌弹（带光晕）
     */
    public spawnBullet(
        group: Phaser.GameObjects.Group,
        x: number,
        y: number,
        angle: number,
        speed: number,
        cfg: BulletPatternConfig,
        color: number,
        radius: number,
        damage: number
    ): void {
        this.ensureTextures();
        const bullet = this.scene.add.image(x, y, this.textureKey).setTint(color);
        bullet.setScale(radius / 12, radius / 12);

        const glow = this.scene.add.circle(x, y, radius + 6, color, 0.3);

        bullet.setData('velocityX', Math.cos(angle) * speed);
        bullet.setData('velocityY', Math.sin(angle) * speed);
        bullet.setData('damage', damage);
        bullet.setData('glow', glow);
        bullet.setData('hitRadius', radius);
        if (cfg.curve) {
            bullet.setData('curve', cfg.curve);
        }

        group.add(bullet);
    }

    /**
     * 发射激光：投射一条有持续时间的伤害光束
     */
    private fireLaser(
        group: Phaser.GameObjects.Group,
        emitterX: number,
        emitterY: number,
        cfg: BulletPatternConfig,
        rotation: number,
        damage: number
    ): void {
        const width = cfg.laserWidth ?? 10;
        const duration = cfg.laserDuration ?? 700;
        const angle = (cfg.angle ?? Math.PI / 2) + rotation;

        const length = this.scene.cameras.main.height + 100;
        const laser = this.scene.add.image(emitterX, emitterY, this.laserTextureKey);
        laser.setTint(cfg.color ?? 0xff0055);
        laser.setOrigin(0.5, 0).setRotation(angle - Math.PI / 2);
        laser.setScale(width / 16, length / 64);

        laser.setData('damage', damage);
        laser.setData('isLaser', true);
        laser.setData('hitRadius', width / 2);

        // 预警闪烁后点亮
        laser.setAlpha(0.35);
        this.scene.tweens.add({
            targets: laser,
            alpha: 0.9,
            duration: 120,
            yoyo: true,
            repeat: Math.floor(duration / 240),
            onComplete: () => laser.destroy()
        });

        group.add(laser);
    }

    /**
     * 更新敌弹运动（含曲线）
     * 由 GameScene.update 中调用，替代现有内联更新逻辑
     */
    public updateBullet(bullet: any, delta: number): void {
        if (!bullet.active) return;
        if (bullet.getData('isLaser')) return;

        const dt = delta / 1000;
        let vx = bullet.getData('velocityX') || 0;
        let vy = bullet.getData('velocityY') || 0;

        const curve = bullet.getData('curve');
        if (curve) {
            const currentSpeed = Math.sqrt(vx * vx + vy * vy);
            if (curve.type === 'accelerate' && curve.accel) {
                const ns = currentSpeed + curve.accel * dt;
                const k = ns / Math.max(1, currentSpeed);
                vx *= k;
                vy *= k;
            } else if (curve.type === 'decelerate' && curve.accel) {
                const ns = Math.max(0, currentSpeed - curve.accel * dt);
                const k = ns / Math.max(1, currentSpeed);
                vx *= k;
                vy *= k;
            } else if (curve.type === 'sine' && curve.amp && curve.freq) {
                const t = this.sceneTime();
                const normalAngle = Math.atan2(vy, vx);
                const sine = Math.sin(t * curve.freq * Math.PI * 2) * curve.amp;
                const bias = Math.sin(normalAngle) * sine; // 平行扰动
                vy += bias * dt * 10; // 简化：垂直方向正弦扰动
                vx += Math.cos(normalAngle) * sine * dt * 10;
            }
        }

        bullet.x += vx * dt;
        bullet.y += vy * dt;
        bullet.setData('velocityX', vx);
        bullet.setData('velocityY', vy);
    }

    private sceneTime(): number {
        return this.scene.time.now / 1000;
    }
}
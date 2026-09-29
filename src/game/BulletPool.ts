/**
 * 敌弹对象池
 * 复用子弹贴图与伴随光晕，减少密集弹幕下的 GC 抖动与对象创建开销。
 * 归还的子弹不销毁，仅置为非激活并保留在池中，下次发射时重置状态复用。
 */

import Phaser from 'phaser';

export interface BulletPair {
    bullet: Phaser.GameObjects.Image;
    glow: Phaser.GameObjects.Arc;
}

export class BulletPool {
    private scene: Phaser.Scene;
    private textureKey: string;
    private bulletPool: Phaser.GameObjects.Image[] = [];
    private glowPool: Phaser.GameObjects.Arc[] = [];
    private createdCount: number = 0;
    private acquireCount: number = 0;

    constructor(scene: Phaser.Scene, textureKey: string) {
        this.scene = scene;
        this.textureKey = textureKey;
    }

    /**
     * 取出一对（子弹 + 光晕），优先复用池中对象
     */
    public acquire(x: number, y: number, tint: number, radius: number): BulletPair {
        let bullet = this.bulletPool.pop();
        if (!bullet || !bullet.scene) {
            bullet = this.scene.add.image(x, y, this.textureKey);
            this.createdCount++;
        }
        bullet.setActive(true).setVisible(true);
        bullet.setPosition(x, y);
        bullet.setTint(tint);
        bullet.setScale(radius / 12, radius / 12);
        bullet.setAlpha(1);
        bullet.setData('isLaser', false);

        let glow = this.glowPool.pop();
        if (!glow || !glow.scene) {
            glow = this.scene.add.circle(x, y, radius + 6, tint, 0.3);
            this.createdCount++;
        }
        glow.setActive(true).setVisible(true);
        glow.setPosition(x, y);
        glow.setRadius(radius + 6);
        glow.setFillStyle(tint, 0.3);

        this.acquireCount++;
        return { bullet, glow };
    }

    /**
     * 归还一对对象（不销毁，供复用）。
     * 防御：仅回收仍处于激活状态的对象，避免 Bomb/清屏重复回收导致重复入池。
     */
    public release(bullet: any, glow: any): void {
        if (bullet && bullet.scene && bullet.active) {
            bullet.setActive(false).setVisible(false);
            bullet.setPosition(-1000, -1000);
            bullet.setData('velocityX', 0);
            bullet.setData('velocityY', 0);
            bullet.setData('curve', undefined);
            bullet.setData('grazed', false);
            bullet.setData('glow', null);
            this.bulletPool.push(bullet);
        }
        if (glow && glow.scene && glow.active) {
            glow.setActive(false).setVisible(false);
            this.glowPool.push(glow);
        }
    }

    /** 池统计（调试用） */
    public getStats(): { created: number; acquired: number; pooled: number } {
        return {
            created: this.createdCount,
            acquired: this.acquireCount,
            pooled: this.bulletPool.length
        };
    }

    /** 当前池中空闲对象数 */
    public getFreeCount(): number {
        return this.bulletPool.length;
    }

    /** 清空池（场景销毁时调用） */
    public reset(): void {
        this.bulletPool.forEach(b => b.destroy());
        this.glowPool.forEach(g => g.destroy());
        this.bulletPool = [];
        this.glowPool = [];
        this.createdCount = 0;
        this.acquireCount = 0;
    }
}

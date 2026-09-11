/**
 * 程序化美术工厂
 * 在运行时用 Phaser Graphics 生成全部默认贴图（前缀 proc_），
 * 当同名正式资源（assets/textures/*.png）被加载时，TextureFactory.resolve 优先返回正式 key。
 */

import Phaser from 'phaser';
import { TEXTURE_ASSETS } from '@data/AssetManifest';

const CANVAS = 64;

export class TextureFactory {
    /**
     * 生成全部程序化纹理（幂等：已存在则跳过）
     */
    public static ensure(scene: Phaser.Scene): void {
        for (const spec of TEXTURE_ASSETS) {
            if (scene.textures.exists(spec.fallback)) continue;
            switch (spec.key) {
                case 'player_ship': TextureFactory.drawPlayerShip(scene); break;
                case 'enemy_light': TextureFactory.drawEnemyLight(scene); break;
                case 'enemy_heavy': TextureFactory.drawEnemyHeavy(scene); break;
                case 'enemy_elite': TextureFactory.drawEnemyElite(scene); break;
                case 'enemy_boss': TextureFactory.drawEnemyBoss(scene); break;
                case 'bullet_player': TextureFactory.drawBulletPlayer(scene); break;
                case 'bullet_enemy': TextureFactory.drawBulletEnemy(scene); break;
                case 'pickup_power': TextureFactory.drawPickup(scene, 'power'); break;
                case 'pickup_bomb': TextureFactory.drawPickup(scene, 'bomb'); break;
                case 'pickup_life': TextureFactory.drawPickup(scene, 'life'); break;
                case 'pickup_score': TextureFactory.drawPickup(scene, 'score'); break;
            }
        }
    }

    /**
     * 解析实际纹理 key：正式资源已加载则用正式，否则用程序化兜底
     */
    public static resolve(scene: Phaser.Scene, key: string): string {
        if (scene.textures.exists(key)) return key;
        return `proc_${key}`;
    }

    private static finish(_scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, fallbackKey: string): void {
        g.generateTexture(fallbackKey, CANVAS, CANVAS);
        g.destroy();
    }

    private static drawPlayerShip(scene: Phaser.Scene): void {
        const g = scene.add.graphics();
        // 机身（尖头宽体）
        g.fillStyle(0xe94560, 1);
        g.fillTriangle(32, 4, 50, 46, 14, 46);
        // 双翼
        g.fillStyle(0xc93450, 1);
        g.fillTriangle(50, 42, 60, 54, 44, 50);
        g.fillTriangle(14, 42, 4, 54, 20, 50);
        // 机翼点缀
        g.fillStyle(0xff8c9f, 0.9);
        g.fillTriangle(50, 44, 56, 52, 46, 48.5);
        g.fillTriangle(14, 44, 8, 52, 18, 48.5);
        // 驾驶舱核心
        g.fillStyle(0xffffff, 1);
        g.fillCircle(32, 40, 7);
        g.fillStyle(0x00ffcc, 1);
        g.fillCircle(32, 40, 4);
        // 尾焰锚点
        g.lineStyle(2, 0x00ffcc, 0.7);
        g.lineBetween(26, 50, 26, 58);
        g.lineBetween(38, 50, 38, 58);
        TextureFactory.finish(scene, g, 'proc_player_ship');
    }

    private static drawEnemyLight(scene: Phaser.Scene): void {
        const g = scene.add.graphics();
        // 扁圆机体
        g.fillStyle(0xff5533, 1);
        g.fillEllipse(32, 36, 36, 22);
        // 圆顶驾驶舱
        g.fillStyle(0xffaa88, 1);
        g.fillCircle(32, 32, 9);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(32, 30, 4);
        // 两侧炮口
        g.fillStyle(0xff3300, 1);
        g.fillRect(20, 36, 4, 10);
        g.fillRect(40, 36, 4, 10);
        TextureFactory.finish(scene, g, 'proc_enemy_light');
    }

    private static drawEnemyHeavy(scene: Phaser.Scene): void {
        const g = scene.add.graphics();
        // 宽装甲躯干
        g.fillStyle(0xff8822, 1);
        g.fillRect(18, 22, 28, 26);
        // 装甲斜切
        g.fillStyle(0xffaa55, 1);
        g.fillTriangle(18, 22, 28, 22, 24, 32);
        g.fillTriangle(46, 22, 36, 22, 40, 32);
        // 主炮
        g.fillStyle(0xcc5500, 1);
        g.fillRect(30, 14, 4, 12);
        // 底部推进
        g.fillStyle(0xffcc88, 0.9);
        g.fillRect(22, 48, 6, 8);
        g.fillRect(36, 48, 6, 8);
        TextureFactory.finish(scene, g, 'proc_enemy_heavy');
    }

    private static drawEnemyElite(scene: Phaser.Scene): void {
        const g = scene.add.graphics();
        // 主体
        g.fillStyle(0xcc44ff, 1);
        g.fillTriangle(32, 10, 50, 46, 14, 46);
        // 展翼
        g.fillStyle(0xaa22dd, 1);
        g.fillTriangle(50, 34, 62, 26, 50, 48);
        g.fillTriangle(14, 34, 2, 26, 14, 48);
        // 核心
        g.fillStyle(0xffffff, 1);
        g.fillCircle(32, 36, 6);
        g.fillStyle(0xcc44ff, 1);
        g.fillCircle(32, 36, 3);
        TextureFactory.finish(scene, g, 'proc_enemy_elite');
    }

    private static drawEnemyBoss(scene: Phaser.Scene): void {
        const g = scene.add.graphics();
        // 大六边机体
        g.fillStyle(0xff2266, 1);
        g.fillPoints([
            new Phaser.Geom.Point(32, 6), new Phaser.Geom.Point(54, 18), new Phaser.Geom.Point(54, 44),
            new Phaser.Geom.Point(32, 56), new Phaser.Geom.Point(10, 44), new Phaser.Geom.Point(10, 18)
        ], true);
        // 护甲环
        g.lineStyle(3, 0xff88aa, 0.9);
        g.strokeCircle(32, 32, 16);
        // 核心（脉动紫）
        g.fillStyle(0xffffff, 1);
        g.fillCircle(32, 32, 9);
        g.fillStyle(0xff44cc, 1);
        g.fillCircle(32, 32, 5);
        // 炮台
        g.fillStyle(0xcc1144, 1);
        g.fillRect(14, 22, 6, 6);
        g.fillRect(44, 22, 6, 6);
        g.fillRect(14, 40, 6, 6);
        g.fillRect(44, 40, 6, 6);
        TextureFactory.finish(scene, g, 'proc_enemy_boss');
    }

    private static drawBulletPlayer(scene: Phaser.Scene): void {
        const g = scene.add.graphics();
        // 冷色菱形弹
        g.fillStyle(0x00ffcc, 1);
        g.fillTriangle(16, 2, 30, 16, 16, 30);
        g.fillTriangle(16, 2, 2, 16, 16, 30);
        g.fillStyle(0xffffff, 0.95);
        g.fillCircle(16, 16, 5);
        TextureFactory.finish(scene, g, 'proc_bullet_player');
    }

    private static drawBulletEnemy(scene: Phaser.Scene): void {
        const g = scene.add.graphics();
        // 扁圆敌弹（白色基底，运行时用 tint 上色）
        g.fillStyle(0xffffff, 1);
        g.fillCircle(16, 16, 12);
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(16, 16, 7);
        TextureFactory.finish(scene, g, 'proc_bullet_enemy');
    }

    private static drawPickup(scene: Phaser.Scene, kind: 'power' | 'bomb' | 'life' | 'score'): void {
        const g = scene.add.graphics();
        const c = 32;
        const color = kind === 'power' ? 0x00ffcc : kind === 'bomb' ? 0xffaa00 : kind === 'life' ? 0xff66ee : 0xffffff;

        // 底色圆
        g.fillStyle(0x1a1a2e, 0.95);
        g.fillCircle(c, c, 15);
        g.lineStyle(2, color, 1);
        g.strokeCircle(c, c, 15);

        // 图标
        g.fillStyle(color, 1);
        if (kind === 'power') {
            g.fillTriangle(c, 22, 42, 32, 32, 42);
            g.fillTriangle(c, 22, 22, 32, 32, 42);
        } else if (kind === 'bomb') {
            g.strokeCircle(c, c, 8);
            g.fillCircle(c, c, 3);
        } else if (kind === 'life') {
            // 十字
            g.fillRect(c - 3, 24, 6, 16);
            g.fillRect(24, c - 3, 16, 6);
        } else {
            // 菱形
            g.fillTriangle(c, 22, 42, 32, 32, 42);
            g.fillTriangle(c, 42, 22, 32, 32, 22);
        }
        TextureFactory.finish(scene, g, `proc_pickup_${kind}`);
    }
}
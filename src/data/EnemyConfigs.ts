/**
 * 敌人配置数据
 * 定义游戏中所有敌人的属性和行为配置
 */

import { EnemyType, EnemyRarity as EnemyDataRarity } from './EnemyData';

// 重新导出以保持向后兼容
export { EnemyType };

/** 敌人稀有度（扩展版，包含EPIC/LEGENDARY） */
export enum EnemyRarity {
    COMMON = 'COMMON',
    ELITE = 'ELITE',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
    BOSS = 'BOSS'
}

/** 敌人行为模式枚举 */
export enum EnemyBehavior {
    STRAIGHT = 'straight',       // 直线移动
    ZIGZAG = 'zigzag',           // Z字形移动
    CIRCLE = 'circle',           // 圆形移动
    HOMING = 'homing',           // 追踪玩家
    BURST = 'burst',             // 突进
    STATIONARY = 'stationary',   // 静止
    PATROL = 'patrol'            // 巡逻
}

/** 弹幕模式枚举 */
export enum BulletPattern {
    SINGLE = 'single',           // 单发
    SPREAD = 'spread',           // 扇形弹幕
    CIRCLE = 'circle',           // 圆形弹幕
    SPIRAL = 'spiral',           // 螺旋弹幕
    LASER = 'laser',             // 激光
    AIMED = 'aimed'              // 瞄准弹幕
}

/** 敌人配置接口 */
export interface EnemyConfig {
    type: EnemyType;
    name: string;
    rarity: EnemyRarity;
    health: number;
    speed: number;
    score: number;
    size: number;
    color: number;
    glowColor: number;
    behavior: EnemyBehavior;
    bulletPattern: BulletPattern;
    bulletSpeed: number;
    bulletDamage: number;
    fireRate: number;       // 射击间隔（毫秒）
    dropRate: number;       // 掉落率（0-1）
    weakPoints?: WeakPointConfig[];
}

/** 弱点配置接口 */
export interface WeakPointConfig {
    id: string;
    health: number;
    damageMultiplier: number;
    position: { x: number; y: number };
    size: number;
}

/** 敌人配置表 */
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
    // ===== 轻型敌人 =====
    light_drone: {
        type: EnemyType.LIGHT,
        name: '侦察无人机',
        rarity: EnemyRarity.COMMON,
        health: 20,
        speed: 120,
        score: 100,
        size: 12,
        color: 0xff4444,
        glowColor: 0xff6666,
        behavior: EnemyBehavior.STRAIGHT,
        bulletPattern: BulletPattern.SINGLE,
        bulletSpeed: 200,
        bulletDamage: 5,
        fireRate: 2000,
        dropRate: 0.1
    },
    light_scout: {
        type: EnemyType.LIGHT,
        name: '巡逻侦察兵',
        rarity: EnemyRarity.COMMON,
        health: 25,
        speed: 80,
        score: 120,
        size: 14,
        color: 0xff6644,
        glowColor: 0xff8866,
        behavior: EnemyBehavior.PATROL,
        bulletPattern: BulletPattern.AIMED,
        bulletSpeed: 180,
        bulletDamage: 8,
        fireRate: 1500,
        dropRate: 0.15
    },
    light_chaser: {
        type: EnemyType.LIGHT,
        name: '追踪者',
        rarity: EnemyRarity.RARE,
        health: 30,
        speed: 100,
        score: 150,
        size: 13,
        color: 0xff4488,
        glowColor: 0xff66aa,
        behavior: EnemyBehavior.HOMING,
        bulletPattern: BulletPattern.SINGLE,
        bulletSpeed: 220,
        bulletDamage: 10,
        fireRate: 1200,
        dropRate: 0.2
    },

    // ===== 重型敌人 =====
    heavy_tank: {
        type: EnemyType.HEAVY,
        name: '重装甲兵',
        rarity: EnemyRarity.COMMON,
        health: 80,
        speed: 40,
        score: 300,
        size: 22,
        color: 0xcc4444,
        glowColor: 0xcc6666,
        behavior: EnemyBehavior.STRAIGHT,
        bulletPattern: BulletPattern.SPREAD,
        bulletSpeed: 150,
        bulletDamage: 15,
        fireRate: 3000,
        dropRate: 0.3,
        weakPoints: [
            { id: 'core', health: 30, damageMultiplier: 3, position: { x: 0, y: 0 }, size: 8 }
        ]
    },
    heavy_artillery: {
        type: EnemyType.HEAVY,
        name: '炮击型',
        rarity: EnemyRarity.RARE,
        health: 100,
        speed: 30,
        score: 400,
        size: 25,
        color: 0xcc6644,
        glowColor: 0xcc8866,
        behavior: EnemyBehavior.STATIONARY,
        bulletPattern: BulletPattern.CIRCLE,
        bulletSpeed: 120,
        bulletDamage: 20,
        fireRate: 4000,
        dropRate: 0.35,
        weakPoints: [
            { id: 'barrel', health: 40, damageMultiplier: 2.5, position: { x: 0, y: -10 }, size: 6 }
        ]
    },

    // ===== 精英敌人 =====
    elite_commander: {
        type: EnemyType.ELITE,
        name: '指挥官',
        rarity: EnemyRarity.EPIC,
        health: 200,
        speed: 60,
        score: 800,
        size: 28,
        color: 0xaa44ff,
        glowColor: 0xcc66ff,
        behavior: EnemyBehavior.ZIGZAG,
        bulletPattern: BulletPattern.SPIRAL,
        bulletSpeed: 160,
        bulletDamage: 12,
        fireRate: 800,
        dropRate: 0.5,
        weakPoints: [
            { id: 'head', health: 60, damageMultiplier: 2, position: { x: 0, y: -15 }, size: 10 },
            { id: 'core', health: 80, damageMultiplier: 3, position: { x: 0, y: 5 }, size: 8 }
        ]
    },
    elite_assassin: {
        type: EnemyType.ELITE,
        name: '暗杀者',
        rarity: EnemyRarity.EPIC,
        health: 150,
        speed: 150,
        score: 700,
        size: 20,
        color: 0x44aaff,
        glowColor: 0x66ccff,
        behavior: EnemyBehavior.BURST,
        bulletPattern: BulletPattern.AIMED,
        bulletSpeed: 300,
        bulletDamage: 25,
        fireRate: 600,
        dropRate: 0.45,
        weakPoints: [
            { id: 'weak_spot', health: 50, damageMultiplier: 4, position: { x: 0, y: 0 }, size: 6 }
        ]
    },

    // ===== Boss =====
    boss_guardian: {
        type: EnemyType.BOSS,
        name: '守卫者·零式',
        rarity: EnemyRarity.LEGENDARY,
        health: 1000,
        speed: 20,
        score: 5000,
        size: 50,
        color: 0xffaa00,
        glowColor: 0xffcc44,
        behavior: EnemyBehavior.CIRCLE,
        bulletPattern: BulletPattern.SPIRAL,
        bulletSpeed: 140,
        bulletDamage: 15,
        fireRate: 500,
        dropRate: 1.0,
        weakPoints: [
            { id: 'left_core', health: 200, damageMultiplier: 2, position: { x: -20, y: 0 }, size: 12 },
            { id: 'right_core', health: 200, damageMultiplier: 2, position: { x: 20, y: 0 }, size: 12 },
            { id: 'center', health: 300, damageMultiplier: 3, position: { x: 0, y: 0 }, size: 10 }
        ]
    },
    boss_destroyer: {
        type: EnemyType.BOSS,
        name: '毁灭者·壹式',
        rarity: EnemyRarity.LEGENDARY,
        health: 2000,
        speed: 15,
        score: 10000,
        size: 60,
        color: 0xff4400,
        glowColor: 0xff6644,
        behavior: EnemyBehavior.STATIONARY,
        bulletPattern: BulletPattern.CIRCLE,
        bulletSpeed: 180,
        bulletDamage: 20,
        fireRate: 300,
        dropRate: 1.0,
        weakPoints: [
            { id: 'top', health: 300, damageMultiplier: 2, position: { x: 0, y: -25 }, size: 10 },
            { id: 'left', health: 300, damageMultiplier: 2, position: { x: -25, y: 0 }, size: 10 },
            { id: 'right', health: 300, damageMultiplier: 2, position: { x: 25, y: 0 }, size: 10 },
            { id: 'core', health: 500, damageMultiplier: 3, position: { x: 0, y: 10 }, size: 8 }
        ]
    }
};

/** 根据关卡获取敌人配置列表 */
export function getEnemiesForLevel(level: number): EnemyConfig[] {
    const enemies: EnemyConfig[] = [];

    // 第1关：只有轻型敌人
    enemies.push(ENEMY_CONFIGS.light_drone);
    if (level >= 1) enemies.push(ENEMY_CONFIGS.light_scout);

    // 第2关：加入重型敌人
    if (level >= 2) enemies.push(ENEMY_CONFIGS.heavy_tank);
    if (level >= 2) enemies.push(ENEMY_CONFIGS.light_chaser);

    // 第3关：加入精英敌人
    if (level >= 3) enemies.push(ENEMY_CONFIGS.elite_commander);
    if (level >= 3) enemies.push(ENEMY_CONFIGS.heavy_artillery);

    // 第4关：更多精英
    if (level >= 4) enemies.push(ENEMY_CONFIGS.elite_assassin);

    return enemies;
}

/** 获取Boss配置 */
export function getBossForLevel(level: number): EnemyConfig {
    if (level <= 3) return ENEMY_CONFIGS.boss_guardian;
    return ENEMY_CONFIGS.boss_destroyer;
}

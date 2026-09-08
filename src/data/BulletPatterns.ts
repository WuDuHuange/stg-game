/**
 * 弹幕谱面数据
 * 定义数据驱动的弹幕模式，供 BulletPatternEngine 与 GameScene 使用。
 */

export type BulletCurveType = 'linear' | 'accelerate' | 'decelerate' | 'sine';

export interface BulletCurveConfig {
    type: BulletCurveType;
    accel?: number;   // 加速度 px/s²（accelerate 加速 / decelerate 减速）
    amp?: number;     // 正弦振幅 px/s
    freq?: number;    // 正弦频率 Hz
}

export type BulletPatternKind = 'aimed' | 'spread' | 'ring' | 'spiral' | 'random' | 'laser';

export interface BulletPatternConfig {
    kind: BulletPatternKind;
    angle?: number;      // 基础角度（弧度，0 = 向下）
    angleOffset?: number; // 每轮角度偏移（rad），用于螺旋自转
    count: number;       // 单轮弹数
    spread?: number;     // 扇形/圆环扩散总跨度（rad）
    speed: number;
    interval: number;    // 发射间隔 ms
    duration: number;    // 持续 ms，0 = 无限
    color?: number;
    radius?: number;
    damage?: number;
    curve?: BulletCurveConfig;
    laserWidth?: number;   // laser 专用：宽度
    laserDuration?: number; // laser 专用：持续时长 ms
}

/**
 * 常用谱面预设
 */
export const PATTERNS: Record<string, BulletPatternConfig> = {
    'aimed_slow': {
        kind: 'aimed', count: 1, speed: 140, interval: 2600, duration: 0,
        color: 0xff6644, radius: 5, damage: 10
    },
    'aimed_fast': {
        kind: 'aimed', count: 1, speed: 260, interval: 2000, duration: 0,
        color: 0xff5533, radius: 5, damage: 12
    },
    'spread_3': {
        kind: 'spread', count: 3, spread: Math.PI / 3, speed: 150, interval: 2400, duration: 0,
        color: 0xff8800, radius: 4, damage: 10
    },
    'spread_5_accel': {
        kind: 'spread', count: 5, spread: Math.PI / 2, speed: 190, interval: 2200, duration: 0,
        color: 0xff9900, radius: 4, damage: 12,
        curve: { type: 'accelerate', accel: 40 }
    },
    'ring_8': {
        kind: 'ring', count: 8, speed: 150, interval: 1800, duration: 0,
        color: 0xff4400, radius: 5, damage: 12
    },
    'ring_16_sine': {
        kind: 'ring', count: 16, speed: 130, interval: 1600, duration: 0,
        color: 0xff3300, radius: 5, damage: 14,
        curve: { type: 'sine', amp: 60, freq: 1.5 }
    },
    'spiral_aim': {
        kind: 'spiral', count: 1, angleOffset: 0.35, speed: 170, interval: 220, duration: 0,
        color: 0xffaa00, radius: 4, damage: 10
    },
    'spiral_dense': {
        kind: 'spiral', count: 2, angleOffset: 0.25, speed: 200, interval: 140, duration: 0,
        color: 0xffbb00, radius: 4, damage: 12
    },
    'random_shot': {
        kind: 'random', count: 6, speed: 180, interval: 2600, duration: 0,
        color: 0xff6600, radius: 4, damage: 10
    },
    'boss_ring': {
        kind: 'ring', count: 12, speed: 170, interval: 1500, duration: 0,
        color: 0xff44aa, radius: 6, damage: 16
    },
    'boss_spiral': {
        kind: 'spiral', count: 1, angleOffset: 0.28, speed: 230, interval: 90, duration: 0,
        color: 0xff55cc, radius: 5, damage: 14
    },
    'boss_laser': {
        kind: 'laser', count: 1, angle: 0, speed: 0, interval: 4000, duration: 0,
        color: 0xff0055, radius: 4, damage: 25,
        laserWidth: 10, laserDuration: 700
    }
};

/**
 * 敌人-ID 到子弹谱面的映射（供 GameScene 弹幕选择）
 */
export const ENEMY_PATTERNS: Record<string, string> = {
    light_scout: 'aimed_slow',
    light_drone: 'aimed_fast',
    light_interceptor: 'spread_3',
    heavy_tank: 'spread_3',
    heavy_fortress: 'spread_5_accel',
    elite_commander: 'ring_8',
    elite_assassin: 'spiral_aim'
};
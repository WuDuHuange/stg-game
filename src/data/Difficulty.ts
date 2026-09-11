/**
 * 难度系统
 * 定义难度档位与缩放系数。
 * Easy 提供血条制降级（useHealthMode），Normal 起为纯 STG 残机制。
 */

export enum Difficulty {
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard',
    LUNATIC = 'lunatic'
}

export interface DifficultyConfig {
    id: Difficulty;
    name: string;
    description: string;
    useHealthMode: boolean;      // Easy 血条制降级
    lives: number;               // 初始残机
    health: number;              // 血条制初始血量
    bulletSpeedMult: number;     // 敌弹速度系数
    bulletDensityMult: number;   // 敌弹密度系数（间隔越大越稀疏，此处为缩放系数）
    enemyFireRateMult: number;   // 敌人开火频率系数（越小越频繁）
    enemyHealthMult: number;     // 敌人体力系数
    scoreMult: number;           // 分数倍率
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
    [Difficulty.EASY]: {
        id: Difficulty.EASY,
        name: '简单',
        description: '血条制 · 弹幕稀疏',
        useHealthMode: true,
        lives: 5,
        health: 150,
        bulletSpeedMult: 0.8,
        bulletDensityMult: 0.7,
        enemyFireRateMult: 1.3,
        enemyHealthMult: 0.7,
        scoreMult: 1.0
    },
    [Difficulty.NORMAL]: {
        id: Difficulty.NORMAL,
        name: '普通',
        description: '残机制 · 标准弹幕',
        useHealthMode: false,
        lives: 3,
        health: 100,
        bulletSpeedMult: 1.0,
        bulletDensityMult: 1.0,
        enemyFireRateMult: 1.0,
        enemyHealthMult: 1.0,
        scoreMult: 1.0
    },
    [Difficulty.HARD]: {
        id: Difficulty.HARD,
        name: '困难',
        description: '残机制 · 密集弹幕',
        useHealthMode: false,
        lives: 3,
        health: 100,
        bulletSpeedMult: 1.18,
        bulletDensityMult: 1.25,
        enemyFireRateMult: 0.8,
        enemyHealthMult: 1.3,
        scoreMult: 1.4
    },
    [Difficulty.LUNATIC]: {
        id: Difficulty.LUNATIC,
        name: '疯狂',
        description: '残机制 · 弹幕地狱',
        useHealthMode: false,
        lives: 2,
        health: 100,
        bulletSpeedMult: 1.35,
        bulletDensityMult: 1.55,
        enemyFireRateMult: 0.65,
        enemyHealthMult: 1.6,
        scoreMult: 1.9
    }
};

const STORAGE_KEY = 'stg_difficulty';

export function getDifficulty(id: Difficulty): DifficultyConfig {
    return DIFFICULTIES[id] ?? DIFFICULTIES[Difficulty.NORMAL];
}

export function getStoredDifficulty(): DifficultyConfig {
    try {
        const saved = localStorage.getItem(STORAGE_KEY) as Difficulty | null;
        if (saved && DIFFICULTIES[saved]) {
            return DIFFICULTIES[saved];
        }
    } catch {}
    return DIFFICULTIES[Difficulty.NORMAL];
}

export function setStoredDifficulty(id: Difficulty): void {
    try {
        localStorage.setItem(STORAGE_KEY, id);
    } catch {}
}

export const DIFFICULTY_ORDER: Difficulty[] = [
    Difficulty.EASY,
    Difficulty.NORMAL,
    Difficulty.HARD,
    Difficulty.LUNATIC
];
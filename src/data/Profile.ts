/**
 * 玩家档案（局间存档）
 * 持久化：所选机娘、解锁状态、主线最大通关数、每关最佳成绩、生涯统计、难度解锁。
 */

import { MECHAS } from './MechaData';
import { Difficulty } from './Difficulty';

export interface StageRecord {
    bestScore: number;
    clears: number;
}

export interface ProfileData {
    selectedMecha: string;
    mechasUnlocked: Record<string, boolean>;
    maxLevelCleared: number;                  // 已通关的主线关卡数
    stageRecords: Record<number, StageRecord>; // 每关最佳成绩
    bestCombo: number;                        // 生涯最大连击
    bestGraze: number;                        // 生涯最大擦弹
    totalScore: number;                       // 累计分数
    totalPlays: number;                       // 总游玩次数
    mechaPlays: Record<string, number>;       // 各机娘出战场次
}

const STORAGE_KEY = 'stg_profile';
const DEFAULT_UNLOCK = { mecha_01: true };

/** 高难度解锁所需主线通关数（Easy/Normal 默认可用） */
export const DIFFICULTY_UNLOCK_LEVELS: Partial<Record<Difficulty, number>> = {
    [Difficulty.HARD]: 4,
    [Difficulty.LUNATIC]: 9
};

export function loadProfile(): ProfileData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const p = JSON.parse(raw) as Partial<ProfileData>;
            if (p && typeof p.selectedMecha === 'string') {
                return {
                    selectedMecha: p.selectedMecha,
                    mechasUnlocked: { ...DEFAULT_UNLOCK, ...(p.mechasUnlocked || {}) },
                    maxLevelCleared: p.maxLevelCleared || 0,
                    stageRecords: p.stageRecords || {},
                    bestCombo: p.bestCombo || 0,
                    bestGraze: p.bestGraze || 0,
                    totalScore: p.totalScore || 0,
                    totalPlays: p.totalPlays || 0,
                    mechaPlays: p.mechaPlays || {}
                };
            }
        }
    } catch {}
    return {
        selectedMecha: 'mecha_01',
        mechasUnlocked: { ...DEFAULT_UNLOCK },
        maxLevelCleared: 0,
        stageRecords: {},
        bestCombo: 0,
        bestGraze: 0,
        totalScore: 0,
        totalPlays: 0,
        mechaPlays: {}
    };
}

export function saveProfile(profile: ProfileData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
}

export function isMechaUnlocked(profile: ProfileData, mechaId: string): boolean {
    if (profile.mechasUnlocked[mechaId]) return true;
    const mecha = MECHAS.find(m => m.id === mechaId);
    if (!mecha) return false;
    return profile.maxLevelCleared >= mecha.unlockAfterLevel;
}

export function selectMecha(mechaId: string): ProfileData {
    const profile = loadProfile();
    if (isMechaUnlocked(profile, mechaId)) {
        profile.selectedMecha = mechaId;
        saveProfile(profile);
    }
    return profile;
}

export function recordMaxLevelCleared(levelNum: number): ProfileData {
    const profile = loadProfile();
    if (levelNum > profile.maxLevelCleared) {
        profile.maxLevelCleared = levelNum;
        saveProfile(profile);
    }
    return profile;
}

/**
 * 难度解锁判定。Easy/Normal 默认可用，Hard/Lunatic 需通关指定关卡数。
 */
export function isDifficultyUnlocked(profile: ProfileData, difficulty: Difficulty): boolean {
    const need = DIFFICULTY_UNLOCK_LEVELS[difficulty];
    if (need === undefined) return true;
    return profile.maxLevelCleared >= need;
}

/** 未解锁难度的解锁条件提示（已解锁返回空串） */
export function getDifficultyUnlockHint(difficulty: Difficulty): string {
    const need = DIFFICULTY_UNLOCK_LEVELS[difficulty];
    if (need === undefined) return '';
    return `通关第 ${need} 关解锁`;
}

/**
 * 记录主线关卡结果：更新该关最佳成绩与通关次数、累计总分。
 */
export function recordStageResult(levelNum: number, score: number): ProfileData {
    const profile = loadProfile();
    const prev = profile.stageRecords[levelNum] ?? { bestScore: 0, clears: 0 };
    profile.stageRecords[levelNum] = {
        bestScore: Math.max(prev.bestScore, score),
        clears: prev.clears + 1
    };
    profile.totalScore += score;
    saveProfile(profile);
    return profile;
}

/**
 * 记录一次游玩：总场次 +1、机娘出场计数、生涯最佳连击/擦弹。
 */
export function recordPlay(mechaId: string, stats?: { combo?: number; graze?: number }): ProfileData {
    const profile = loadProfile();
    profile.totalPlays += 1;
    profile.mechaPlays[mechaId] = (profile.mechaPlays[mechaId] ?? 0) + 1;
    if (stats) {
        if (stats.combo !== undefined && stats.combo > profile.bestCombo) profile.bestCombo = stats.combo;
        if (stats.graze !== undefined && stats.graze > profile.bestGraze) profile.bestGraze = stats.graze;
    }
    saveProfile(profile);
    return profile;
}
/**
 * 玩家档案（局间存档）
 * 持久化：所选机娘、解锁状态、主线最大通关数。
 */

import { MECHAS } from './MechaData';

export interface ProfileData {
    selectedMecha: string;
    mechasUnlocked: Record<string, boolean>;
    maxLevelCleared: number; // 已通关的主线关卡数
}

const STORAGE_KEY = 'stg_profile';
const DEFAULT_UNLOCK = { mecha_01: true };

export function loadProfile(): ProfileData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const p = JSON.parse(raw) as ProfileData;
            if (p && typeof p.selectedMecha === 'string') {
                return {
                    selectedMecha: p.selectedMecha,
                    mechasUnlocked: { ...DEFAULT_UNLOCK, ...(p.mechasUnlocked || {}) },
                    maxLevelCleared: p.maxLevelCleared || 0
                };
            }
        }
    } catch {}
    return { selectedMecha: 'mecha_01', mechasUnlocked: { ...DEFAULT_UNLOCK }, maxLevelCleared: 0 };
}

export function saveProfile(profile: ProfileData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
}

export function isMechaUnlocked(profile: ProfileData, mechaId: string): boolean {
    if (profile.mechasUnlocked[mechaId]) return true;
    // 按进度自动解锁
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
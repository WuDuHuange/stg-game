/**
 * 机娘数据与玩家档案测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MECHAS, getMecha } from '../../src/data/MechaData';
import {
    loadProfile, selectMecha, isMechaUnlocked, recordMaxLevelCleared,
    recordStageResult, isDifficultyUnlocked, recordPlay
} from '../../src/data/Profile';

describe('MechaData', () => {
    it('t有3台机娘且默认第一台', () => {
        expect(MECHAS).toHaveLength(3);
        expect(getMecha('mecha_01').name).toBe('绯羽');
        expect(getMecha('invalid')!.id).toBe('mecha_01');
    });

    it('机娘性能差异化', () => {
        expect(MECHAS[1].moveSpeed).toBeGreaterThan(MECHAS[0].moveSpeed);
        expect(MECHAS[2].damageMult).toBeGreaterThan(MECHAS[0].damageMult);
        expect(MECHAS[1].unlockAfterLevel).toBeGreaterThan(0);
    });
});

describe('Profile', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('默认仅初始机娘解锁', () => {
        const p = loadProfile();
        expect(p.selectedMecha).toBe('mecha_01');
        expect(isMechaUnlocked(p, 'mecha_01')).toBe(true);
        expect(isMechaUnlocked(p, 'mecha_02')).toBe(false);
        expect(isMechaUnlocked(p, 'mecha_03')).toBe(false);
    });

    it('社保发放后通关进度解锁机娘', () => {
        const p = recordMaxLevelCleared(5);
        expect(p.maxLevelCleared).toBe(5);
        expect(isMechaUnlocked(p, 'mecha_02')).toBe(true);
        expect(isMechaUnlocked(loadProfile(), 'mecha_03')).toBe(false);
    });

    it('锁定机娘不可选择', () => {
        const p = selectMecha('mecha_02');
        expect(p.selectedMecha).toBe('mecha_01');
    });

    it('解锁后可选择并持久化', () => {
        recordMaxLevelCleared(5);
        const p = selectMecha('mecha_02');
        expect(p.selectedMecha).toBe('mecha_02');
        expect(loadProfile().selectedMecha).toBe('mecha_02');
    });

    it('最大通关数只增不降', () => {
        recordMaxLevelCleared(5);
        const p = recordMaxLevelCleared(3);
        expect(loadProfile().maxLevelCleared).toBe(5);
        expect(p.maxLevelCleared).toBe(5);
    });

    it('记录关卡成绩：最佳分数与通关次数', () => {
        recordStageResult(3, 5000);
        recordStageResult(3, 3000);
        const p = loadProfile();
        expect(p.stageRecords[3].bestScore).toBe(5000);
        expect(p.stageRecords[3].clears).toBe(2);
        expect(p.totalScore).toBe(8000);
    });

    it('难度解锁：Easy/Normal 默认可用，Hard/Lunatic 按进度', () => {
        const p = loadProfile();
        expect(isDifficultyUnlocked(p, 'easy')).toBe(true);
        expect(isDifficultyUnlocked(p, 'normal')).toBe(true);
        expect(isDifficultyUnlocked(p, 'hard')).toBe(false);
        recordMaxLevelCleared(4);
        expect(isDifficultyUnlocked(loadProfile(), 'hard')).toBe(true);
        expect(isDifficultyUnlocked(loadProfile(), 'lunatic')).toBe(false);
    });

    it('记录游玩：场次/机娘计数/最佳连击擦弹', () => {
        recordPlay('mecha_01', { combo: 30, graze: 15 });
        recordPlay('mecha_01', { combo: 50, graze: 8 });
        recordPlay('mecha_02', { combo: 10, graze: 20 });
        const p = loadProfile();
        expect(p.totalPlays).toBe(3);
        expect(p.mechaPlays['mecha_01']).toBe(2);
        expect(p.mechaPlays['mecha_02']).toBe(1);
        expect(p.bestCombo).toBe(50);
        expect(p.bestGraze).toBe(20);
    });
});

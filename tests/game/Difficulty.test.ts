/**
 * 难度系统测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Difficulty, DIFFICULTIES, DIFFICULTY_ORDER, getDifficulty, getStoredDifficulty, setStoredDifficulty } from '../../src/data/Difficulty';

const STORAGE_KEY = 'stg_difficulty';

describe('Difficulty', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('四档难度齐备', () => {
        expect(DIFFICULTY_ORDER).toHaveLength(4);
        expect(DIFFICULTY_ORDER).toEqual([
            Difficulty.EASY,
            Difficulty.NORMAL,
            Difficulty.HARD,
            Difficulty.LUNATIC
        ]);
    });

    it('Easy 启用血条制降级', () => {
        expect(DIFFICULTIES[Difficulty.EASY].useHealthMode).toBe(true);
        expect(DIFFICULTIES[Difficulty.NORMAL].useHealthMode).toBe(false);
    });

    it('难度逐级递增缩放', () => {
        const easy = DIFFICULTIES[Difficulty.EASY];
        const normal = DIFFICULTIES[Difficulty.NORMAL];
        const lunatic = DIFFICULTIES[Difficulty.LUNATIC];
        expect(easy.bulletSpeedMult).toBeLessThan(normal.bulletSpeedMult);
        expect(lunatic.bulletSpeedMult).toBeGreaterThan(normal.bulletSpeedMult);
        expect(lunatic.enemyHealthMult).toBeGreaterThan(normal.enemyHealthMult);
        expect(lunatic.scoreMult).toBeGreaterThan(normal.scoreMult);
    });

    it('默认难度为普通', () => {
        expect(getStoredDifficulty().id).toBe(Difficulty.NORMAL);
    });

    it('持久化难度读写', () => {
        setStoredDifficulty(Difficulty.HARD);
        expect(localStorage.getItem(STORAGE_KEY)).toBe(Difficulty.HARD);
        expect(getStoredDifficulty().id).toBe(Difficulty.HARD);
    });

    it('getDifficulty 对非法值回退普通', () => {
        expect(getDifficulty('invalid' as Difficulty).id).toBe(Difficulty.NORMAL);
    });
});
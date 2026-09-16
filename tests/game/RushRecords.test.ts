/**
 * 无尽模式排行榜测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getBestRush, submitRush } from '../../src/data/RushRecords';

describe('RushRecords', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('无纪录时返回 null', () => {
        expect(getBestRush()).toBeNull();
    });

    it('首次提交即新纪录', () => {
        const r = submitRush(3, 500);
        expect(r.isNewBest).toBe(true);
        expect(r.best.waves).toBe(3);
        expect(getBestRush()?.score).toBe(500);
    });

    it('更高波次更新纪录', () => {
        submitRush(3, 500);
        const r = submitRush(5, 800);
        expect(r.isNewBest).toBe(true);
        expect(getBestRush()?.waves).toBe(5);
    });

    it('低波次不覆盖纪录', () => {
        submitRush(5, 800);
        const r = submitRush(3, 9000);
        expect(r.isNewBest).toBe(false);
        expect(getBestRush()?.waves).toBe(5);
    });

    it('同波次但更高分数记为新纪录', () => {
        submitRush(5, 800);
        const r = submitRush(5, 900);
        expect(r.isNewBest).toBe(true);
        expect(getBestRush()?.score).toBe(900);
    });
});
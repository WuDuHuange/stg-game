/**
 * 弹幕谱面数据测试
 */

import { describe, it, expect } from 'vitest';
import { PATTERNS, ENEMY_PATTERNS } from '../../src/data/BulletPatterns';

describe('BulletPatterns', () => {
    it('关键预设谱面存在且结构合法', () => {
        for (const key of ['aimed_slow', 'spread_3', 'ring_8', 'spiral_aim', 'boss_ring', 'boss_spiral', 'boss_laser']) {
            expect(PATTERNS[key], `missing preset: ${key}`).toBeDefined();
        }
    });

    it('所有预设都有合法 count 与 interval', () => {
        Object.values(PATTERNS).forEach(p => {
            expect(p.count).toBeGreaterThan(0);
            expect(p.interval).toBeGreaterThan(0);
            expect(p.speed).toBeGreaterThanOrEqual(0);
        });
    });

    it('ENEMY_PATTERNS 引用的谱面全部存在', () => {
        Object.values(ENEMY_PATTERNS).forEach(patternId => {
            expect(PATTERNS[patternId], `ENEMY_PATTERNS 引用了不存在的谱面: ${patternId}`).toBeDefined();
        });
    });

    it('ENEMY_PATTERNS 覆盖所有关卡基础敌人', () => {
        for (const id of ['light_scout', 'light_drone', 'light_interceptor', 'heavy_tank', 'heavy_fortress', 'elite_commander', 'elite_assassin']) {
            expect(ENEMY_PATTERNS[id], `missing enemy pattern: ${id}`).toBeDefined();
        }
    });
});
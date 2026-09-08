/**
 * STGPlayerSystem 规则系统测试
 */

import { describe, it, expect } from 'vitest';
import { STGPlayerSystem, DEFAULT_HITBOX_RADIUS, MAX_POWER } from '../../src/game/STGPlayerSystem';

describe('STGPlayerSystem', () => {
    it('初始状态：3残机 2Bomb 0Power 0擦弹', () => {
        const p = new STGPlayerSystem();
        const s = p.getState();
        expect(s.lives).toBe(3);
        expect(s.bombs).toBe(2);
        expect(s.power).toBe(0);
        expect(s.graze).toBe(0);
        expect(s.hitboxRadius).toBe(DEFAULT_HITBOX_RADIUS);
        expect(s.useHealthMode).toBe(false);
    });

    it('onsHit 扣 1 残机', () => {
        const p = new STGPlayerSystem();
        p.onHit();
        expect(p.getLives()).toBe(2);
    });

    it('残机耗尽返回 true（游戏结束）', () => {
        const p = new STGPlayerSystem();
        for (let i = 0; i < 3; i++) {
            expect(p.onHit()).toBe(false);
            p.update(1600); // 解除中弹无敌
        }
        expect(p.getLives()).toBe(0);
        const dead = p.onHit();
        expect(dead).toBe(true);
        expect(p.getLives()).toBe(0);
    });

    it('中弹后短暂无敌，无敌期间中弹不扣命', () => {
        const p = new STGPlayerSystem();
        p.onHit();
        expect(p.isInvincible()).toBe(true);
        const dead = p.onHit();
        expect(dead).toBe(false);
        // 结算无敌时间
        p.update(1600);
        expect(p.isInvincible()).toBe(false);
        const dead2 = p.onHit();
        expect(dead2).toBe(false);
        expect(p.getLives()).toBe(1);
    });

    it('擦弹计数', () => {
        const p = new STGPlayerSystem();
        p.addGraze(3);
        expect(p.getGraze()).toBe(3);
    });

    it('Power 有上限且可累计', () => {
        const p = new STGPlayerSystem();
        p.addPower(3);
        expect(p.getPower()).toBe(3);
        p.addPower(10);
        expect(p.getPower()).toBe(MAX_POWER);
    });

    it('Bomb 使用与上限', () => {
        const p = new STGPlayerSystem();
        expect(p.useBomb()).toBe(true);
        expect(p.getBombs()).toBe(1);
        expect(p.isBombActive()).toBe(true);
        // Bomb 窗口期内再按无效
        expect(p.useBomb()).toBe(false);
        p.update(2100);
        expect(p.isBombActive()).toBe(false);
    });

    it('healthMode 血条制：扣血与死亡判定', () => {
        const p = new STGPlayerSystem({ useHealthMode: true });
        const dead = p.onHit(40);
        expect(dead).toBe(false);
        expect(p.getHealth()).toBe(60);
        p.update(1600);
        const dead2 = p.onHit(100);
        expect(dead2).toBe(true);
        expect(p.getHealth()).toBe(0);
    });

    it('加生命不超出上限', () => {
        const p = new STGPlayerSystem();
        p.addLife(10);
        expect(p.getLives()).toBe(5);
    });

    it('reset 恢复默认', () => {
        const p = new STGPlayerSystem();
        p.addPower(4);
        p.addGraze(9);
        p.onHit();
        p.reset();
        const s = p.getState();
        expect(s.lives).toBe(3);
        expect(s.power).toBe(0);
        expect(s.graze).toBe(0);
    });
});
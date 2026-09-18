/**
 * 机娘机体数据
 * 每台机娘提供差异化机体性能（判定点/速度/火力/残机/Bomb）。
 * 初始解锁第一台，其余通过主线关卡进度解锁。
 */

export interface MechaConfig {
    id: string;
    name: string;
    code: string;            // 机体代号
    color: number;           // 主色（用于涂装与光晕）
    hitboxRadius: number;    // 判定点半径（机身越小判定越小）
    moveSpeed: number;
    powerBonus: number;      // 初始火力等级
    damageMult: number;      // 主炮伤害倍率
    lives: number;           // 初始残机
    bombs: number;           // 初始 Bomb
    unlockAfterLevel: number; // 需通关的主线关卡数（0 = 初始可用）
    hint: string;            // 解锁条件描述
}

export const MECHAS: MechaConfig[] = [
    {
        id: 'mecha_01',
        name: '绯羽',
        code: 'MF-01 REDSWALLOW',
        color: 0xe94560,
        hitboxRadius: 3,
        moveSpeed: 300,
        powerBonus: 0,
        damageMult: 1.0,
        lives: 3,
        bombs: 2,
        unlockAfterLevel: 0,
        hint: '初始机体'
    },
    {
        id: 'mecha_02',
        name: '苍岚',
        code: 'MF-02 AZUREGALE',
        color: 0x00ccff,
        hitboxRadius: 2.5,
        moveSpeed: 340,
        powerBonus: 1,
        damageMult: 0.95,
        lives: 3,
        bombs: 2,
        unlockAfterLevel: 4,
        hint: '通关第 4 关解锁'
    },
    {
        id: 'mecha_03',
        name: '霄焰',
        code: 'MF-03 SOLARFLARE',
        color: 0xffaa00,
        hitboxRadius: 3.5,
        moveSpeed: 280,
        powerBonus: 1,
        damageMult: 1.2,
        lives: 2,
        bombs: 3,
        unlockAfterLevel: 8,
        hint: '通关第 8 关解锁'
    }
];

export function getMecha(id: string): MechaConfig {
    return MECHAS.find(m => m.id === id) ?? MECHAS[0];
}
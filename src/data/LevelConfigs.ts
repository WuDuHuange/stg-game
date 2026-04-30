/**
 * 关卡配置数据
 * 定义游戏中所有关卡的敌人配置、Boss设计和关卡流程
 */

import { EnemyType as EnemyCategory, EnemyRarity, WeakPointConfig as EnemyDataWeakPoint } from './EnemyData';

// 重新导出以保持向后兼容
export { EnemyCategory, EnemyRarity };

/**
 * 关卡专用弱点配置（简化版，用于关卡配置）
 */
export interface WeakPointConfig {
    offsetX: number;
    offsetY: number;
    radius: number;
    damageMultiplier: number;
}

/**
 * 敌人配置
 */
export interface EnemyConfig {
    id: string;
    name: string;
    category: EnemyCategory;
    rarity: EnemyRarity;
    health: number;
    damage: number;
    speed: number;
    score: number;
    experience: number;
    color: number;
    radius: number;
    spawnWeight: number;   // 生成权重，越高越容易生成
    weakPoints?: WeakPointConfig[];
}

/**
 * 弱点配置
 */
export interface WeakPointConfig {
    offsetX: number;
    offsetY: number;
    radius: number;
    damageMultiplier: number;
}

/**
 * Boss阶段配置
 */
export interface BossPhaseConfig {
    healthThreshold: number;  // 血量百分比阈值
    speed: number;
    damage: number;
    attackInterval: number;   // 攻击间隔（毫秒）
    bulletCount: number;      // 弹幕数量
    bulletSpeed: number;
    bulletPattern: 'spread' | 'circle' | 'spiral' | 'aimed';
}

/**
 * Boss配置
 */
export interface BossConfig extends EnemyConfig {
    phases: BossPhaseConfig[];
}

/**
 * 关卡波次配置
 */
export interface WaveConfig {
    enemies: { id: string; count: number }[];
    delay: number;           // 波次开始延迟（毫秒）
    spawnInterval: number;   // 敌人生成间隔（毫秒）
}

/**
 * 关卡配置
 */
export interface LevelConfig {
    id: string;
    name: string;
    description: string;
    isBossLevel: boolean;
    waves: WaveConfig[];
    bossId?: string;         // Boss关卡的Boss ID
    backgroundSpeed: number; // 背景滚动速度
    recommendedLevel: number;
}

// ==================== 敌人配置数据 ====================

const ENEMY_DATABASE: EnemyConfig[] = [
    // 轻型单位
    {
        id: 'light_scout',
        name: '侦察机',
        category: EnemyCategory.LIGHT,
        rarity: EnemyRarity.COMMON,
        health: 15,
        damage: 5,
        speed: 120,
        score: 50,
        experience: 5,
        color: 0xff4444,
        radius: 12,
        spawnWeight: 10
    },
    {
        id: 'light_drone',
        name: '无人机',
        category: EnemyCategory.LIGHT,
        rarity: EnemyRarity.COMMON,
        health: 20,
        damage: 8,
        speed: 100,
        score: 80,
        experience: 8,
        color: 0xff6644,
        radius: 14,
        spawnWeight: 8
    },
    {
        id: 'light_interceptor',
        name: '拦截机',
        category: EnemyCategory.LIGHT,
        rarity: EnemyRarity.ELITE,
        health: 30,
        damage: 12,
        speed: 150,
        score: 150,
        experience: 15,
        color: 0xff8800,
        radius: 13,
        spawnWeight: 3,
        weakPoints: [{ offsetX: 0, offsetY: -5, radius: 5, damageMultiplier: 2.0 }]
    },

    // 重型单位
    {
        id: 'heavy_tank',
        name: '装甲坦克',
        category: EnemyCategory.HEAVY,
        rarity: EnemyRarity.COMMON,
        health: 60,
        damage: 15,
        speed: 40,
        score: 120,
        experience: 12,
        color: 0x8844ff,
        radius: 22,
        spawnWeight: 5
    },
    {
        id: 'heavy_fortress',
        name: '移动堡垒',
        category: EnemyCategory.HEAVY,
        rarity: EnemyRarity.ELITE,
        health: 100,
        damage: 20,
        speed: 30,
        score: 250,
        experience: 25,
        color: 0x6644cc,
        radius: 28,
        spawnWeight: 2,
        weakPoints: [
            { offsetX: -10, offsetY: 0, radius: 6, damageMultiplier: 2.5 },
            { offsetX: 10, offsetY: 0, radius: 6, damageMultiplier: 2.5 }
        ]
    },

    // 精英单位
    {
        id: 'elite_commander',
        name: '指挥官',
        category: EnemyCategory.ELITE,
        rarity: EnemyRarity.RARE,
        health: 80,
        damage: 18,
        speed: 70,
        score: 300,
        experience: 30,
        color: 0xffd700,
        radius: 18,
        spawnWeight: 1,
        weakPoints: [{ offsetX: 0, offsetY: -8, radius: 7, damageMultiplier: 3.0 }]
    },
    {
        id: 'elite_assassin',
        name: '暗杀者',
        category: EnemyCategory.ELITE,
        rarity: EnemyRarity.RARE,
        health: 50,
        damage: 25,
        speed: 130,
        score: 350,
        experience: 35,
        color: 0x00ff88,
        radius: 15,
        spawnWeight: 1,
        weakPoints: [{ offsetX: 0, offsetY: 0, radius: 5, damageMultiplier: 3.0 }]
    }
];

// ==================== Boss配置数据 ====================

const BOSS_DATABASE: BossConfig[] = [
    {
        id: 'boss_guardian',
        name: '守卫者·零式',
        category: EnemyCategory.BOSS,
        rarity: EnemyRarity.BOSS,
        health: 500,
        damage: 15,
        speed: 30,
        score: 2000,
        experience: 200,
        color: 0xff0000,
        radius: 40,
        spawnWeight: 0,
        phases: [
            {
                healthThreshold: 1.0,
                speed: 30,
                damage: 10,
                attackInterval: 2000,
                bulletCount: 5,
                bulletSpeed: 150,
                bulletPattern: 'spread'
            },
            {
                healthThreshold: 0.6,
                speed: 40,
                damage: 15,
                attackInterval: 1500,
                bulletCount: 8,
                bulletSpeed: 180,
                bulletPattern: 'circle'
            },
            {
                healthThreshold: 0.3,
                speed: 50,
                damage: 20,
                attackInterval: 1000,
                bulletCount: 12,
                bulletSpeed: 200,
                bulletPattern: 'spiral'
            }
        ]
    },
    {
        id: 'boss_destroyer',
        name: '毁灭者·壹式',
        category: EnemyCategory.BOSS,
        rarity: EnemyRarity.BOSS,
        health: 800,
        damage: 20,
        speed: 25,
        score: 5000,
        experience: 500,
        color: 0xff00ff,
        radius: 50,
        spawnWeight: 0,
        phases: [
            {
                healthThreshold: 1.0,
                speed: 25,
                damage: 15,
                attackInterval: 1800,
                bulletCount: 3,
                bulletSpeed: 200,
                bulletPattern: 'aimed'
            },
            {
                healthThreshold: 0.5,
                speed: 35,
                damage: 20,
                attackInterval: 1200,
                bulletCount: 10,
                bulletSpeed: 160,
                bulletPattern: 'circle'
            },
            {
                healthThreshold: 0.25,
                speed: 45,
                damage: 25,
                attackInterval: 800,
                bulletCount: 16,
                bulletSpeed: 220,
                bulletPattern: 'spiral'
            }
        ]
    }
];

// ==================== 关卡配置数据 ====================

const LEVEL_DATABASE: LevelConfig[] = [
    {
        id: 'level_1',
        name: '初次接触',
        description: '基础的侦察机群，适应战斗节奏',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'light_scout', count: 5 }
                ],
                delay: 0,
                spawnInterval: 2000
            },
            {
                enemies: [
                    { id: 'light_scout', count: 3 },
                    { id: 'light_drone', count: 2 }
                ],
                delay: 15000,
                spawnInterval: 1800
            }
        ],
        backgroundSpeed: 1,
        recommendedLevel: 1
    },
    {
        id: 'level_2',
        name: '防线突破',
        description: '重型单位出现，需要更强的火力',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'light_drone', count: 4 },
                    { id: 'heavy_tank', count: 1 }
                ],
                delay: 0,
                spawnInterval: 2000
            },
            {
                enemies: [
                    { id: 'light_scout', count: 3 },
                    { id: 'light_drone', count: 3 },
                    { id: 'heavy_tank', count: 2 }
                ],
                delay: 20000,
                spawnInterval: 1500
            }
        ],
        backgroundSpeed: 1.2,
        recommendedLevel: 3
    },
    {
        id: 'level_3',
        name: '守卫者降临',
        description: '第一个Boss出现！准备迎接挑战',
        isBossLevel: true,
        waves: [
            {
                enemies: [
                    { id: 'light_scout', count: 3 }
                ],
                delay: 0,
                spawnInterval: 2000
            }
        ],
        bossId: 'boss_guardian',
        backgroundSpeed: 0.5,
        recommendedLevel: 5
    },
    {
        id: 'level_4',
        name: '精英猎杀',
        description: '精英单位登场，弱点系统至关重要',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'light_interceptor', count: 3 },
                    { id: 'heavy_tank', count: 2 }
                ],
                delay: 0,
                spawnInterval: 1800
            },
            {
                enemies: [
                    { id: 'elite_commander', count: 1 },
                    { id: 'light_drone', count: 4 }
                ],
                delay: 20000,
                spawnInterval: 1500
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 2 },
                    { id: 'heavy_fortress', count: 1 }
                ],
                delay: 40000,
                spawnInterval: 1200
            }
        ],
        backgroundSpeed: 1.5,
        recommendedLevel: 8
    },
    {
        id: 'level_5',
        name: '最终决战',
        description: '面对毁灭者，这是最终的考验',
        isBossLevel: true,
        waves: [
            {
                enemies: [
                    { id: 'elite_commander', count: 1 },
                    { id: 'light_interceptor', count: 3 }
                ],
                delay: 0,
                spawnInterval: 1500
            }
        ],
        bossId: 'boss_destroyer',
        backgroundSpeed: 0.3,
        recommendedLevel: 12
    }
];

// ==================== 查询函数 ====================

/**
 * 获取敌人配置
 */
export function getEnemyConfig(id: string): EnemyConfig | undefined {
    return ENEMY_DATABASE.find(e => e.id === id);
}

/**
 * 获取Boss配置
 */
export function getBossConfig(id: string): BossConfig | undefined {
    return BOSS_DATABASE.find(b => b.id === id);
}

/**
 * 获取关卡配置
 */
export function getLevelConfig(id: string): LevelConfig | undefined {
    return LEVEL_DATABASE.find(l => l.id === id);
}

/**
 * 获取所有关卡配置
 */
export function getAllLevels(): LevelConfig[] {
    return [...LEVEL_DATABASE];
}

/**
 * 根据稀有度获取随机敌人
 */
export function getRandomEnemyByRarity(rarity?: EnemyRarity): EnemyConfig | undefined {
    let pool = ENEMY_DATABASE;
    if (rarity) {
        pool = pool.filter(e => e.rarity === rarity);
    }

    // 按权重随机选择
    const totalWeight = pool.reduce((sum, e) => sum + e.spawnWeight, 0);
    let random = Math.random() * totalWeight;

    for (const enemy of pool) {
        random -= enemy.spawnWeight;
        if (random <= 0) {
            return enemy;
        }
    }

    return pool[0];
}

/**
 * 获取适合当前等级的敌人
 */
export function getEnemiesForLevel(level: number): EnemyConfig[] {
    if (level <= 2) {
        return ENEMY_DATABASE.filter(e => e.category === EnemyCategory.LIGHT && e.rarity === EnemyRarity.COMMON);
    } else if (level <= 5) {
        return ENEMY_DATABASE.filter(e =>
            e.rarity === EnemyRarity.COMMON ||
            (e.rarity === EnemyRarity.ELITE && e.category !== EnemyCategory.BOSS)
        );
    } else {
        return ENEMY_DATABASE.filter(e => e.rarity !== EnemyRarity.BOSS);
    }
}

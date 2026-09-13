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
    },
    {
        id: 'boss_sentinel',
        name: '哨兵·贰式',
        category: EnemyCategory.BOSS,
        rarity: EnemyRarity.BOSS,
        health: 1200,
        damage: 25,
        speed: 35,
        score: 8000,
        experience: 800,
        color: 0x44aaff,
        radius: 44,
        spawnWeight: 0,
        phases: [
            {
                healthThreshold: 1.0,
                speed: 35,
                damage: 15,
                attackInterval: 1600,
                bulletCount: 6,
                bulletSpeed: 170,
                bulletPattern: 'spread'
            },
            {
                healthThreshold: 0.65,
                speed: 45,
                damage: 22,
                attackInterval: 1000,
                bulletCount: 12,
                bulletSpeed: 190,
                bulletPattern: 'circle'
            },
            {
                healthThreshold: 0.3,
                speed: 55,
                damage: 28,
                attackInterval: 650,
                bulletCount: 20,
                bulletSpeed: 230,
                bulletPattern: 'spiral'
            }
        ]
    },
    {
        id: 'boss_overseer',
        name: '守望者·零式',
        category: EnemyCategory.BOSS,
        rarity: EnemyRarity.BOSS,
        health: 2000,
        damage: 30,
        speed: 30,
        score: 15000,
        experience: 1500,
        color: 0xff44aa,
        radius: 56,
        spawnWeight: 0,
        phases: [
            {
                healthThreshold: 1.0,
                speed: 30,
                damage: 18,
                attackInterval: 1400,
                bulletCount: 8,
                bulletSpeed: 190,
                bulletPattern: 'ring'
            },
            {
                healthThreshold: 0.75,
                speed: 40,
                damage: 24,
                attackInterval: 900,
                bulletCount: 14,
                bulletSpeed: 210,
                bulletPattern: 'aimed'
            },
            {
                healthThreshold: 0.45,
                speed: 50,
                damage: 30,
                attackInterval: 600,
                bulletCount: 24,
                bulletSpeed: 240,
                bulletPattern: 'spiral'
            },
            {
                healthThreshold: 0.2,
                speed: 55,
                damage: 35,
                attackInterval: 450,
                bulletCount: 32,
                bulletSpeed: 270,
                bulletPattern: 'laser'
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
                    { id: 'light_scout', count: 4 }
                ],
                delay: 0,
                spawnInterval: 2000
            },
            {
                enemies: [
                    { id: 'light_scout', count: 3 },
                    { id: 'light_drone', count: 2 }
                ],
                delay: 8000,
                spawnInterval: 1800
            },
            {
                enemies: [
                    { id: 'light_drone', count: 4 },
                    { id: 'light_scout', count: 3 }
                ],
                delay: 8000,
                spawnInterval: 1500
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
                    { id: 'light_drone', count: 3 },
                    { id: 'light_scout', count: 2 }
                ],
                delay: 0,
                spawnInterval: 1800
            },
            {
                enemies: [
                    { id: 'light_scout', count: 3 },
                    { id: 'heavy_tank', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 1600
            },
            {
                enemies: [
                    { id: 'light_drone', count: 4 },
                    { id: 'heavy_tank', count: 2 }
                ],
                delay: 8000,
                spawnInterval: 1400
            },
            {
                enemies: [
                    { id: 'light_interceptor', count: 2 },
                    { id: 'heavy_tank', count: 2 },
                    { id: 'light_scout', count: 3 }
                ],
                delay: 8000,
                spawnInterval: 1200
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
                    { id: 'light_scout', count: 3 },
                    { id: 'light_drone', count: 2 }
                ],
                delay: 0,
                spawnInterval: 1800
            },
            {
                enemies: [
                    { id: 'light_interceptor', count: 2 },
                    { id: 'heavy_tank', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 1500
            },
            {
                enemies: [
                    { id: 'light_drone', count: 3 },
                    { id: 'boss_guardian', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 3000
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
                    { id: 'heavy_tank', count: 1 }
                ],
                delay: 0,
                spawnInterval: 1600
            },
            {
                enemies: [
                    { id: 'elite_commander', count: 1 },
                    { id: 'light_drone', count: 3 }
                ],
                delay: 8000,
                spawnInterval: 1400
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 1 },
                    { id: 'light_interceptor', count: 3 },
                    { id: 'heavy_tank', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 1200
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 2 },
                    { id: 'elite_commander', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 1500
            }
        ],
        backgroundSpeed: 1.5,
        recommendedLevel: 8
    },
    {
        id: 'level_5',
        name: '钢铁洪流',
        description: '重型与精英单位的进攻，为迎战毁灭者做准备',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'elite_commander', count: 1 },
                    { id: 'light_interceptor', count: 3 }
                ],
                delay: 0,
                spawnInterval: 1500
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 2 },
                    { id: 'heavy_fortress', count: 1 },
                    { id: 'light_drone', count: 3 }
                ],
                delay: 8000,
                spawnInterval: 1200
            },
            {
                enemies: [
                    { id: 'elite_commander', count: 2 },
                    { id: 'heavy_fortress', count: 2 },
                    { id: 'elite_assassin', count: 2 }
                ],
                delay: 8000,
                spawnInterval: 1100
            }
        ],
        backgroundSpeed: 1.4,
        recommendedLevel: 12
    },
    {
        id: 'level_6',
        name: '毁灭者歼灭',
        description: '毁灭者·壹式露出真身，粉碎它！',
        isBossLevel: true,
        waves: [
            {
                enemies: [
                    { id: 'elite_commander', count: 1 },
                    { id: 'heavy_tank', count: 2 },
                    { id: 'light_interceptor', count: 2 }
                ],
                delay: 0,
                spawnInterval: 1400
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 2 },
                    { id: 'heavy_fortress', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 1200
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 1 },
                    { id: 'elite_commander', count: 1 },
                    { id: 'boss_destroyer', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 3000
            }
        ],
        bossId: 'boss_destroyer',
        backgroundSpeed: 0.3,
        recommendedLevel: 16
    },
    {
        id: 'level_7',
        name: '突袭风口',
        description: '敌军增援涌入，弹幕密度骤然提升',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'light_drone', count: 5 },
                    { id: 'light_interceptor', count: 2 }
                ],
                delay: 0,
                spawnInterval: 1300
            },
            {
                enemies: [
                    { id: 'heavy_tank', count: 2 },
                    { id: 'light_drone', count: 4 }
                ],
                delay: 8000,
                spawnInterval: 1100
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 3 },
                    { id: 'heavy_fortress', count: 2 },
                    { id: 'light_interceptor', count: 3 }
                ],
                delay: 8000,
                spawnInterval: 1000
            }
        ],
        backgroundSpeed: 1.7,
        recommendedLevel: 18
    },
    {
        id: 'level_8',
        name: '黑暗走廊',
        description: '精英与重装的绞肉机，考验极限走位',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'elite_commander', count: 2 },
                    { id: 'light_drone', count: 4 }
                ],
                delay: 0,
                spawnInterval: 1200
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 3 },
                    { id: 'elite_assassin', count: 2 }
                ],
                delay: 8000,
                spawnInterval: 1000
            },
            {
                enemies: [
                    { id: 'elite_commander', count: 2 },
                    { id: 'elite_assassin', count: 3 },
                    { id: 'heavy_tank', count: 3 }
                ],
                delay: 8000,
                spawnInterval: 900
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 2 },
                    { id: 'elite_assassin', count: 2 },
                    { id: 'light_interceptor', count: 4 }
                ],
                delay: 8000,
                spawnInterval: 850
            }
        ],
        backgroundSpeed: 1.8,
        recommendedLevel: 20
    },
    {
        id: 'level_9',
        name: '风暴之眼',
        description: '哨兵·贰式镇守前线，全力应战',
        isBossLevel: true,
        waves: [
            {
                enemies: [
                    { id: 'elite_commander', count: 2 },
                    { id: 'heavy_fortress', count: 1 },
                    { id: 'light_drone', count: 3 }
                ],
                delay: 0,
                spawnInterval: 1200
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 3 },
                    { id: 'heavy_fortress', count: 2 }
                ],
                delay: 8000,
                spawnInterval: 1000
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 1 },
                    { id: 'elite_commander', count: 2 },
                    { id: 'boss_sentinel', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 3000
            }
        ],
        bossId: 'boss_sentinel',
        backgroundSpeed: 0.4,
        recommendedLevel: 24
    },
    {
        id: 'level_10',
        name: '噪音',
        description: '阴影中的杂音渐强，最后的防线动员',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'light_drone', count: 6 },
                    { id: 'light_interceptor', count: 4 }
                ],
                delay: 0,
                spawnInterval: 1000
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 3 },
                    { id: 'heavy_fortress', count: 2 },
                    { id: 'elite_commander', count: 1 }
                ],
                delay: 8000,
                spawnInterval: 900
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 3 },
                    { id: 'elite_assassin', count: 3 },
                    { id: 'light_interceptor', count: 4 }
                ],
                delay: 8000,
                spawnInterval: 850
            }
        ],
        backgroundSpeed: 2.0,
        recommendedLevel: 27
    },
    {
        id: 'level_11',
        name: '深渊回响',
        description: '敌影层叠，弹幕如潮——感受终战前夜',
        isBossLevel: false,
        waves: [
            {
                enemies: [
                    { id: 'elite_commander', count: 3 },
                    { id: 'heavy_fortress', count: 2 },
                    { id: 'heavy_tank', count: 3 }
                ],
                delay: 0,
                spawnInterval: 1000
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 4 },
                    { id: 'light_drone', count: 5 }
                ],
                delay: 8000,
                spawnInterval: 900
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 4 },
                    { id: 'elite_commander', count: 3 },
                    { id: 'elite_assassin', count: 3 }
                ],
                delay: 8000,
                spawnInterval: 800
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 4 },
                    { id: 'heavy_fortress', count: 2 },
                    { id: 'elite_commander', count: 2 }
                ],
                delay: 8000,
                spawnInterval: 750
            }
        ],
        backgroundSpeed: 2.2,
        recommendedLevel: 30
    },
    {
        id: 'level_12',
        name: '终焉审判',
        description: '守望者·零式降临——跨越最后的弹幕之海',
        isBossLevel: true,
        waves: [
            {
                enemies: [
                    { id: 'elite_commander', count: 2 },
                    { id: 'heavy_fortress', count: 3 },
                    { id: 'elite_assassin', count: 2 }
                ],
                delay: 0,
                spawnInterval: 1000
            },
            {
                enemies: [
                    { id: 'heavy_fortress', count: 3 },
                    { id: 'elite_assassin', count: 4 },
                    { id: 'light_interceptor', count: 4 }
                ],
                delay: 8000,
                spawnInterval: 850
            },
            {
                enemies: [
                    { id: 'elite_assassin', count: 2 },
                    { id: 'heavy_fortress', count: 2 },
                    { id: 'boss_overseer', count: 1 }
                ],
                delay: 10000,
                spawnInterval: 3000
            }
        ],
        bossId: 'boss_overseer',
        backgroundSpeed: 0.3,
        recommendedLevel: 35
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

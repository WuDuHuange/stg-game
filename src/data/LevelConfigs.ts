/**
 * 关卡配置数据
 * 定义游戏中所有关卡的流程、敌人波次和Boss配置
 */

/** 波次配置接口 */
export interface WaveConfig {
    waveNumber: number;
    enemies: WaveEnemy[];
    duration: number;        // 波次持续时间（毫秒）
    spawnInterval: number;   // 敌人生成间隔（毫秒）
}

/** 波次敌人配置接口 */
export interface WaveEnemy {
    enemyId: string;         // 对应EnemyConfigs中的key
    count: number;           // 数量
    spawnDelay?: number;     // 生成延迟（毫秒）
}

/** Boss阶段配置接口 */
export interface BossPhaseConfig {
    phase: number;
    healthThreshold: number; // 血量阈值（百分比）
    bulletPattern: string;
    bulletSpeed: number;
    bulletDamage: number;
    fireRate: number;
    specialAttack?: string;  // 特殊攻击名称
}

/** 关卡配置接口 */
export interface LevelConfig {
    level: number;
    name: string;
    description: string;
    background: number;      // 背景颜色
    waves: WaveConfig[];
    boss?: {
        enemyId: string;
        phases: BossPhaseConfig[];
    };
    totalDuration: number;   // 关卡总时长（毫秒）
    difficultyMultiplier: number;
}

/** 关卡配置表 */
export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
    1: {
        level: 1,
        name: '初次接触',
        description: '击退入侵的侦察部队',
        background: 0x0a0a15,
        waves: [
            {
                waveNumber: 1,
                enemies: [
                    { enemyId: 'light_drone', count: 5 }
                ],
                duration: 15000,
                spawnInterval: 2000
            },
            {
                waveNumber: 2,
                enemies: [
                    { enemyId: 'light_drone', count: 8 },
                    { enemyId: 'light_scout', count: 2 }
                ],
                duration: 20000,
                spawnInterval: 1500
            },
            {
                waveNumber: 3,
                enemies: [
                    { enemyId: 'light_scout', count: 5 },
                    { enemyId: 'light_drone', count: 5 }
                ],
                duration: 20000,
                spawnInterval: 1200
            }
        ],
        boss: {
            enemyId: 'boss_guardian',
            phases: [
                {
                    phase: 1,
                    healthThreshold: 1.0,
                    bulletPattern: 'spiral',
                    bulletSpeed: 120,
                    bulletDamage: 10,
                    fireRate: 800
                },
                {
                    phase: 2,
                    healthThreshold: 0.5,
                    bulletPattern: 'circle',
                    bulletSpeed: 150,
                    bulletDamage: 15,
                    fireRate: 600,
                    specialAttack: 'laser_sweep'
                }
            ]
        },
        totalDuration: 60000,
        difficultyMultiplier: 1.0
    },
    2: {
        level: 2,
        name: '钢铁洪流',
        description: '重型装甲部队来袭',
        background: 0x0f0a15,
        waves: [
            {
                waveNumber: 1,
                enemies: [
                    { enemyId: 'light_drone', count: 8 },
                    { enemyId: 'light_chaser', count: 3 }
                ],
                duration: 15000,
                spawnInterval: 1500
            },
            {
                waveNumber: 2,
                enemies: [
                    { enemyId: 'heavy_tank', count: 3 },
                    { enemyId: 'light_scout', count: 5 }
                ],
                duration: 20000,
                spawnInterval: 2000
            },
            {
                waveNumber: 3,
                enemies: [
                    { enemyId: 'heavy_tank', count: 4 },
                    { enemyId: 'light_chaser', count: 4 },
                    { enemyId: 'light_drone', count: 6 }
                ],
                duration: 25000,
                spawnInterval: 1000
            }
        ],
        boss: {
            enemyId: 'boss_guardian',
            phases: [
                {
                    phase: 1,
                    healthThreshold: 1.0,
                    bulletPattern: 'spread',
                    bulletSpeed: 140,
                    bulletDamage: 12,
                    fireRate: 700
                },
                {
                    phase: 2,
                    healthThreshold: 0.6,
                    bulletPattern: 'spiral',
                    bulletSpeed: 160,
                    bulletDamage: 15,
                    fireRate: 500
                },
                {
                    phase: 3,
                    healthThreshold: 0.3,
                    bulletPattern: 'circle',
                    bulletSpeed: 180,
                    bulletDamage: 20,
                    fireRate: 400,
                    specialAttack: 'bullet_hell'
                }
            ]
        },
        totalDuration: 75000,
        difficultyMultiplier: 1.3
    },
    3: {
        level: 3,
        name: '精英猎杀',
        description: '精英部队出动，小心弱点攻击',
        background: 0x150a1a,
        waves: [
            {
                waveNumber: 1,
                enemies: [
                    { enemyId: 'light_chaser', count: 5 },
                    { enemyId: 'heavy_tank', count: 2 }
                ],
                duration: 15000,
                spawnInterval: 1500
            },
            {
                waveNumber: 2,
                enemies: [
                    { enemyId: 'elite_commander', count: 1 },
                    { enemyId: 'heavy_artillery', count: 2 },
                    { enemyId: 'light_scout', count: 5 }
                ],
                duration: 25000,
                spawnInterval: 1800
            },
            {
                waveNumber: 3,
                enemies: [
                    { enemyId: 'elite_commander', count: 2 },
                    { enemyId: 'heavy_tank', count: 3 },
                    { enemyId: 'light_chaser', count: 5 }
                ],
                duration: 30000,
                spawnInterval: 1200
            }
        ],
        boss: {
            enemyId: 'boss_destroyer',
            phases: [
                {
                    phase: 1,
                    healthThreshold: 1.0,
                    bulletPattern: 'circle',
                    bulletSpeed: 150,
                    bulletDamage: 15,
                    fireRate: 600
                },
                {
                    phase: 2,
                    healthThreshold: 0.7,
                    bulletPattern: 'spiral',
                    bulletSpeed: 170,
                    bulletDamage: 18,
                    fireRate: 400,
                    specialAttack: 'laser_sweep'
                },
                {
                    phase: 3,
                    healthThreshold: 0.4,
                    bulletPattern: 'circle',
                    bulletSpeed: 200,
                    bulletDamage: 22,
                    fireRate: 300,
                    specialAttack: 'bullet_hell'
                },
                {
                    phase: 4,
                    healthThreshold: 0.15,
                    bulletPattern: 'spiral',
                    bulletSpeed: 220,
                    bulletDamage: 25,
                    fireRate: 200,
                    specialAttack: 'final_attack'
                }
            ]
        },
        totalDuration: 90000,
        difficultyMultiplier: 1.6
    },
    4: {
        level: 4,
        name: '绝境逢生',
        description: '暗杀者出没，注意闪避',
        background: 0x1a0a20,
        waves: [
            {
                waveNumber: 1,
                enemies: [
                    { enemyId: 'elite_assassin', count: 2 },
                    { enemyId: 'light_chaser', count: 6 }
                ],
                duration: 20000,
                spawnInterval: 1200
            },
            {
                waveNumber: 2,
                enemies: [
                    { enemyId: 'elite_commander', count: 2 },
                    { enemyId: 'elite_assassin', count: 1 },
                    { enemyId: 'heavy_artillery', count: 3 }
                ],
                duration: 25000,
                spawnInterval: 1500
            },
            {
                waveNumber: 3,
                enemies: [
                    { enemyId: 'elite_assassin', count: 3 },
                    { enemyId: 'elite_commander', count: 2 },
                    { enemyId: 'heavy_tank', count: 4 }
                ],
                duration: 30000,
                spawnInterval: 1000
            }
        ],
        boss: {
            enemyId: 'boss_destroyer',
            phases: [
                {
                    phase: 1,
                    healthThreshold: 1.0,
                    bulletPattern: 'spread',
                    bulletSpeed: 180,
                    bulletDamage: 18,
                    fireRate: 500
                },
                {
                    phase: 2,
                    healthThreshold: 0.65,
                    bulletPattern: 'spiral',
                    bulletSpeed: 200,
                    bulletDamage: 22,
                    fireRate: 350,
                    specialAttack: 'laser_sweep'
                },
                {
                    phase: 3,
                    healthThreshold: 0.35,
                    bulletPattern: 'circle',
                    bulletSpeed: 220,
                    bulletDamage: 25,
                    fireRate: 250,
                    specialAttack: 'bullet_hell'
                },
                {
                    phase: 4,
                    healthThreshold: 0.1,
                    bulletPattern: 'spiral',
                    bulletSpeed: 250,
                    bulletDamage: 30,
                    fireRate: 150,
                    specialAttack: 'final_attack'
                }
            ]
        },
        totalDuration: 100000,
        difficultyMultiplier: 2.0
    }
};

/** 获取关卡配置 */
export function getLevelConfig(level: number): LevelConfig {
    return LEVEL_CONFIGS[level] || LEVEL_CONFIGS[1];
}

/** 获取最大关卡数 */
export function getMaxLevel(): number {
    return Object.keys(LEVEL_CONFIGS).length;
}

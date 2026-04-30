/**
 * 数据模块导出
 */

export {
  Weapon,
  WeaponData,
  WeaponStats,
  WeaponType,
  Rarity,
  SlotType,
  SpecialEffect,
  RarityColors,
  RarityNames,
  WeaponTypeNames,
  SlotTypeNames
} from './WeaponData';

export { WeaponLoader, weaponLoader } from './WeaponLoader';

export {
  SynergyData,
  WeaponRequirement,
  SynergyEffectType,
  SynergyEffect,
  ActiveSynergy,
  SynergyEffectTypeNames,
  SynergyRarityColors
} from './SynergyData';

export {
  Skill,
  SkillData,
  SkillType,
  SkillEffect,
  SkillEnhancement,
  SkillTypeNames
} from './SkillData';

export {
  PlayerStats,
  PlayerLevelData,
  StatType,
  ExperienceRewardEvent,
  LevelUpEvent
} from './PlayerData';

export {
  EnemyType,
  EnemyRarity as EnemyDataRarity,
  EnemyState,
  EnemyStats,
  WeakPointConfig as EnemyDataWeakPoint,
  BreakablePartConfig,
  AIBehaviorConfig,
  EnemyData,
  Enemy,
  EnemyTypeNames,
  EnemyRarityNames,
  EnemyRarityColors
} from './EnemyData';

export {
  EnemyBehavior,
  BulletPattern,
  EnemyRarity,
  EnemyConfig as EnemyConfigDetail,
  WeakPointConfig as EnemyConfigWeakPoint,
  ENEMY_CONFIGS,
  getEnemiesForLevel as getDetailedEnemiesForLevel,
  getBossForLevel
} from './EnemyConfigs';

export {
  EnemyCategory,
  EnemyConfig,
  WeakPointConfig,
  BossPhaseConfig,
  BossConfig,
  WaveConfig,
  LevelConfig,
  getEnemyConfig,
  getBossConfig,
  getLevelConfig,
  getAllLevels,
  getRandomEnemyByRarity,
  getEnemiesForLevel
} from './LevelConfigs';

/**
 * 玩家属性数据模型
 */

/**
 * 属性类型枚举
 */
export enum StatType {
  HEALTH = 'HEALTH',           // 生命值
  MAX_HEALTH = 'MAX_HEALTH',   // 最大生命值
  SHIELD = 'SHIELD',           // 护盾值
  MAX_SHIELD = 'MAX_SHIELD',   // 最大护盾值
  MOVEMENT_SPEED = 'MOVEMENT_SPEED', // 移动速度
  DAMAGE = 'DAMAGE',           // 伤害
  DEFENSE = 'DEFENSE',         // 防御
  CRITICAL_CHANCE = 'CRITICAL_CHANCE', // 暴击率
  CRITICAL_DAMAGE = 'CRITICAL_DAMAGE'   // 暴击伤害
}

/**
 * 玩家属性
 */
export interface PlayerStats {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  movementSpeed: number;
  damage: number;
  defense: number;
  criticalChance: number;
  criticalDamage: number;
}

/**
 * 玩家等级数据
 */
export interface PlayerLevelData {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalExperience: number;
}

/**
 * 经验值奖励事件
 */
export type ExperienceRewardEvent = {
  amount: number;
  source: string;
  timestamp: number;
};

/**
 * 升级事件
 */
export type LevelUpEvent = {
  oldLevel: number;
  newLevel: number;
  timestamp: number;
};

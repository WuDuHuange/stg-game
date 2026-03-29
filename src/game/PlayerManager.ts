/**
 * 玩家管理器
 * 管理玩家属性、经验值和升级
 */

import {
  PlayerStats,
  PlayerLevelData,
  StatType,
  ExperienceRewardEvent,
  LevelUpEvent
} from '@data/PlayerData';
import { logger } from '@utils/Logger';

/**
 * 经验值曲线类型
 */
enum ExperienceCurve {
  LINEAR = 'LINEAR',           // 线性增长
  EXPONENTIAL = 'EXPONENTIAL', // 指数增长
  CUSTOM = 'CUSTOM'            // 自定义
}

export class PlayerManager {
  private stats: PlayerStats;
  private levelData: PlayerLevelData;
  private experienceCurve: ExperienceCurve;
  private baseExperience: number;
  private experienceMultiplier: number;
  private eventListeners: Map<string, Array<(event: any) => void>>;

  constructor() {
    this.stats = this.createDefaultStats();
    this.levelData = {
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      totalExperience: 0
    };
    this.experienceCurve = ExperienceCurve.EXPONENTIAL;
    this.baseExperience = 100;
    this.experienceMultiplier = 1.5;
    this.eventListeners = new Map();
  }

  /**
   * 创建默认属性
   */
  private createDefaultStats(): PlayerStats {
    return {
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 0,
      movementSpeed: 300,
      damage: 10,
      defense: 0,
      criticalChance: 0.05,
      criticalDamage: 1.5
    };
  }

  /**
   * 获取玩家属性
   */
  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  /**
   * 获取指定属性
   */
  public getStat(statType: StatType): number {
    switch (statType) {
      case StatType.HEALTH:
        return this.stats.health;
      case StatType.MAX_HEALTH:
        return this.stats.maxHealth;
      case StatType.SHIELD:
        return this.stats.shield;
      case StatType.MAX_SHIELD:
        return this.stats.maxShield;
      case StatType.MOVEMENT_SPEED:
        return this.stats.movementSpeed;
      case StatType.DAMAGE:
        return this.stats.damage;
      case StatType.DEFENSE:
        return this.stats.defense;
      case StatType.CRITICAL_CHANCE:
        return this.stats.criticalChance;
      case StatType.CRITICAL_DAMAGE:
        return this.stats.criticalDamage;
      default:
        return 0;
    }
  }

  /**
   * 设置属性
   */
  public setStat(statType: StatType, value: number): void {
    switch (statType) {
      case StatType.HEALTH:
        this.stats.health = Math.min(value, this.stats.maxHealth);
        break;
      case StatType.MAX_HEALTH:
        this.stats.maxHealth = value;
        this.stats.health = Math.min(this.stats.health, value);
        break;
      case StatType.SHIELD:
        this.stats.shield = Math.min(value, this.stats.maxShield);
        break;
      case StatType.MAX_SHIELD:
        this.stats.maxShield = value;
        this.stats.shield = Math.min(this.stats.shield, value);
        break;
      case StatType.MOVEMENT_SPEED:
        this.stats.movementSpeed = value;
        break;
      case StatType.DAMAGE:
        this.stats.damage = value;
        break;
      case StatType.DEFENSE:
        this.stats.defense = value;
        break;
      case StatType.CRITICAL_CHANCE:
        this.stats.criticalChance = Math.min(1, Math.max(0, value));
        break;
      case StatType.CRITICAL_DAMAGE:
        this.stats.criticalDamage = value;
        break;
    }
  }

  /**
   * 增加属性
   */
  public addStat(statType: StatType, value: number): void {
    const current = this.getStat(statType);
    this.setStat(statType, current + value);
  }

  /**
   * 造成伤害
   */
  public takeDamage(damage: number): void {
    // 先扣护盾
    if (this.stats.shield > 0) {
      const shieldDamage = Math.min(this.stats.shield, damage);
      this.stats.shield -= shieldDamage;
      damage -= shieldDamage;
    }

    // 扣生命值（考虑防御）
    if (damage > 0) {
      const actualDamage = Math.max(1, damage - this.stats.defense);
      this.stats.health -= actualDamage;
    }

    // 确保生命值不为负
    this.stats.health = Math.max(0, this.stats.health);

    logger.debug(`Player took damage: ${damage}, Health: ${this.stats.health}, Shield: ${this.stats.shield}`);
  }

  /**
   * 恢复生命值
   */
  public heal(amount: number): void {
    const oldHealth = this.stats.health;
    this.stats.health = Math.min(this.stats.health + amount, this.stats.maxHealth);
    const healed = this.stats.health - oldHealth;
    logger.debug(`Player healed: ${healed}, Health: ${this.stats.health}`);
  }

  /**
   * 恢复护盾
   */
  public restoreShield(amount: number): void {
    const oldShield = this.stats.shield;
    this.stats.shield = Math.min(this.stats.shield + amount, this.stats.maxShield);
    const restored = this.stats.shield - oldShield;
    logger.debug(`Shield restored: ${restored}, Shield: ${this.stats.shield}`);
  }

  /**
   * 检查是否存活
   */
  public isAlive(): boolean {
    return this.stats.health > 0;
  }

  /**
   * 获取等级数据
   */
  public getLevelData(): PlayerLevelData {
    return { ...this.levelData };
  }

  /**
   * 获取当前等级
   */
  public getLevel(): number {
    return this.levelData.level;
  }

  /**
   * 获取当前经验值
   */
  public getExperience(): number {
    return this.levelData.experience;
  }

  /**
   * 获取升级所需经验值
   */
  public getExperienceToNextLevel(): number {
    return this.levelData.experienceToNextLevel;
  }

  /**
   * 获取总经验值
   */
  public getTotalExperience(): number {
    return this.levelData.totalExperience;
  }

  /**
   * 计算升级所需经验值
   */
  private calculateExperienceForLevel(level: number): number {
    switch (this.experienceCurve) {
      case ExperienceCurve.LINEAR:
        return this.baseExperience * level;
      case ExperienceCurve.EXPONENTIAL:
        return Math.floor(this.baseExperience * Math.pow(this.experienceMultiplier, level - 1));
      case ExperienceCurve.CUSTOM:
        // 自定义曲线
        return Math.floor(this.baseExperience * (1 + (level - 1) * 0.5));
      default:
        return this.baseExperience * level;
    }
  }

  /**
   * 添加经验值
   */
  public addExperience(amount: number, source: string = 'unknown'): boolean {
    const oldLevel = this.levelData.level;
    
    this.levelData.experience += amount;
    this.levelData.totalExperience += amount;

    // 触发经验值奖励事件
    this.dispatchEvent('experienceReward', {
      amount,
      source,
      timestamp: Date.now()
    });

    // 检查是否升级
    this.checkLevelUp();

    // 检查是否升级
    if (this.levelData.level > oldLevel) {
      this.dispatchEvent('levelUp', {
        oldLevel,
        newLevel: this.levelData.level,
        timestamp: Date.now()
      });
      
      logger.info(`Level up! ${oldLevel} -> ${this.levelData.level}`);
      return true;
    }

    return false;
  }

  /**
   * 检查是否升级
   */
  private checkLevelUp(): void {
    while (this.levelData.experience >= this.levelData.experienceToNextLevel) {
      this.levelUp();
    }
  }

  /**
   * 升级
   */
  private levelUp(): void {
    const oldLevel = this.levelData.level;
    this.levelData.level++;
    this.levelData.experience -= this.levelData.experienceToNextLevel;
    this.levelData.experienceToNextLevel = this.calculateExperienceForLevel(this.levelData.level + 1);

    // 提升属性
    this.increaseStatsOnLevelUp();

    logger.info(`Player leveled up to ${this.levelData.level}`);
  }

  /**
   * 升级时提升属性
   */
  private increaseStatsOnLevelUp(): void {
    // 每级提升的属性
    this.stats.maxHealth += 10;
    this.stats.health = this.stats.maxHealth;
    this.stats.damage += 2;
    this.stats.defense += 1;
    this.stats.movementSpeed += 5;

    logger.debug('Stats increased on level up');
  }

  /**
   * 设置经验值曲线
   */
  public setExperienceCurve(curve: ExperienceCurve): void {
    this.experienceCurve = curve;
    logger.info(`Experience curve set to: ${curve}`);
  }

  /**
   * 设置基础经验值
   */
  public setBaseExperience(base: number): void {
    this.baseExperience = Math.max(1, base);
    logger.info(`Base experience set to: ${this.baseExperience}`);
  }

  /**
   * 设置经验值倍率
   */
  public setExperienceMultiplier(multiplier: number): void {
    this.experienceMultiplier = Math.max(1, multiplier);
    logger.info(`Experience multiplier set to: ${this.experienceMultiplier}`);
  }

  /**
   * 重置玩家
   */
  public reset(): void {
    this.stats = this.createDefaultStats();
    this.levelData = {
      level: 1,
      experience: 0,
      experienceToNextLevel: this.calculateExperienceForLevel(2),
      totalExperience: 0
    };
    logger.info('Player reset');
  }

  /**
   * 注册事件监听器
   */
  public on(eventType: string, callback: (event: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  public off(eventType: string, callback: (event: any) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 分发事件
   */
  private dispatchEvent(eventType: string, event: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          logger.error('Error in player event listener', error);
        }
      });
    }
  }

  /**
   * 保存玩家状态
   */
  public saveState(): object {
    return {
      stats: this.stats,
      levelData: this.levelData,
      experienceCurve: this.experienceCurve,
      baseExperience: this.baseExperience,
      experienceMultiplier: this.experienceMultiplier
    };
  }

  /**
   * 加载玩家状态
   */
  public loadState(state: any): void {
    if (!state) {
      logger.warn('No player state to load');
      return;
    }

    if (state.stats) {
      this.stats = state.stats;
    }
    if (state.levelData) {
      this.levelData = state.levelData;
    }
    if (state.experienceCurve) {
      this.experienceCurve = state.experienceCurve;
    }
    if (state.baseExperience) {
      this.baseExperience = state.baseExperience;
    }
    if (state.experienceMultiplier) {
      this.experienceMultiplier = state.experienceMultiplier;
    }

    logger.info('Player state loaded');
  }

  /**
   * 获取玩家统计信息
   */
  public getPlayerStats(): any {
    return {
      level: this.levelData.level,
      experience: this.levelData.experience,
      totalExperience: this.levelData.totalExperience,
      health: this.stats.health,
      maxHealth: this.stats.maxHealth,
      shield: this.stats.shield,
      maxShield: this.stats.maxShield,
      damage: this.stats.damage,
      defense: this.stats.defense,
      criticalChance: this.stats.criticalChance,
      criticalDamage: this.stats.criticalDamage,
      movementSpeed: this.stats.movementSpeed
    };
  }

  /**
   * 销毁玩家管理器
   */
  public destroy(): void {
    this.eventListeners.clear();
    logger.info('PlayerManager destroyed');
  }
}

// 导出单例实例
export const playerManager = new PlayerManager();

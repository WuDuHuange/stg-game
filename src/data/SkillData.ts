/**
 * 技能数据模型
 */

/**
 * 技能类型枚举
 */
export enum SkillType {
  ACTIVE = 'ACTIVE',   // 主动技能
  PASSIVE = 'PASSIVE', // 被动技能
  ULTIMATE = 'ULTIMATE' // 终极技能
}

/**
 * 技能基础效果
 */
export interface SkillEffect {
  damage: number;
  duration: number;
  range: number;
  cooldown: number;
}

/**
 * 技能强化效果（每级提升）
 */
export interface SkillEnhancement {
  damageBonus: number;
  durationBonus: number;
  cooldownReduction: number;
}

/**
 * 技能数据
 */
export interface SkillData {
  skillId: string;
  name: string;
  type: SkillType;
  description: string;
  baseEffect: SkillEffect;
  enhancementPerLevel: SkillEnhancement;
  iconPath: string;
  effectPath: string;
  maxEnhancementLevel: number;
}

/**
 * 技能实例
 */
export class Skill {
  private data: SkillData;
  private enhancementLevel: number;
  private currentCooldown: number;

  constructor(data: SkillData, enhancementLevel: number = 0) {
    this.data = data;
    this.enhancementLevel = enhancementLevel;
    this.currentCooldown = 0;
  }

  /**
   * 获取技能数据
   */
  public getData(): SkillData {
    return this.data;
  }

  /**
   * 获取技能ID
   */
  public getSkillId(): string {
    return this.data.skillId;
  }

  /**
   * 获取技能名称
   */
  public getName(): string {
    return this.data.name;
  }

  /**
   * 获取技能类型
   */
  public getType(): SkillType {
    return this.data.type;
  }

  /**
   * 获取强化等级
   */
  public getEnhancementLevel(): number {
    return this.enhancementLevel;
  }

  /**
   * 设置强化等级
   */
  public setEnhancementLevel(level: number): void {
    this.enhancementLevel = Math.min(level, this.data.maxEnhancementLevel);
  }

  /**
   * 增加强化等级
   */
  public enhance(): boolean {
    if (this.enhancementLevel >= this.data.maxEnhancementLevel) {
      return false;
    }
    this.enhancementLevel++;
    return true;
  }

  /**
   * 获取当前效果（包含强化加成）
   */
  public getEffect(): SkillEffect {
    const effect = { ...this.data.baseEffect };
    const bonus = this.getEnhancementBonus();

    effect.damage *= (1 + bonus.damageBonus);
    effect.duration *= (1 + bonus.durationBonus);
    effect.cooldown *= (1 - bonus.cooldownReduction);

    return effect;
  }

  /**
   * 获取强化加成
   */
  private getEnhancementBonus(): SkillEnhancement {
    const bonus = {
      damageBonus: this.enhancementLevel * this.data.enhancementPerLevel.damageBonus,
      durationBonus: this.enhancementLevel * this.data.enhancementPerLevel.durationBonus,
      cooldownReduction: this.enhancementLevel * this.data.enhancementPerLevel.cooldownReduction
    };

    return bonus;
  }

  /**
   * 获取当前冷却时间
   */
  public getCurrentCooldown(): number {
    return this.currentCooldown;
  }

  /**
   * 设置冷却时间
   */
  public setCurrentCooldown(cooldown: number): void {
    this.currentCooldown = Math.max(0, cooldown);
  }

  /**
   * 检查是否在冷却中
   */
  public isOnCooldown(): boolean {
    return this.currentCooldown > 0;
  }

  /**
   * 更新冷却时间
   */
  public updateCooldown(deltaTime: number): void {
    if (this.currentCooldown > 0) {
      this.currentCooldown = Math.max(0, this.currentCooldown - deltaTime);
    }
  }

  /**
   * 检查是否已达到最大强化等级
   */
  public isMaxEnhanced(): boolean {
    return this.enhancementLevel >= this.data.maxEnhancementLevel;
  }

  /**
   * 序列化
   */
  public serialize(): object {
    return {
      skillId: this.data.skillId,
      enhancementLevel: this.enhancementLevel
    };
  }

  /**
   * 反序列化
   */
  public static deserialize(data: any, skillDatabase: Map<string, SkillData>): Skill | null {
    const skillData = skillDatabase.get(data.skillId);
    if (!skillData) {
      console.error(`Skill data not found: ${data.skillId}`);
      return null;
    }

    return new Skill(skillData, data.enhancementLevel || 0);
  }
}

/**
 * 技能类型名称映射
 */
export const SkillTypeNames: Record<SkillType, string> = {
  [SkillType.ACTIVE]: '主动技能',
  [SkillType.PASSIVE]: '被动技能',
  [SkillType.ULTIMATE]: '终极技能'
};

/**
 * 武装数据模型
 */

/**
 * 武装类型枚举
 */
export enum WeaponType {
  RANGED = 'RANGED',      // 远程武器
  MELEE = 'MELEE',        // 近战武器
  DEFENSE = 'DEFENSE',    // 防御武装
  SPECIAL = 'SPECIAL'     // 特殊武装
}

/**
 * 稀有度枚举
 */
export enum Rarity {
  COMMON = 'COMMON',      // 普通
  RARE = 'RARE',          // 稀有
  EPIC = 'EPIC',          // 史诗
  LEGENDARY = 'LEGENDARY' // 传说
}

/**
 * 槽位类型枚举
 */
export enum SlotType {
  HEAD = 'HEAD',          // 头部
  LEFT_HAND = 'LEFT_HAND', // 左手
  RIGHT_HAND = 'RIGHT_HAND', // 右手
  TORSO = 'TORSO',        // 躯干
  LEGS = 'LEGS'           // 腿部
}

/**
 * 武装基础属性
 */
export interface WeaponStats {
  damage: number;         // 伤害
  attackSpeed: number;    // 攻击速度（次/秒）
  range: number;          // 射程
  accuracy: number;       // 精准度（0-1）
  criticalChance: number; // 暴击率（0-1）
  criticalDamage: number; // 暴击伤害倍率
}

/**
 * 特殊效果
 */
export interface SpecialEffect {
  id: string;
  name: string;
  description: string;
  value: number;
  duration?: number;
}

/**
 * 武装数据
 */
export interface WeaponData {
  weaponId: string;           // 武装ID
  name: string;               // 武装名称
  type: WeaponType;           // 武装类型
  rarity: Rarity;             // 稀有度
  description: string;        // 描述
  baseStats: WeaponStats;     // 基础属性
  specialEffects: SpecialEffect[]; // 特殊效果
  associatedSkillId: string;  // 关联技能ID
  synergyIds: string[];       // 协同效果ID列表
  iconPath: string;           // 图标资源路径
  modelPath: string;          // 模型资源路径
  maxEnhancementLevel: number; // 最大强化等级
}

/**
 * 武装实例（玩家装备的武装）
 */
export class Weapon {
  private data: WeaponData;
  private enhancementLevel: number;

  constructor(data: WeaponData, enhancementLevel: number = 0) {
    this.data = data;
    this.enhancementLevel = enhancementLevel;
  }

  /**
   * 获取武装数据
   */
  public getData(): WeaponData {
    return this.data;
  }

  /**
   * 获取武装ID
   */
  public getWeaponId(): string {
    return this.data.weaponId;
  }

  /**
   * 获取武装名称
   */
  public getName(): string {
    return this.data.name;
  }

  /**
   * 获取武装类型
   */
  public getType(): WeaponType {
    return this.data.type;
  }

  /**
   * 获取稀有度
   */
  public getRarity(): Rarity {
    return this.data.rarity;
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
   * 获取当前属性（包含强化加成）
   */
  public getStats(): WeaponStats {
    const stats = { ...this.data.baseStats };
    const bonus = this.getEnhancementBonus();

    stats.damage *= (1 + bonus.damage);
    stats.attackSpeed *= (1 + bonus.attackSpeed);
    stats.range *= (1 + bonus.range);
    stats.accuracy = Math.min(1, stats.accuracy + bonus.accuracy);
    stats.criticalChance = Math.min(1, stats.criticalChance + bonus.criticalChance);
    stats.criticalDamage *= (1 + bonus.criticalDamage);

    return stats;
  }

  /**
   * 获取强化加成
   */
  private getEnhancementBonus(): WeaponStats {
    const bonusPerLevel = 0.1; // 每级10%加成
    const bonus = this.enhancementLevel * bonusPerLevel;

    return {
      damage: bonus,
      attackSpeed: bonus,
      range: bonus,
      accuracy: bonus * 0.5,
      criticalChance: bonus * 0.3,
      criticalDamage: bonus * 0.5
    };
  }

  /**
   * 获取特殊效果
   */
  public getSpecialEffects(): SpecialEffect[] {
    return [...this.data.specialEffects];
  }

  /**
   * 获取关联技能ID
   */
  public getAssociatedSkillId(): string {
    return this.data.associatedSkillId;
  }

  /**
   * 获取协同效果ID列表
   */
  public getSynergyIds(): string[] {
    return [...this.data.synergyIds];
  }

  /**
   * 检查是否已达到最大强化等级
   */
  public isMaxEnhanced(): boolean {
    return this.enhancementLevel >= this.data.maxEnhancementLevel;
  }

  /**
   * 创建武装的深拷贝
   */
  public clone(): Weapon {
    return new Weapon(this.data, this.enhancementLevel);
  }

  /**
   * 序列化
   */
  public serialize(): object {
    return {
      weaponId: this.data.weaponId,
      enhancementLevel: this.enhancementLevel
    };
  }

  /**
   * 反序列化
   */
  public static deserialize(data: any, weaponDatabase: Map<string, WeaponData>): Weapon | null {
    const weaponData = weaponDatabase.get(data.weaponId);
    if (!weaponData) {
      console.error(`Weapon data not found: ${data.weaponId}`);
      return null;
    }

    return new Weapon(weaponData, data.enhancementLevel || 0);
  }
}

/**
 * 稀有度颜色映射
 */
export const RarityColors: Record<Rarity, string> = {
  [Rarity.COMMON]: '#ffffff',
  [Rarity.RARE]: '#0070dd',
  [Rarity.EPIC]: '#a335ee',
  [Rarity.LEGENDARY]: '#ff8000'
};

/**
 * 稀有度名称映射
 */
export const RarityNames: Record<Rarity, string> = {
  [Rarity.COMMON]: '普通',
  [Rarity.RARE]: '稀有',
  [Rarity.EPIC]: '史诗',
  [Rarity.LEGENDARY]: '传说'
};

/**
 * 武装类型名称映射
 */
export const WeaponTypeNames: Record<WeaponType, string> = {
  [WeaponType.RANGED]: '远程武器',
  [WeaponType.MELEE]: '近战武器',
  [WeaponType.DEFENSE]: '防御武装',
  [WeaponType.SPECIAL]: '特殊武装'
};

/**
 * 槽位类型名称映射
 */
export const SlotTypeNames: Record<SlotType, string> = {
  [SlotType.HEAD]: '头部',
  [SlotType.LEFT_HAND]: '左手',
  [SlotType.RIGHT_HAND]: '右手',
  [SlotType.TORSO]: '躯干',
  [SlotType.LEGS]: '腿部'
};

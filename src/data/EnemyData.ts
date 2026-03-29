/**
 * 敌人数据模型
 */

/**
 * 敌人类别枚举
 */
export enum EnemyType {
  LIGHT = 'LIGHT',       // 轻型单位
  HEAVY = 'HEAVY',       // 重型单位
  ELITE = 'ELITE',       // 精英单位
  BOSS = 'BOSS'          // Boss单位
}

/**
 * 敌人稀有度枚举
 */
export enum EnemyRarity {
  COMMON = 'COMMON',     // 普通
  ELITE = 'ELITE',       // 精英
  RARE = 'RARE',         // 稀有
  BOSS = 'BOSS'          // Boss
}

/**
 * 敌人状态枚举
 */
export enum EnemyState {
  IDLE = 'IDLE',         // 待机
  PATROL = 'PATROL',     // 巡逻
  CHASE = 'CHASE',       // 追击
  ATTACK = 'ATTACK',     // 攻击
  RETREAT = 'RETREAT',   // 撤退
  DEAD = 'DEAD'          // 死亡
}

/**
 * 敌人基础属性
 */
export interface EnemyStats {
  health: number;           // 生命值
  maxHealth: number;         // 最大生命值
  damage: number;            // 攻击力
  movementSpeed: number;     // 移动速度
  attackRange: number;       // 攻击范围
  attackSpeed: number;       // 攻击速度（次/秒）
  experienceReward: number;  // 经验值奖励
  scoreReward: number;       // 分数奖励
}

/**
 * 弱点配置
 */
export interface WeakPointConfig {
  id: string;
  name: string;
  position: { x: number; y: number };
  radius: number;
  damageMultiplier: number;  // 伤害倍率
  destroyEffect: string;     // 破坏效果
}

/**
 * 可破坏部位配置
 */
export interface BreakablePartConfig {
  id: string;
  name: string;
  health: number;
  position: { x: number; y: number };
  reward: string;            // 破坏奖励
}

/**
 * AI行为配置
 */
export interface AIBehaviorConfig {
  stateMachine: string;      // 状态机类型
  patrolRoute: string[];      // 巡逻路线
  chaseRange: number;        // 追击范围
  attackRange: number;       // 攻击范围
  retreatThreshold: number;  // 撤退阈值
}

/**
 * 敌人数据
 */
export interface EnemyData {
  enemyId: string;
  name: string;
  type: EnemyType;
  rarity: EnemyRarity;
  description: string;
  baseStats: EnemyStats;
  weakPoints: WeakPointConfig[];
  breakableParts: BreakablePartConfig[];
  aiBehavior: AIBehaviorConfig;
  modelPath: string;
  animations: Record<string, string>;
  scale: number;
}

/**
 * 敌人实例
 */
export class Enemy {
  private data: EnemyData;
  private currentHealth: number;
  private currentState: EnemyState;
  private weakPointsHealth: Map<string, number>;
  private breakablePartsHealth: Map<string, number>;

  constructor(data: EnemyData) {
    this.data = data;
    this.currentHealth = data.baseStats.maxHealth;
    this.currentState = EnemyState.IDLE;
    this.weakPointsHealth = new Map();
    this.breakablePartsHealth = new Map();

    // 初始化弱点生命值
    data.weakPoints.forEach(weakPoint => {
      this.weakPointsHealth.set(weakPoint.id, 100);
    });

    // 初始化可破坏部位生命值
    data.breakableParts.forEach(part => {
      this.breakablePartsHealth.set(part.id, part.health);
    });
  }

  /**
   * 获取敌人数据
   */
  public getData(): EnemyData {
    return this.data;
  }

  /**
   * 获取当前生命值
   */
  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  /**
   * 获取最大生命值
   */
  public getMaxHealth(): number {
    return this.data.baseStats.maxHealth;
  }

  /**
   * 获取当前状态
   */
  public getCurrentState(): EnemyState {
    return this.currentState;
  }

  /**
   * 设置当前状态
   */
  public setCurrentState(state: EnemyState): void {
    this.currentState = state;
  }

  /**
   * 造成伤害
   */
  public takeDamage(damage: number, weakPointId?: string): number {
    let actualDamage = damage;

    // 如果击中弱点，计算额外伤害
    if (weakPointId) {
      const weakPoint = this.data.weakPoints.find(wp => wp.id === weakPointId);
      if (weakPoint) {
        actualDamage = damage * weakPoint.damageMultiplier;
      }
    }

    this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
    return actualDamage;
  }

  /**
   * 检查是否存活
   */
  public isAlive(): boolean {
    return this.currentHealth > 0;
  }

  /**
   * 检查弱点
   */
  public checkWeakPointHit(position: { x: number; y: number }): string | null {
    for (const weakPoint of this.data.weakPoints) {
      const dx = position.x - weakPoint.position.x;
      const dy = position.y - weakPoint.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= weakPoint.radius) {
        return weakPoint.id;
      }
    }
    return null;
  }

  /**
   * 破坏弱点
   */
  public destroyWeakPoint(weakPointId: string): boolean {
    const currentHealth = this.weakPointsHealth.get(weakPointId);
    if (currentHealth !== undefined && currentHealth > 0) {
      this.weakPointsHealth.set(weakPointId, 0);
      return true;
    }
    return false;
  }

  /**
   * 破坏部位
   */
  public destroyPart(partId: string): boolean {
    const currentHealth = this.breakablePartsHealth.get(partId);
    if (currentHealth !== undefined && currentHealth > 0) {
      this.breakablePartsHealth.set(partId, 0);
      return true;
    }
    return false;
  }

  /**
   * 获取经验值奖励
   */
  public getExperienceReward(): number {
    return this.data.baseStats.experienceReward;
  }

  /**
   * 获取分数奖励
   */
  public getScoreReward(): number {
    return this.data.baseStats.scoreReward;
  }

  /**
   * 序列化
   */
  public serialize(): object {
    return {
      enemyId: this.data.enemyId,
      currentHealth: this.currentHealth,
      currentState: this.currentState,
      weakPointsHealth: Object.fromEntries(this.weakPointsHealth),
      breakablePartsHealth: Object.fromEntries(this.breakablePartsHealth)
    };
  }

  /**
   * 反序列化
   */
  public static deserialize(data: any, enemyDatabase: Map<string, EnemyData>): Enemy | null {
    const enemyData = enemyDatabase.get(data.enemyId);
    if (!enemyData) {
      console.error(`Enemy data not found: ${data.enemyId}`);
      return null;
    }

    const enemy = new Enemy(enemyData);
    enemy.currentHealth = data.currentHealth;
    enemy.currentState = data.currentState;
    enemy.weakPointsHealth = new Map(Object.entries(data.weakPointsHealth || {}));
    enemy.breakablePartsHealth = new Map(Object.entries(data.breakablePartsHealth || {}));

    return enemy;
  }
}

/**
 * 敌人类别名称映射
 */
export const EnemyTypeNames: Record<EnemyType, string> = {
  [EnemyType.LIGHT]: '轻型单位',
  [EnemyType.HEAVY]: '重型单位',
  [EnemyType.ELITE]: '精英单位',
  [EnemyType.BOSS]: 'Boss单位'
};

/**
 * 敌人稀有度名称映射
 */
export const EnemyRarityNames: Record<EnemyRarity, string> = {
  [EnemyRarity.COMMON]: '普通',
  [EnemyRarity.ELITE]: '精英',
  [EnemyRarity.RARE]: '稀有',
  [EnemyRarity.BOSS]: 'Boss'
};

/**
 * 敌人稀有度颜色映射
 */
export const EnemyRarityColors: Record<EnemyRarity, string> = {
  [EnemyRarity.COMMON]: '#ffffff',
  [EnemyRarity.ELITE]: '#0070dd',
  [EnemyRarity.RARE]: '#a335ee',
  [EnemyRarity.BOSS]: '#ff8000'
};

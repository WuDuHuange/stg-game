/**
 * 协同效果系统
 * 检测武装组合并触发协同效果
 */

import { Weapon, SlotType } from '@data/WeaponData';
import {
  SynergyData,
  WeaponRequirement,
  ActiveSynergy,
  SynergyEffect
} from '@data/SynergyData';
import { logger } from '@utils/Logger';

/**
 * 协同效果变化事件
 */
export type SynergyChangeEvent = {
  synergyId: string;
  activated: boolean;
  synergy: ActiveSynergy | null;
};

export class SynergySystem {
  private synergyDatabase: Map<string, SynergyData> = new Map();
  private activeSynergies: Map<string, ActiveSynergy> = new Map();
  private eventListeners: Array<(event: SynergyChangeEvent) => void> = [];

  constructor() {
    this.loadExampleSynergies();
  }

  /**
   * 加载示例协同效果
   */
  private loadExampleSynergies(): void {
    const exampleSynergies: SynergyData[] = [
      {
        synergyId: 'laser_rapid_fire',
        name: '激光速射',
        description: '装备两把激光武器时，攻击速度提升20%',
        requiredWeapons: [
          { weaponType: 'RANGED' as any },
          { weaponType: 'RANGED' as any }
        ],
        effects: [
          {
            type: 'ATTACK_SPEED_BOOST' as any,
            value: 0.2,
            description: '攻击速度 +20%'
          }
        ],
        iconPath: 'assets/textures/synergies/laser_rapid_fire.png',
        rarity: 'RARE'
      },
      {
        synergyId: 'blade_dash',
        name: '刀锋冲刺',
        description: '装备近战武器和推进器时，移动速度提升30%',
        requiredWeapons: [
          { weaponType: 'MELEE' as any },
          { weaponType: 'SPECIAL' as any }
        ],
        effects: [
          {
            type: 'SPECIAL_EFFECT' as any,
            value: 0.3,
            description: '移动速度 +30%'
          }
        ],
        iconPath: 'assets/textures/synergies/blade_dash.png',
        rarity: 'RARE'
      },
      {
        synergyId: 'shield_reflect',
        name: '护盾反射',
        description: '装备护盾发生器和防御武装时，有10%几率反射伤害',
        requiredWeapons: [
          { weaponType: 'DEFENSE' as any },
          { weaponType: 'DEFENSE' as any }
        ],
        effects: [
          {
            type: 'DEFENSE_BOOST' as any,
            value: 0.1,
            description: '反射伤害 10%'
          }
        ],
        iconPath: 'assets/textures/synergies/shield_reflect.png',
        rarity: 'EPIC'
      },
      {
        synergyId: 'drone_swarm',
        name: '无人机群',
        description: '装备两个无人机发射器时，无人机数量翻倍',
        requiredWeapons: [
          { weaponType: 'SPECIAL' as any },
          { weaponType: 'SPECIAL' as any }
        ],
        effects: [
          {
            type: 'SPECIAL_EFFECT' as any,
            value: 2.0,
            description: '无人机数量 x2'
          }
        ],
        iconPath: 'assets/textures/synergies/drone_swarm.png',
        rarity: 'LEGENDARY'
      },
      {
        synergyId: 'full_offense',
        name: '全面进攻',
        description: '装备4个攻击型武装时，所有伤害提升25%',
        requiredWeapons: [
          { weaponType: 'RANGED' as any },
          { weaponType: 'RANGED' as any },
          { weaponType: 'MELEE' as any },
          { weaponType: 'SPECIAL' as any }
        ],
        effects: [
          {
            type: 'DAMAGE_BOOST' as any,
            value: 0.25,
            description: '所有伤害 +25%'
          }
        ],
        iconPath: 'assets/textures/synergies/full_offense.png',
        rarity: 'LEGENDARY'
      }
    ];

    exampleSynergies.forEach(synergy => {
      this.synergyDatabase.set(synergy.synergyId, synergy);
    });

    logger.info(`Loaded ${this.synergyDatabase.size} synergies`);
  }

  /**
   * 检查武装组合
   */
  public checkSynergies(equippedWeapons: Map<SlotType, Weapon>): ActiveSynergy[] {
    const weaponList = Array.from(equippedWeapons.values());
    const newActiveSynergies = new Map<string, ActiveSynergy>();

    // 检查每个协同规则
    this.synergyDatabase.forEach(synergyData => {
      if (this.matchesSynergy(synergyData, weaponList)) {
        const activeSynergy: ActiveSynergy = {
          synergyId: synergyData.synergyId,
          name: synergyData.name,
          effects: synergyData.effects,
          iconPath: synergyData.iconPath,
          rarity: synergyData.rarity
        };
        newActiveSynergies.set(synergyData.synergyId, activeSynergy);
      }
    });

    // 检测协同效果变化
    this.detectSynergyChanges(newActiveSynergies);

    // 更新激活的协同效果
    this.activeSynergies = newActiveSynergies;

    return Array.from(this.activeSynergies.values());
  }

  /**
   * 检查武装是否匹配协同规则
   */
  private matchesSynergy(synergyData: SynergyData, weapons: Weapon[]): boolean {
    const requirements = synergyData.requiredWeapons;

    // 检查每个要求
    for (const requirement of requirements) {
      let matched = false;

      for (const weapon of weapons) {
        if (this.matchesRequirement(weapon, requirement)) {
          matched = true;
          break;
        }
      }

      if (!matched) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查武装是否匹配要求
   */
  private matchesRequirement(weapon: Weapon, requirement: WeaponRequirement): boolean {
    // 检查武器ID（如果指定）
    if (requirement.weaponId && weapon.getWeaponId() !== requirement.weaponId) {
      return false;
    }

    // 检查武器类型
    if (weapon.getType() !== requirement.weaponType) {
      return false;
    }

    // 检查槽位类型（如果指定）
    if (requirement.slotType) {
      // 这里需要获取武器所在的槽位
      // 暂时跳过这个检查
    }

    return true;
  }

  /**
   * 检测协同效果变化
   */
  private detectSynergyChanges(newSynergies: Map<string, ActiveSynergy>): void {
    // 检查新激活的协同效果
    newSynergies.forEach((synergy, synergyId) => {
      if (!this.activeSynergies.has(synergyId)) {
        this.dispatchEvent({
          synergyId,
          activated: true,
          synergy
        });
        logger.info(`Synergy activated: ${synergy.name}`);
      }
    });

    // 检查新取消的协同效果
    this.activeSynergies.forEach((synergy, synergyId) => {
      if (!newSynergies.has(synergyId)) {
        this.dispatchEvent({
          synergyId,
          activated: false,
          synergy: null
        });
        logger.info(`Synergy deactivated: ${synergy.name}`);
      }
    });
  }

  /**
   * 获取当前激活的协同效果
   */
  public getActiveSynergies(): ActiveSynergy[] {
    return Array.from(this.activeSynergies.values());
  }

  /**
   * 获取协同效果数据
   */
  public getSynergyData(synergyId: string): SynergyData | undefined {
    return this.synergyDatabase.get(synergyId);
  }

  /**
   * 获取所有协同效果数据
   */
  public getAllSynergyData(): Map<string, SynergyData> {
    return new Map(this.synergyDatabase);
  }

  /**
   * 计算协同效果加成
   */
  public calculateSynergyBonuses(): Map<string, number> {
    const bonuses = new Map<string, number>();

    this.activeSynergies.forEach(synergy => {
      synergy.effects.forEach(effect => {
        const currentBonus = bonuses.get(effect.type) || 0;
        bonuses.set(effect.type, currentBonus + effect.value);
      });
    });

    return bonuses;
  }

  /**
   * 注册协同效果变化监听器
   */
  public onSynergyChange(callback: (event: SynergyChangeEvent) => void): void {
    this.eventListeners.push(callback);
  }

  /**
   * 移除协同效果变化监听器
   */
  public offSynergyChange(callback: (event: SynergyChangeEvent) => void): void {
    const index = this.eventListeners.indexOf(callback);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * 分发协同效果变化事件
   */
  private dispatchEvent(event: SynergyChangeEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in synergy change listener', error);
      }
    });
  }

  /**
   * 清空激活的协同效果
   */
  public clearActiveSynergies(): void {
    this.activeSynergies.clear();
    logger.info('Active synergies cleared');
  }

  /**
   * 添加协同效果数据
   */
  public addSynergyData(synergyData: SynergyData): void {
    this.synergyDatabase.set(synergyData.synergyId, synergyData);
    logger.info(`Synergy added: ${synergyData.name}`);
  }

  /**
   * 移除协同效果数据
   */
  public removeSynergyData(synergyId: string): void {
    if (this.synergyDatabase.has(synergyId)) {
      this.synergyDatabase.delete(synergyId);
      logger.info(`Synergy removed: ${synergyId}`);
    }
  }

  /**
   * 获取协同效果数量
   */
  public getSynergyCount(): number {
    return this.synergyDatabase.size;
  }

  /**
   * 获取激活的协同效果数量
   */
  public getActiveSynergyCount(): number {
    return this.activeSynergies.size;
  }

  /**
   * 销毁协同效果系统
   */
  public destroy(): void {
    this.clearActiveSynergies();
    this.eventListeners = [];
    logger.info('SynergySystem destroyed');
  }
}

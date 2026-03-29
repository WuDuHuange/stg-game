/**
 * 装备强化管理器
 * 通过击杀敌人强化装备属性
 */

import { Weapon, SlotType } from '@data/WeaponData';
import { logger } from '@utils/Logger';

/**
 * 装备强化进度
 */
export interface WeaponEnhancementProgress {
  slotType: SlotType;
  weaponId: string | null;
  currentLevel: number;
  currentKills: number;
  killsNeeded: number;
  maxLevel: number;
}

/**
 * 装备强化事件
 */
export type WeaponEnhancementEvent = {
  slotType: SlotType;
  weaponId: string;
  oldLevel: number;
  newLevel: number;
  timestamp: number;
};

export class WeaponEnhancementManager {
  private equippedWeapons: Map<SlotType, Weapon>;
  private killCounts: Map<SlotType, number>;
  private killsPerLevel: number;
  private eventListeners: Array<(event: WeaponEnhancementEvent) => void>;

  constructor(killsPerLevel: number = 10) {
    this.equippedWeapons = new Map();
    this.killCounts = new Map();
    this.killsPerLevel = killsPerLevel;
    this.eventListeners = [];

    // 初始化所有槽位的击杀数
    Object.values(SlotType).forEach(slotType => {
      this.killCounts.set(slotType as SlotType, 0);
    });
  }

  /**
   * 设置装备的武器
   */
  public setEquippedWeapon(slotType: SlotType, weapon: Weapon): void {
    this.equippedWeapons.set(slotType, weapon);
    
    // 初始化击杀数
    const currentLevel = weapon.getEnhancementLevel();
    this.killCounts.set(slotType, currentLevel * this.killsPerLevel);

    logger.debug(`Weapon equipped for enhancement: ${weapon.getName()} at ${slotType}`);
  }

  /**
   * 移除装备的武器
   */
  public removeEquippedWeapon(slotType: SlotType): void {
    this.equippedWeapons.delete(slotType);
    this.killCounts.set(slotType, 0);
    logger.debug(`Weapon removed from: ${slotType}`);
  }

  /**
   * 增加击杀数到指定槽位
   */
  public addKill(slotType: SlotType): void {
    const weapon = this.equippedWeapons.get(slotType);
    if (!weapon) {
      return;
    }

    if (weapon.isMaxEnhanced()) {
      return;
    }

    const currentKills = this.killCounts.get(slotType) || 0;
    const newKills = currentKills + 1;
    this.killCounts.set(slotType, newKills);

    // 检查是否可以强化
    this.checkEnhancement(slotType);
  }

  /**
   * 增加击杀数到所有装备
   */
  public addKillToAll(): void {
    this.equippedWeapons.forEach((weapon, slotType) => {
      if (!weapon.isMaxEnhanced()) {
        this.addKill(slotType);
      }
    });
  }

  /**
   * 检查是否可以强化
   */
  private checkEnhancement(slotType: SlotType): void {
    const weapon = this.equippedWeapons.get(slotType);
    if (!weapon || weapon.isMaxEnhanced()) {
      return;
    }

    const currentLevel = weapon.getEnhancementLevel();
    const killsNeeded = (currentLevel + 1) * this.killsPerLevel;
    const currentKills = this.killCounts.get(slotType) || 0;

    if (currentKills >= killsNeeded) {
      const oldLevel = currentLevel;
      const success = weapon.enhance();

      if (success) {
        const newLevel = weapon.getEnhancementLevel();
        
        // 触发事件
        this.dispatchEvent({
          slotType,
          weaponId: weapon.getWeaponId(),
          oldLevel,
          newLevel,
          timestamp: Date.now()
        });

        logger.info(`Weapon enhanced: ${weapon.getName()} to level ${newLevel}`);
      }
    }
  }

  /**
   * 获取装备强化进度
   */
  public getEnhancementProgress(slotType: SlotType): WeaponEnhancementProgress | null {
    const weapon = this.equippedWeapons.get(slotType);
    if (!weapon) {
      return {
        slotType,
        weaponId: null,
        currentLevel: 0,
        currentKills: 0,
        killsNeeded: this.killsPerLevel,
        maxLevel: 5
      };
    }

    const currentLevel = weapon.getEnhancementLevel();
    const currentKills = this.killCounts.get(slotType) || 0;
    const killsNeeded = Math.min(
      (currentLevel + 1) * this.killsPerLevel,
      weapon.getData().maxEnhancementLevel * this.killsPerLevel
    );

    return {
      slotType,
      weaponId: weapon.getWeaponId(),
      currentLevel,
      currentKills,
      killsNeeded,
      maxLevel: weapon.getData().maxEnhancementLevel
    };
  }

  /**
   * 获取所有装备强化进度
   */
  public getAllEnhancementProgress(): Map<SlotType, WeaponEnhancementProgress> {
    const progress = new Map<SlotType, WeaponEnhancementProgress>();

    Object.values(SlotType).forEach(slotType => {
      const slotProgress = this.getEnhancementProgress(slotType as SlotType);
      if (slotProgress) {
        progress.set(slotType as SlotType, slotProgress);
      }
    });

    return progress;
  }

  /**
   * 手动强化装备
   */
  public enhanceWeapon(slotType: SlotType): boolean {
    const weapon = this.equippedWeapons.get(slotType);
    if (!weapon) {
      logger.warn(`No weapon equipped at: ${slotType}`);
      return false;
    }

    if (weapon.isMaxEnhanced()) {
      logger.warn(`Weapon already at max level: ${slotType}`);
      return false;
    }

    const oldLevel = weapon.getEnhancementLevel();
    const success = weapon.enhance();

    if (success) {
      const newLevel = weapon.getEnhancementLevel();
      
      // 更新击杀数
      this.killCounts.set(slotType, newLevel * this.killsPerLevel);

      // 触发事件
      this.dispatchEvent({
        slotType,
        weaponId: weapon.getWeaponId(),
        oldLevel,
        newLevel,
        timestamp: Date.now()
      });

      logger.info(`Weapon manually enhanced: ${weapon.getName()} to level ${newLevel}`);
    }

    return success;
  }

  /**
   * 设置每级所需击杀数
   */
  public setKillsPerLevel(kills: number): void {
    this.killsPerLevel = Math.max(1, kills);
    logger.info(`Kills per level set to: ${this.killsPerLevel}`);
  }

  /**
   * 获取每级所需击杀数
   */
  public getKillsPerLevel(): number {
    return this.killsPerLevel;
  }

  /**
   * 重置装备强化进度
   */
  public resetWeapon(slotType: SlotType): void {
    const weapon = this.equippedWeapons.get(slotType);
    if (weapon) {
      weapon.setEnhancementLevel(0);
      this.killCounts.set(slotType, 0);
      logger.info(`Weapon enhancement reset: ${slotType}`);
    }
  }

  /**
   * 重置所有装备强化进度
   */
  public resetAllWeapons(): void {
    this.equippedWeapons.forEach((weapon, slotType) => {
      weapon.setEnhancementLevel(0);
      this.killCounts.set(slotType, 0);
    });
    logger.info('All weapon enhancements reset');
  }

  /**
   * 注册强化事件监听器
   */
  public onEnhancement(callback: (event: WeaponEnhancementEvent) => void): void {
    this.eventListeners.push(callback);
  }

  /**
   * 移除强化事件监听器
   */
  public offEnhancement(callback: (event: WeaponEnhancementEvent) => void): void {
    const index = this.eventListeners.indexOf(callback);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * 分发事件
   */
  private dispatchEvent(event: WeaponEnhancementEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in weapon enhancement listener', error);
      }
    });
  }

  /**
   * 保存强化状态
   */
  public saveState(): object {
    const state: any = {
      killCounts: {},
      killsPerLevel: this.killsPerLevel
    };

    this.killCounts.forEach((kills, slotType) => {
      state.killCounts[slotType] = kills;
    });

    return state;
  }

  /**
   * 加载强化状态
   */
  public loadState(state: any): void {
    if (!state) {
      logger.warn('No enhancement state to load');
      return;
    }

    if (state.killsPerLevel) {
      this.killsPerLevel = state.killsPerLevel;
    }

    if (state.killCounts) {
      Object.entries(state.killCounts).forEach(([slotType, kills]: [string, any]) => {
        this.killCounts.set(slotType as SlotType, kills);
      });
    }

    logger.info('Weapon enhancement state loaded');
  }

  /**
   * 获取强化统计信息
   */
  public getEnhancementStats(): any {
    let totalLevel = 0;
    let maxLevelWeapons = 0;
    let totalKills = 0;
    let equippedCount = 0;

    this.equippedWeapons.forEach((weapon, slotType) => {
      totalLevel += weapon.getEnhancementLevel();
      if (weapon.isMaxEnhanced()) {
        maxLevelWeapons++;
      }
      totalKills += this.killCounts.get(slotType) || 0;
      equippedCount++;
    });

    return {
      totalSlots: Object.keys(SlotType).length,
      equippedWeapons: equippedCount,
      totalLevel,
      averageLevel: equippedCount > 0 ? totalLevel / equippedCount : 0,
      maxLevelWeapons,
      totalKills,
      killsPerLevel: this.killsPerLevel
    };
  }

  /**
   * 销毁装备强化管理器
   */
  public destroy(): void {
    this.equippedWeapons.clear();
    this.killCounts.clear();
    this.eventListeners = [];
    logger.info('WeaponEnhancementManager destroyed');
  }
}

// 导出单例实例
export const weaponEnhancementManager = new WeaponEnhancementManager();

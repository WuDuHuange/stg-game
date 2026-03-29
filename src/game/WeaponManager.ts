/**
 * 武装管理器
 * 管理5个槽位的武装装备
 */

import { Weapon, SlotType } from '@data/WeaponData';
import { WeaponSlot } from './WeaponSlot';
import { logger } from '@utils/Logger';

/**
 * 装备变化事件
 */
export type EquipmentChangeEvent = {
  slotType: SlotType;
  weapon: Weapon | null;
  action: 'EQUIP' | 'UNEQUIP' | 'SWAP';
};

export class WeaponManager {
  private slots: Map<SlotType, WeaponSlot>;
  private eventListeners: Array<(event: EquipmentChangeEvent) => void>;

  constructor() {
    this.slots = new Map();
    this.eventListeners = [];
    this.initializeSlots();
  }

  /**
   * 初始化槽位
   */
  private initializeSlots(): void {
    // 创建5个槽位
    this.slots.set(SlotType.HEAD, new WeaponSlot(SlotType.HEAD, 0));
    this.slots.set(SlotType.LEFT_HAND, new WeaponSlot(SlotType.LEFT_HAND, 1));
    this.slots.set(SlotType.RIGHT_HAND, new WeaponSlot(SlotType.RIGHT_HAND, 2));
    this.slots.set(SlotType.TORSO, new WeaponSlot(SlotType.TORSO, 3));
    this.slots.set(SlotType.LEGS, new WeaponSlot(SlotType.LEGS, 4));

    logger.info('WeaponManager initialized with 5 slots');
  }

  /**
   * 获取槽位
   */
  public getSlot(slotType: SlotType): WeaponSlot | undefined {
    return this.slots.get(slotType);
  }

  /**
   * 获取所有槽位
   */
  public getAllSlots(): Map<SlotType, WeaponSlot> {
    return new Map(this.slots);
  }

  /**
   * 装备武装到指定槽位
   */
  public equipWeapon(slotType: SlotType, weapon: Weapon): boolean {
    const slot = this.slots.get(slotType);
    if (!slot) {
      logger.error(`Slot not found: ${slotType}`);
      return false;
    }

    if (!slot.canEquip(weapon)) {
      logger.warn(`Cannot equip weapon ${weapon.getWeaponId()} to slot ${slotType}`);
      return false;
    }

    const success = slot.equip(weapon);
    if (success) {
      this.dispatchEvent({
        slotType,
        weapon,
        action: 'EQUIP'
      });
    }

    return success;
  }

  /**
   * 从指定槽位卸载武装
   */
  public unequipWeapon(slotType: SlotType): Weapon | null {
    const slot = this.slots.get(slotType);
    if (!slot) {
      logger.error(`Slot not found: ${slotType}`);
      return null;
    }

    const weapon = slot.unequip();
    if (weapon) {
      this.dispatchEvent({
        slotType,
        weapon: null,
        action: 'UNEQUIP'
      });
    }

    return weapon;
  }

  /**
   * 交换指定槽位的武装
   */
  public swapWeapon(slotType: SlotType, weapon: Weapon): Weapon | null {
    const slot = this.slots.get(slotType);
    if (!slot) {
      logger.error(`Slot not found: ${slotType}`);
      return null;
    }

    if (!slot.canEquip(weapon)) {
      logger.warn(`Cannot equip weapon ${weapon.getWeaponId()} to slot ${slotType}`);
      return null;
    }

    const oldWeapon = slot.swap(weapon);
    this.dispatchEvent({
      slotType,
      weapon,
      action: 'SWAP'
    });

    return oldWeapon;
  }

  /**
   * 获取指定槽位的武装
   */
  public getEquippedWeapon(slotType: SlotType): Weapon | null {
    const slot = this.slots.get(slotType);
    return slot ? slot.getEquippedWeapon() : null;
  }

  /**
   * 获取所有已装备的武装
   */
  public getAllEquippedWeapons(): Map<SlotType, Weapon> {
    const equipped = new Map<SlotType, Weapon>();
    
    this.slots.forEach((slot, slotType) => {
      const weapon = slot.getEquippedWeapon();
      if (weapon) {
        equipped.set(slotType, weapon);
      }
    });

    return equipped;
  }

  /**
   * 检查指定槽位是否有装备
   */
  public hasWeapon(slotType: SlotType): boolean {
    const slot = this.slots.get(slotType);
    return slot ? slot.hasWeapon() : false;
  }

  /**
   * 检查是否有任何装备
   */
  public hasAnyWeapon(): boolean {
    for (const slot of this.slots.values()) {
      if (slot.hasWeapon()) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取已装备武装数量
   */
  public getEquippedCount(): number {
    let count = 0;
    for (const slot of this.slots.values()) {
      if (slot.hasWeapon()) {
        count++;
      }
    }
    return count;
  }

  /**
   * 清空指定槽位
   */
  public clearSlot(slotType: SlotType): void {
    if (this.hasWeapon(slotType)) {
      this.unequipWeapon(slotType);
    }
  }

  /**
   * 清空所有槽位
   */
  public clearAllSlots(): void {
    this.slots.forEach((_, slotType) => {
      this.clearSlot(slotType);
    });
    logger.info('All slots cleared');
  }

  /**
   * 注册装备变化监听器
   */
  public onEquipmentChange(callback: (event: EquipmentChangeEvent) => void): void {
    this.eventListeners.push(callback);
  }

  /**
   * 移除装备变化监听器
   */
  public offEquipmentChange(callback: (event: EquipmentChangeEvent) => void): void {
    const index = this.eventListeners.indexOf(callback);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * 分发装备变化事件
   */
  private dispatchEvent(event: EquipmentChangeEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in equipment change listener', error);
      }
    });
  }

  /**
   * 保存装备状态
   */
  public saveState(): object {
    const state: any = {};

    this.slots.forEach((slot, slotType) => {
      state[slotType] = slot.serialize();
    });

    return state;
  }

  /**
   * 加载装备状态
   */
  public loadState(state: any, weaponCreateFn: (weaponId: string, enhancementLevel: number) => Weapon | null): void {
    if (!state) {
      logger.warn('No equipment state to load');
      return;
    }

    Object.entries(state).forEach(([slotType, slotData]: [string, any]) => {
      const slot = this.slots.get(slotType as SlotType);
      if (!slot) {
        logger.warn(`Slot not found: ${slotType}`);
        return;
      }

      if (slotData.weaponData) {
        const weapon = weaponCreateFn(
          slotData.weaponData.weaponId,
          slotData.weaponData.enhancementLevel
        );

        if (weapon) {
          slot.equip(weapon);
        }
      }
    });

    logger.info('Equipment state loaded');
  }

  /**
   * 获取装备统计信息
   */
  public getEquipmentStats(): any {
    const stats = {
      totalSlots: this.slots.size,
      equippedSlots: 0,
      totalEnhancementLevel: 0,
      rarityDistribution: {
        COMMON: 0,
        RARE: 0,
        EPIC: 0,
        LEGENDARY: 0
      }
    };

    this.slots.forEach(slot => {
      const weapon = slot.getEquippedWeapon();
      if (weapon) {
        stats.equippedSlots++;
        stats.totalEnhancementLevel += weapon.getEnhancementLevel();
        stats.rarityDistribution[weapon.getRarity()]++;
      }
    });

    return stats;
  }

  /**
   * 销毁武装管理器
   */
  public destroy(): void {
    this.clearAllSlots();
    this.eventListeners = [];
    logger.info('WeaponManager destroyed');
  }
}

/**
 * 武装槽位
 * 管理单个槽位的武装装备
 */

import { Weapon, SlotType } from '@data/WeaponData';
import { logger } from '@utils/Logger';

/**
 * 武装槽位类
 */
export class WeaponSlot {
  private slotType: SlotType;
  private equippedWeapon: Weapon | null;
  private slotIndex: number;

  constructor(slotType: SlotType, slotIndex: number) {
    this.slotType = slotType;
    this.slotIndex = slotIndex;
    this.equippedWeapon = null;
  }

  /**
   * 获取槽位类型
   */
  public getSlotType(): SlotType {
    return this.slotType;
  }

  /**
   * 获取槽位索引
   */
  public getSlotIndex(): number {
    return this.slotIndex;
  }

  /**
   * 获取当前装备的武装
   */
  public getEquippedWeapon(): Weapon | null {
    return this.equippedWeapon;
  }

  /**
   * 检查是否有装备
   */
  public hasWeapon(): boolean {
    return this.equippedWeapon !== null;
  }

  /**
   * 检查是否可以装备指定武装
   */
  public canEquip(weapon: Weapon): boolean {
    // 当前实现允许任何武装装备到任何槽位
    // 如果需要限制，可以在这里添加逻辑
    return true;
  }

  /**
   * 装备武装
   */
  public equip(weapon: Weapon): boolean {
    if (!this.canEquip(weapon)) {
      logger.warn(`Cannot equip weapon ${weapon.getWeaponId()} to slot ${this.slotType}`);
      return false;
    }

    this.equippedWeapon = weapon;
    logger.info(`Weapon ${weapon.getWeaponId()} equipped to slot ${this.slotType}`);
    return true;
  }

  /**
   * 卸载武装
   */
  public unequip(): Weapon | null {
    const weapon = this.equippedWeapon;
    if (weapon) {
      logger.info(`Weapon ${weapon.getWeaponId()} unequipped from slot ${this.slotType}`);
    }
    
    this.equippedWeapon = null;
    return weapon;
  }

  /**
   * 交换武装
   */
  public swap(weapon: Weapon): Weapon | null {
    const oldWeapon = this.unequip();
    this.equip(weapon);
    return oldWeapon;
  }

  /**
   * 获取槽位状态数据
   */
  public getSlotData(): object | null {
    if (!this.equippedWeapon) {
      return null;
    }

    return this.equippedWeapon.serialize();
  }

  /**
   * 清空槽位
   */
  public clear(): void {
    this.equippedWeapon = null;
    logger.info(`Slot ${this.slotType} cleared`);
  }

  /**
   * 序列化
   */
  public serialize(): object {
    return {
      slotType: this.slotType,
      slotIndex: this.slotIndex,
      weaponData: this.getSlotData()
    };
  }
}

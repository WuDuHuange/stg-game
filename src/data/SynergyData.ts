/**
 * 协同效果数据模型
 */

import { WeaponType } from './WeaponData';

/**
 * 武装要求
 */
export interface WeaponRequirement {
  weaponId?: string;      // 武装ID（可选，留空表示任意该类型武装）
  weaponType: WeaponType; // 武装类型
  slotType?: string;      // 槽位类型（可选）
}

/**
 * 协同效果类型
 */
export enum SynergyEffectType {
  DAMAGE_BOOST = 'DAMAGE_BOOST',           // 伤害加成
  ATTACK_SPEED_BOOST = 'ATTACK_SPEED_BOOST', // 攻击速度加成
  CRITICAL_CHANCE_BOOST = 'CRITICAL_CHANCE_BOOST', // 暴击率加成
  RANGE_BOOST = 'RANGE_BOOST',             // 射程加成
  DEFENSE_BOOST = 'DEFENSE_BOOST',         // 防御加成
  SPECIAL_EFFECT = 'SPECIAL_EFFECT'        // 特殊效果
}

/**
 * 协同效果
 */
export interface SynergyEffect {
  type: SynergyEffectType;
  value: number;
  description: string;
}

/**
 * 协同数据
 */
export interface SynergyData {
  synergyId: string;                 // 协同效果ID
  name: string;                      // 协同效果名称
  description: string;               // 协同效果描述
  requiredWeapons: WeaponRequirement[]; // 所需武装组合
  effects: SynergyEffect[];          // 协同效果列表
  iconPath: string;                  // 协同效果图标路径
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'; // 协同效果稀有度
}

/**
 * 激活的协同效果
 */
export interface ActiveSynergy {
  synergyId: string;
  name: string;
  effects: SynergyEffect[];
  iconPath: string;
  rarity: string;
}

/**
 * 协同效果类型名称映射
 */
export const SynergyEffectTypeNames: Record<SynergyEffectType, string> = {
  [SynergyEffectType.DAMAGE_BOOST]: '伤害加成',
  [SynergyEffectType.ATTACK_SPEED_BOOST]: '攻击速度加成',
  [SynergyEffectType.CRITICAL_CHANCE_BOOST]: '暴击率加成',
  [SynergyEffectType.RANGE_BOOST]: '射程加成',
  [SynergyEffectType.DEFENSE_BOOST]: '防御加成',
  [SynergyEffectType.SPECIAL_EFFECT]: '特殊效果'
};

/**
 * 协同效果稀有度颜色映射
 */
export const SynergyRarityColors: Record<string, string> = {
  'COMMON': '#ffffff',
  'RARE': '#0070dd',
  'EPIC': '#a335ee',
  'LEGENDARY': '#ff8000'
};

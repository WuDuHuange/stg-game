/**
 * 武装配置加载器
 */

import { WeaponData, Weapon } from './WeaponData';
import { logger } from '@utils/Logger';

/**
 * 武装配置加载器
 */
export class WeaponLoader {
  private weaponDatabase: Map<string, WeaponData> = new Map();
  private loaded: boolean = false;

  /**
   * 加载武装配置
   */
  public async loadConfig(configPath: string): Promise<void> {
    try {
      logger.info(`Loading weapon config from: ${configPath}`);
      
      // 这里应该从文件加载配置
      // 暂时使用示例数据
      const exampleWeapons = this.createExampleWeapons();
      
      exampleWeapons.forEach(weaponData => {
        this.weaponDatabase.set(weaponData.weaponId, weaponData);
      });

      this.loaded = true;
      logger.info(`Loaded ${this.weaponDatabase.size} weapons`);
    } catch (error) {
      logger.error('Failed to load weapon config', error);
      throw error;
    }
  }

  /**
   * 创建示例武装数据
   */
  private createExampleWeapons(): WeaponData[] {
    return [
      {
        weaponId: 'laser_gun_basic',
        name: '基础激光枪',
        type: 'RANGED' as any,
        rarity: 'COMMON' as any,
        description: '一把基础的激光武器，适合新手使用',
        baseStats: {
          damage: 10,
          attackSpeed: 2.0,
          range: 500,
          accuracy: 0.8,
          criticalChance: 0.05,
          criticalDamage: 1.5
        },
        specialEffects: [],
        associatedSkillId: 'laser_shot',
        synergyIds: ['laser_rapid_fire'],
        iconPath: 'assets/textures/weapons/laser_gun.png',
        modelPath: 'assets/models/weapons/laser_gun.glb',
        maxEnhancementLevel: 5
      },
      {
        weaponId: 'energy_blade_basic',
        name: '基础能量刃',
        type: 'MELEE' as any,
        rarity: 'COMMON' as any,
        description: '一把近战能量武器，可以快速攻击敌人',
        baseStats: {
          damage: 25,
          attackSpeed: 1.5,
          range: 100,
          accuracy: 0.9,
          criticalChance: 0.1,
          criticalDamage: 2.0
        },
        specialEffects: [],
        associatedSkillId: 'blade_slash',
        synergyIds: ['blade_dash'],
        iconPath: 'assets/textures/weapons/energy_blade.png',
        modelPath: 'assets/models/weapons/energy_blade.glb',
        maxEnhancementLevel: 5
      },
      {
        weaponId: 'shield_generator_basic',
        name: '基础护盾发生器',
        type: 'DEFENSE' as any,
        rarity: 'COMMON' as any,
        description: '可以产生能量护盾，保护玩家免受伤害',
        baseStats: {
          damage: 0,
          attackSpeed: 0,
          range: 0,
          accuracy: 0,
          criticalChance: 0,
          criticalDamage: 0
        },
        specialEffects: [
          {
            id: 'shield_protection',
            name: '护盾保护',
            description: '提供护盾保护',
            value: 50,
            duration: 5
          }
        ],
        associatedSkillId: 'shield_activate',
        synergyIds: ['shield_reflect'],
        iconPath: 'assets/textures/weapons/shield_generator.png',
        modelPath: 'assets/models/weapons/shield_generator.glb',
        maxEnhancementLevel: 5
      },
      {
        weaponId: 'drone_launcher_basic',
        name: '基础无人机发射器',
        type: 'SPECIAL' as any,
        rarity: 'RARE' as any,
        description: '可以发射无人机自动攻击敌人',
        baseStats: {
          damage: 5,
          attackSpeed: 1.0,
          range: 800,
          accuracy: 0.7,
          criticalChance: 0.03,
          criticalDamage: 1.3
        },
        specialEffects: [
          {
            id: 'auto_attack',
            name: '自动攻击',
            description: '无人机自动攻击敌人',
            value: 3
          }
        ],
        associatedSkillId: 'drone_launch',
        synergyIds: ['drone_swarm'],
        iconPath: 'assets/textures/weapons/drone_launcher.png',
        modelPath: 'assets/models/weapons/drone_launcher.glb',
        maxEnhancementLevel: 5
      }
    ];
  }

  /**
   * 获取武装数据
   */
  public getWeaponData(weaponId: string): WeaponData | undefined {
    return this.weaponDatabase.get(weaponId);
  }

  /**
   * 获取所有武装数据
   */
  public getAllWeaponData(): Map<string, WeaponData> {
    return new Map(this.weaponDatabase);
  }

  /**
   * 创建武装实例
   */
  public createWeapon(weaponId: string, enhancementLevel: number = 0): Weapon | null {
    const weaponData = this.weaponDatabase.get(weaponId);
    if (!weaponData) {
      logger.warn(`Weapon data not found: ${weaponId}`);
      return null;
    }

    return new Weapon(weaponData, enhancementLevel);
  }

  /**
   * 根据类型获取武装列表
   */
  public getWeaponsByType(type: string): WeaponData[] {
    const weapons: WeaponData[] = [];
    this.weaponDatabase.forEach(weaponData => {
      if (weaponData.type === type) {
        weapons.push(weaponData);
      }
    });
    return weapons;
  }

  /**
   * 根据稀有度获取武装列表
   */
  public getWeaponsByRarity(rarity: string): WeaponData[] {
    const weapons: WeaponData[] = [];
    this.weaponDatabase.forEach(weaponData => {
      if (weaponData.rarity === rarity) {
        weapons.push(weaponData);
      }
    });
    return weapons;
  }

  /**
   * 检查是否已加载
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 获取武装数量
   */
  public getWeaponCount(): number {
    return this.weaponDatabase.size;
  }

  /**
   * 清空武装数据库
   */
  public clear(): void {
    this.weaponDatabase.clear();
    this.loaded = false;
    logger.info('Weapon database cleared');
  }
}

// 导出单例实例
export const weaponLoader = new WeaponLoader();

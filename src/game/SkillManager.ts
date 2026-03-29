/**
 * 技能管理器
 * 管理技能解锁、释放和冷却
 */

import { Skill, SkillType, SkillData } from '@data/SkillData';
import { logger } from '@utils/Logger';

/**
 * 技能释放事件
 */
export type SkillCastEvent = {
  skillId: string;
  skillType: SkillType;
  casterId?: string;
  timestamp: number;
};

/**
 * 技能状态变化事件
 */
export type SkillStateChangeEvent = {
  skillId: string;
  unlocked: boolean;
  enhancementLevel: number;
};

export class SkillManager {
  private skillDatabase: Map<string, SkillData> = new Map();
  private unlockedSkills: Map<string, Skill> = new Map();
  private activeSkills: string[] = [];
  private passiveSkills: string[] = [];
  private ultimateSkill: string | null = null;
  private eventListeners: Map<string, Array<(event: any) => void>> = new Map();

  constructor() {
    this.loadExampleSkills();
  }

  /**
   * 加载示例技能
   */
  private loadExampleSkills(): void {
    const exampleSkills: SkillData[] = [
      {
        skillId: 'laser_shot',
        name: '激光射击',
        type: SkillType.ACTIVE,
        description: '发射一道激光，对直线路径上的敌人造成伤害',
        baseEffect: {
          damage: 50,
          duration: 0.5,
          range: 800,
          cooldown: 2
        },
        enhancementPerLevel: {
          damageBonus: 0.1,
          durationBonus: 0,
          cooldownReduction: 0.05
        },
        iconPath: 'assets/textures/skills/laser_shot.png',
        effectPath: 'assets/effects/laser_shot.pex',
        maxEnhancementLevel: 5
      },
      {
        skillId: 'blade_slash',
        name: '刀锋斩击',
        type: SkillType.ACTIVE,
        description: '向前方进行强力斩击，对范围内的敌人造成伤害',
        baseEffect: {
          damage: 80,
          duration: 0.3,
          range: 200,
          cooldown: 3
        },
        enhancementPerLevel: {
          damageBonus: 0.15,
          durationBonus: 0,
          cooldownReduction: 0.05
        },
        iconPath: 'assets/textures/skills/blade_slash.png',
        effectPath: 'assets/effects/blade_slash.pex',
        maxEnhancementLevel: 5
      },
      {
        skillId: 'shield_activate',
        name: '护盾激活',
        type: SkillType.ACTIVE,
        description: '激活能量护盾，在短时间内吸收伤害',
        baseEffect: {
          damage: 0,
          duration: 3,
          range: 0,
          cooldown: 10
        },
        enhancementPerLevel: {
          damageBonus: 0,
          durationBonus: 0.2,
          cooldownReduction: 0.05
        },
        iconPath: 'assets/textures/skills/shield_activate.png',
        effectPath: 'assets/effects/shield_activate.pex',
        maxEnhancementLevel: 5
      },
      {
        skillId: 'auto_reload',
        name: '自动装填',
        type: SkillType.PASSIVE,
        description: '自动恢复弹药，每秒恢复一定数量的弹药',
        baseEffect: {
          damage: 0,
          duration: 0,
          range: 0,
          cooldown: 1
        },
        enhancementPerLevel: {
          damageBonus: 0,
          durationBonus: 0.1,
          cooldownReduction: 0
        },
        iconPath: 'assets/textures/skills/auto_reload.png',
        effectPath: '',
        maxEnhancementLevel: 5
      },
      {
        skillId: 'laser_barrage',
        name: '激光轰炸',
        type: SkillType.ULTIMATE,
        description: '释放大量激光，对大范围内的敌人造成毁灭性伤害',
        baseEffect: {
          damage: 500,
          duration: 2,
          range: 1000,
          cooldown: 60
        },
        enhancementPerLevel: {
          damageBonus: 0.2,
          durationBonus: 0.1,
          cooldownReduction: 0.05
        },
        iconPath: 'assets/textures/skills/laser_barrage.png',
        effectPath: 'assets/effects/laser_barrage.pex',
        maxEnhancementLevel: 5
      }
    ];

    exampleSkills.forEach(skillData => {
      this.skillDatabase.set(skillData.skillId, skillData);
    });

    logger.info(`Loaded ${this.skillDatabase.size} skills`);
  }

  /**
   * 解锁技能
   */
  public unlockSkill(skillId: string): boolean {
    if (this.skillDatabase.has(skillId)) {
      const skillData = this.skillDatabase.get(skillId)!;
      const skill = new Skill(skillData);
      this.unlockedSkills.set(skillId, skill);

      // 根据技能类型分类
      switch (skillData.type) {
        case SkillType.ACTIVE:
          if (!this.activeSkills.includes(skillId)) {
            this.activeSkills.push(skillId);
          }
          break;
        case SkillType.PASSIVE:
          if (!this.passiveSkills.includes(skillId)) {
            this.passiveSkills.push(skillId);
          }
          break;
        case SkillType.ULTIMATE:
          this.ultimateSkill = skillId;
          break;
      }

      this.dispatchEvent('skillUnlock', {
        skillId,
        unlocked: true,
        enhancementLevel: 0
      });

      logger.info(`Skill unlocked: ${skillData.name}`);
      return true;
    }

    logger.warn(`Skill not found: ${skillId}`);
    return false;
  }

  /**
   * 锁定技能
   */
  public lockSkill(skillId: string): void {
    if (this.unlockedSkills.has(skillId)) {
      this.unlockedSkills.delete(skillId);

      // 从分类中移除
      this.activeSkills = this.activeSkills.filter(id => id !== skillId);
      this.passiveSkills = this.passiveSkills.filter(id => id !== skillId);
      if (this.ultimateSkill === skillId) {
        this.ultimateSkill = null;
      }

      this.dispatchEvent('skillLock', {
        skillId,
        unlocked: false,
        enhancementLevel: 0
      });

      logger.info(`Skill locked: ${skillId}`);
    }
  }

  /**
   * 释放主动技能
   */
  public castSkill(skillId: string, casterId?: string): boolean {
    const skill = this.unlockedSkills.get(skillId);
    if (!skill) {
      logger.warn(`Skill not unlocked: ${skillId}`);
      return false;
    }

    if (skill.getType() === SkillType.PASSIVE) {
      logger.warn(`Cannot cast passive skill: ${skillId}`);
      return false;
    }

    if (skill.isOnCooldown()) {
      logger.warn(`Skill on cooldown: ${skillId}`);
      return false;
    }

    // 释放技能
    const effect = skill.getEffect();
    skill.setCurrentCooldown(effect.cooldown);

    // 触发事件
    this.dispatchEvent('skillCast', {
      skillId,
      skillType: skill.getType(),
      casterId,
      timestamp: Date.now()
    });

    logger.info(`Skill cast: ${skill.getName()}`);
    return true;
  }

  /**
   * 获取主动技能列表
   */
  public getActiveSkills(): Skill[] {
    return this.activeSkills
      .map(id => this.unlockedSkills.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  /**
   * 获取被动技能列表
   */
  public getPassiveSkills(): Skill[] {
    return this.passiveSkills
      .map(id => this.unlockedSkills.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  /**
   * 获取终极技能
   */
  public getUltimateSkill(): Skill | null {
    if (!this.ultimateSkill) {
      return null;
    }
    return this.unlockedSkills.get(this.ultimateSkill) || null;
  }

  /**
   * 获取技能
   */
  public getSkill(skillId: string): Skill | null {
    return this.unlockedSkills.get(skillId) || null;
  }

  /**
   * 获取所有已解锁的技能
   */
  public getAllUnlockedSkills(): Map<string, Skill> {
    return new Map(this.unlockedSkills);
  }

  /**
   * 更新所有技能冷却
   */
  public updateAllCooldowns(deltaTime: number): void {
    this.unlockedSkills.forEach(skill => {
      skill.updateCooldown(deltaTime);
    });
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
          logger.error('Error in skill event listener', error);
        }
      });
    }
  }

  /**
   * 保存技能状态
   */
  public saveState(): object {
    const state: any = {
      unlockedSkills: {},
      activeSkills: this.activeSkills,
      passiveSkills: this.passiveSkills,
      ultimateSkill: this.ultimateSkill
    };

    this.unlockedSkills.forEach((skill, skillId) => {
      state.unlockedSkills[skillId] = skill.serialize();
    });

    return state;
  }

  /**
   * 加载技能状态
   */
  public loadState(state: any): void {
    if (!state) {
      logger.warn('No skill state to load');
      return;
    }

    // 清空当前状态
    this.unlockedSkills.clear();
    this.activeSkills = [];
    this.passiveSkills = [];
    this.ultimateSkill = null;

    // 加载解锁的技能
    if (state.unlockedSkills) {
      Object.entries(state.unlockedSkills).forEach(([skillId, skillData]: [string, any]) => {
        const skill = Skill.deserialize(skillData, this.skillDatabase);
        if (skill) {
          this.unlockedSkills.set(skillId, skill);
        }
      });
    }

    // 恢复分类
    if (state.activeSkills) {
      this.activeSkills = state.activeSkills;
    }
    if (state.passiveSkills) {
      this.passiveSkills = state.passiveSkills;
    }
    if (state.ultimateSkill) {
      this.ultimateSkill = state.ultimateSkill;
    }

    logger.info('Skill state loaded');
  }

  /**
   * 获取技能统计信息
   */
  public getSkillStats(): any {
    const stats = {
      totalSkills: this.skillDatabase.size,
      unlockedSkills: this.unlockedSkills.size,
      activeSkills: this.activeSkills.length,
      passiveSkills: this.passiveSkills.length,
      hasUltimate: this.ultimateSkill !== null,
      totalEnhancementLevel: 0,
      skillsOnCooldown: 0
    };

    this.unlockedSkills.forEach(skill => {
      stats.totalEnhancementLevel += skill.getEnhancementLevel();
      if (skill.isOnCooldown()) {
        stats.skillsOnCooldown++;
      }
    });

    return stats;
  }

  /**
   * 销毁技能管理器
   */
  public destroy(): void {
    this.unlockedSkills.clear();
    this.activeSkills = [];
    this.passiveSkills = [];
    this.ultimateSkill = null;
    this.eventListeners.clear();
    logger.info('SkillManager destroyed');
  }
}

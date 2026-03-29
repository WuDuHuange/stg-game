/**
 * 技能强化管理器
 * 通过击杀敌人强化技能效果
 */

import { Skill } from '@data/SkillData';
import { logger } from '@utils/Logger';

/**
 * 技能强化进度
 */
export interface SkillEnhancementProgress {
  skillId: string;
  currentLevel: number;
  currentKills: number;
  killsNeeded: number;
  maxLevel: number;
}

/**
 * 技能强化事件
 */
export type SkillEnhancementEvent = {
  skillId: string;
  oldLevel: number;
  newLevel: number;
  timestamp: number;
};

export class SkillEnhancementManager {
  private skills: Map<string, Skill>;
  private killCounts: Map<string, number>;
  private killsPerLevel: number;
  private eventListeners: Array<(event: SkillEnhancementEvent) => void>;

  constructor(skills: Map<string, Skill>, killsPerLevel: number = 10) {
    this.skills = skills;
    this.killCounts = new Map();
    this.killsPerLevel = killsPerLevel;
    this.eventListeners = [];

    // 初始化击杀数
    this.skills.forEach((skill, skillId) => {
      this.killCounts.set(skillId, skill.getEnhancementLevel() * this.killsPerLevel);
    });
  }

  /**
   * 增加击杀数
   */
  public addKill(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (!skill) {
      logger.warn(`Skill not found: ${skillId}`);
      return;
    }

    if (skill.isMaxEnhanced()) {
      return;
    }

    const currentKills = this.killCounts.get(skillId) || 0;
    const newKills = currentKills + 1;
    this.killCounts.set(skillId, newKills);

    // 检查是否可以强化
    this.checkEnhancement(skillId);
  }

  /**
   * 增加多个击杀数
   */
  public addKills(skillId: string, kills: number): void {
    const skill = this.skills.get(skillId);
    if (!skill) {
      logger.warn(`Skill not found: ${skillId}`);
      return;
    }

    if (skill.isMaxEnhanced()) {
      return;
    }

    const currentKills = this.killCounts.get(skillId) || 0;
    const newKills = currentKills + kills;
    this.killCounts.set(skillId, newKills);

    // 检查是否可以强化
    this.checkEnhancement(skillId);
  }

  /**
   * 检查是否可以强化
   */
  private checkEnhancement(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (!skill || skill.isMaxEnhanced()) {
      return;
    }

    const currentLevel = skill.getEnhancementLevel();
    const killsNeeded = (currentLevel + 1) * this.killsPerLevel;
    const currentKills = this.killCounts.get(skillId) || 0;

    if (currentKills >= killsNeeded) {
      const oldLevel = currentLevel;
      const success = skill.enhance();

      if (success) {
        const newLevel = skill.getEnhancementLevel();
        
        // 触发事件
        this.dispatchEvent({
          skillId,
          oldLevel,
          newLevel,
          timestamp: Date.now()
        });

        logger.info(`Skill enhanced: ${skill.getName()} to level ${newLevel}`);
      }
    }
  }

  /**
   * 获取技能强化进度
   */
  public getEnhancementProgress(skillId: string): SkillEnhancementProgress | null {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return null;
    }

    const currentLevel = skill.getEnhancementLevel();
    const currentKills = this.killCounts.get(skillId) || 0;
    const killsNeeded = Math.min(
      (currentLevel + 1) * this.killsPerLevel,
      skill.getData().maxEnhancementLevel * this.killsPerLevel
    );

    return {
      skillId,
      currentLevel,
      currentKills,
      killsNeeded,
      maxLevel: skill.getData().maxEnhancementLevel
    };
  }

  /**
   * 获取所有技能强化进度
   */
  public getAllEnhancementProgress(): Map<string, SkillEnhancementProgress> {
    const progress = new Map<string, SkillEnhancementProgress>();

    this.skills.forEach((skill, skillId) => {
      const skillProgress = this.getEnhancementProgress(skillId);
      if (skillProgress) {
        progress.set(skillId, skillProgress);
      }
    });

    return progress;
  }

  /**
   * 手动强化技能
   */
  public enhanceSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) {
      logger.warn(`Skill not found: ${skillId}`);
      return false;
    }

    if (skill.isMaxEnhanced()) {
      logger.warn(`Skill already at max level: ${skillId}`);
      return false;
    }

    const oldLevel = skill.getEnhancementLevel();
    const success = skill.enhance();

    if (success) {
      const newLevel = skill.getEnhancementLevel();
      
      // 更新击杀数
      this.killCounts.set(skillId, newLevel * this.killsPerLevel);

      // 触发事件
      this.dispatchEvent({
        skillId,
        oldLevel,
        newLevel,
        timestamp: Date.now()
      });

      logger.info(`Skill manually enhanced: ${skill.getName()} to level ${newLevel}`);
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
   * 重置技能强化进度
   */
  public resetSkill(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (!skill) {
      logger.warn(`Skill not found: ${skillId}`);
      return;
    }

    skill.setEnhancementLevel(0);
    this.killCounts.set(skillId, 0);

    logger.info(`Skill enhancement reset: ${skill.getName()}`);
  }

  /**
   * 重置所有技能强化进度
   */
  public resetAllSkills(): void {
    this.skills.forEach((skill, skillId) => {
      this.resetSkill(skillId);
    });
    logger.info('All skill enhancements reset');
  }

  /**
   * 注册强化事件监听器
   */
  public onEnhancement(callback: (event: SkillEnhancementEvent) => void): void {
    this.eventListeners.push(callback);
  }

  /**
   * 移除强化事件监听器
   */
  public offEnhancement(callback: (event: SkillEnhancementEvent) => void): void {
    const index = this.eventListeners.indexOf(callback);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * 分发事件
   */
  private dispatchEvent(event: SkillEnhancementEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in skill enhancement listener', error);
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

    this.killCounts.forEach((kills, skillId) => {
      state.killCounts[skillId] = kills;
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
      Object.entries(state.killCounts).forEach(([skillId, kills]: [string, any]) => {
        this.killCounts.set(skillId, kills);
      });
    }

    logger.info('Enhancement state loaded');
  }

  /**
   * 获取强化统计信息
   */
  public getEnhancementStats(): any {
    let totalLevel = 0;
    let maxLevelSkills = 0;
    let totalKills = 0;

    this.skills.forEach((skill, skillId) => {
      totalLevel += skill.getEnhancementLevel();
      if (skill.isMaxEnhanced()) {
        maxLevelSkills++;
      }
      totalKills += this.killCounts.get(skillId) || 0;
    });

    return {
      totalSkills: this.skills.size,
      totalLevel,
      averageLevel: this.skills.size > 0 ? totalLevel / this.skills.size : 0,
      maxLevelSkills,
      totalKills,
      killsPerLevel: this.killsPerLevel
    };
  }

  /**
   * 销毁技能强化管理器
   */
  public destroy(): void {
    this.killCounts.clear();
    this.eventListeners = [];
    logger.info('SkillEnhancementManager destroyed');
  }
}

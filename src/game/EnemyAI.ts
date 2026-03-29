/**
 * 敌人AI系统（简化版）
 */

import { Enemy, EnemyState } from '@data/EnemyData';
import { logger } from '@utils/Logger';

export class EnemyAI {
  private enemy: Enemy;
  private target: any;
  private lastStateChange: number;
  private stateChangeInterval: number;

  constructor(enemy: Enemy) {
    this.enemy = enemy;
    this.target = null;
    this.lastStateChange = 0;
    this.stateChangeInterval = 1000;
  }

  /**
   * 更新AI
   */
  public update(deltaTime: number, playerPosition: any): void {
    if (!this.enemy.isAlive()) {
      return;
    }

    this.target = playerPosition;
    const currentState = this.enemy.getCurrentState();

    switch (currentState) {
      case EnemyState.IDLE:
        this.updateIdle();
        break;
      case EnemyState.PATROL:
        this.updatePatrol();
        break;
      case EnemyState.CHASE:
        this.updateChase();
        break;
      case EnemyState.ATTACK:
        this.updateAttack();
        break;
      case EnemyState.RETREAT:
        this.updateRetreat();
        break;
    }
  }

  /**
   * 更新待机状态
   */
  private updateIdle(): void {
    const now = Date.now();
    if (now - this.lastStateChange > this.stateChangeInterval) {
      // 检查是否需要追击
      if (this.shouldChase()) {
        this.enemy.setCurrentState(EnemyState.CHASE);
        this.lastStateChange = now;
      }
    }
  }

  /**
   * 更新巡逻状态
   */
  private updatePatrol(): void {
    // 简化巡逻逻辑
    const now = Date.now();
    if (now - this.lastStateChange > this.stateChangeInterval) {
      if (this.shouldChase()) {
        this.enemy.setCurrentState(EnemyState.CHASE);
        this.lastStateChange = now;
      }
    }
  }

  /**
   * 更新追击状态
   */
  private updateChase(): void {
    // 简化追击逻辑
    if (this.shouldAttack()) {
      this.enemy.setCurrentState(EnemyState.ATTACK);
      this.lastStateChange = Date.now();
    } else if (!this.shouldChase()) {
      this.enemy.setCurrentState(EnemyState.PATROL);
      this.lastStateChange = Date.now();
    }
  }

  /**
   * 更新攻击状态
   */
  private updateAttack(): void {
    // 简化攻击逻辑
    const now = Date.now();
    if (now - this.lastStateChange > this.stateChangeInterval) {
      if (!this.shouldAttack()) {
        this.enemy.setCurrentState(EnemyState.CHASE);
        this.lastStateChange = now;
      }
    }
  }

  /**
   * 更新撤退状态
   */
  private updateRetreat(): void {
    // 简化撤退逻辑
    const now = Date.now();
    if (now - this.lastStateChange > this.stateChangeInterval) {
      if (this.shouldChase()) {
        this.enemy.setCurrentState(EnemyState.CHASE);
        this.lastStateChange = now;
      }
    }
  }

  /**
   * 检查是否应该追击
   */
  private shouldChase(): boolean {
    // 简化逻辑：总是追击
    return true;
  }

  /**
   * 检查是否应该攻击
   */
  private shouldAttack(): boolean {
    // 简化逻辑：随机决定
    return Math.random() < 0.3;
  }

  /**
   * 设置目标
   */
  public setTarget(target: any): void {
    this.target = target;
  }

  /**
   * 获取目标
   */
  public getTarget(): any {
    return this.target;
  }
}

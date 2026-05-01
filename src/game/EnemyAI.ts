/**
 * 敌人AI系统 - 状态机驱动，直接操作Phaser GameObject
 */

import { EnemyState } from '@data/EnemyData';

export interface EnemyAIConfig {
    chaseRange: number;
    attackRange: number;
    retreatHealthPercent: number;
    patrolSpeed: number;
    chaseSpeed: number;
    retreatSpeed: number;
}

const DEFAULT_CONFIG: EnemyAIConfig = {
    chaseRange: 400,
    attackRange: 200,
    retreatHealthPercent: 0.2,
    patrolSpeed: 60,
    chaseSpeed: 120,
    retreatSpeed: 80
};

export class EnemyAI {
    private enemySprite: any;
    private state: EnemyState;
    private lastStateChange: number;
    private stateChangeInterval: number;
    private config: EnemyAIConfig;
    private patrolAngle: number;
    private patrolDirection: number;
    private targetY: number;

    constructor(enemySprite: any, config?: Partial<EnemyAIConfig>) {
        this.enemySprite = enemySprite;
        this.state = EnemyState.PATROL;
        this.lastStateChange = 0;
        this.stateChangeInterval = 800;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.patrolAngle = Math.random() * Math.PI * 2;
        this.patrolDirection = 1;
        this.targetY = enemySprite.scene?.cameras?.main?.height * 0.25 ?? 150;
    }

    public getState(): EnemyState {
        return this.state;
    }

    public update(delta: number, playerX: number, playerY: number, sceneWidth: number, sceneHeight: number): void {
        if (!this.enemySprite || !this.enemySprite.active) return;

        const dt = delta / 1000;
        const now = Date.now();
        const ex = this.enemySprite.x;
        const ey = this.enemySprite.y;
        const distToPlayer = Math.sqrt((ex - playerX) ** 2 + (ey - playerY) ** 2);
        const healthPercent = (this.enemySprite.getData('health') || 1) / (this.enemySprite.getData('maxHealth') || 1);

        this.evaluateState(distToPlayer, healthPercent, now);

        switch (this.state) {
            case EnemyState.IDLE:
                this.executeIdle(dt);
                break;
            case EnemyState.PATROL:
                this.executePatrol(dt, sceneWidth, sceneHeight);
                break;
            case EnemyState.CHASE:
                this.executeChase(dt, playerX, playerY);
                break;
            case EnemyState.ATTACK:
                this.executeAttack(dt, playerX, playerY, sceneWidth);
                break;
            case EnemyState.RETREAT:
                this.executeRetreat(dt, sceneHeight);
                break;
        }
    }

    private evaluateState(distToPlayer: number, healthPercent: number, now: number): void {
        if (now - this.lastStateChange < this.stateChangeInterval) return;

        let newState = this.state;

        if (healthPercent <= this.config.retreatHealthPercent && this.state !== EnemyState.RETREAT) {
            newState = EnemyState.RETREAT;
        } else if (this.state === EnemyState.RETREAT && healthPercent > this.config.retreatHealthPercent + 0.1) {
            newState = EnemyState.CHASE;
        } else if (distToPlayer <= this.config.attackRange) {
            newState = EnemyState.ATTACK;
        } else if (distToPlayer <= this.config.chaseRange) {
            newState = EnemyState.CHASE;
        } else {
            newState = EnemyState.PATROL;
        }

        if (newState !== this.state) {
            this.state = newState;
            this.lastStateChange = now;
            this.enemySprite.setData('aiState', this.state);
        }
    }

    private executeIdle(dt: number): void {
    }

    private executePatrol(dt: number, sceneWidth: number, sceneHeight: number): void {
        const speed = this.enemySprite.getData('speed') || this.config.patrolSpeed;
        this.enemySprite.y += speed * dt * 0.5;

        this.patrolAngle += dt * 0.5 * this.patrolDirection;
        this.enemySprite.x += Math.sin(this.patrolAngle) * speed * 0.3 * dt;

        if (this.enemySprite.x < 30 || this.enemySprite.x > sceneWidth - 30) {
            this.patrolDirection *= -1;
        }
    }

    private executeChase(dt: number, playerX: number, playerY: number): void {
        const speed = this.enemySprite.getData('speed') || this.config.chaseSpeed;
        const dx = playerX - this.enemySprite.x;
        const dy = playerY - this.enemySprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            this.enemySprite.x += (dx / dist) * speed * dt;
            this.enemySprite.y += (dy / dist) * speed * dt * 0.5;
        }
    }

    private executeAttack(dt: number, playerX: number, playerY: number, sceneWidth: number): void {
        const speed = (this.enemySprite.getData('speed') || 60) * 0.3;
        const dx = playerX - this.enemySprite.x;

        if (Math.abs(dx) > 30) {
            this.enemySprite.x += Math.sign(dx) * speed * dt;
        }

        this.enemySprite.x += Math.sin(Date.now() / 1000 * 2) * speed * 0.5 * dt;

        if (this.enemySprite.x < 30) this.enemySprite.x = 30;
        if (this.enemySprite.x > sceneWidth - 30) this.enemySprite.x = sceneWidth - 30;
    }

    private executeRetreat(dt: number, sceneHeight: number): void {
        const speed = this.enemySprite.getData('speed') || this.config.retreatSpeed;
        const retreatY = sceneHeight * 0.15;

        if (this.enemySprite.y > retreatY) {
            this.enemySprite.y -= speed * dt * 0.8;
        }

        this.enemySprite.x += Math.sin(Date.now() / 1000 * 3) * speed * 0.5 * dt;
    }

    public forceState(state: EnemyState): void {
        this.state = state;
        this.lastStateChange = Date.now();
        this.enemySprite.setData('aiState', state);
    }

    public destroy(): void {
        this.enemySprite = null;
    }
}

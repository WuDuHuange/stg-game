/**
 * 自机 STG 规则系统
 * 管理判定点、残机、Power 火力等级、Bomb、擦弹计数与无敌状态。
 * Easy 难度可切换为血条制（useHealthMode）。
 */

export interface STGPlayerState {
    lives: number;
    bombs: number;
    power: number;           // 0~5
    graze: number;
    hitboxRadius: number;    // 判定点半径 px
    invincible: boolean;
    focus: boolean;
    health: number;          // health 模式专用
    maxHealth: number;
    useHealthMode: boolean;
}

export const DEFAULT_HITBOX_RADIUS = 3;
export const MAX_LIVES = 5;
export const MAX_BOMBS = 3;
export const MAX_POWER = 5;
export const INVINCIBLE_DURATION_MS = 1500;

export class STGPlayerSystem {
    private lives: number = 3;
    private bombs: number = 2;
    private power: number = 0;
    private graze: number = 0;
    private hitboxRadius: number = DEFAULT_HITBOX_RADIUS;
    private invincible: boolean = false;
    private invincibleTimer: number = 0;
    private focus: boolean = false;
    private bombActive: boolean = false;
    private bombTimer: number = 0;
    private useHealthMode: boolean = false;
    private health: number = 100;
    private maxHealth: number = 100;

    constructor(options?: { useHealthMode?: boolean; hitboxRadius?: number }) {
        if (options) {
            this.useHealthMode = options.useHealthMode ?? false;
            this.hitboxRadius = options.hitboxRadius ?? DEFAULT_HITBOX_RADIUS;
        }
        this.reset();
    }

    public reset(): void {
        this.lives = 3;
        this.bombs = 2;
        this.power = 0;
        this.graze = 0;
        this.health = this.maxHealth;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.bombActive = false;
        this.bombTimer = 0;
        this.focus = false;
    }

    public setHealthMode(enabled: boolean): void {
        this.useHealthMode = enabled;
        this.health = this.maxHealth;
    }

    public isHealthMode(): boolean {
        return this.useHealthMode;
    }

    /**
     * 自机被弹。返回 true 表示游戏结束（残机耗尽 / 血量归零）。
     */
    public onHit(damage: number = 1): boolean {
        if (this.invincible || this.bombActive) return false;

        if (this.useHealthMode) {
            this.health -= damage;
            if (this.health <= 0) {
                this.health = 0;
                return true;
            }
            this.invincible = true;
            this.invincibleTimer = INVINCIBLE_DURATION_MS;
            return false;
        }

        this.lives--;
        if (this.lives < 0) {
            this.lives = 0;
            return true;
        }
        this.invincible = true;
        this.invincibleTimer = INVINCIBLE_DURATION_MS;
        return false;
    }

    /**
     * 擦弹计数（判定圈内近距离弹）
     */
    public addGraze(amount: number = 1): void {
        this.graze += amount;
    }

    public getGraze(): number {
        return this.graze;
    }

    public setPower(p: number): void {
        this.power = Math.max(0, Math.min(MAX_POWER, p));
    }

    public addPower(amount: number = 1): void {
        this.setPower(this.power + amount);
    }

    public getPower(): number {
        return this.power;
    }

    public addBomb(count: number = 1): void {
        this.bombs = Math.min(MAX_BOMBS, this.bombs + count);
    }

    /**
     * 使用 Bomb，返回是否成功
     */
    public useBomb(): boolean {
        if (this.bombs <= 0 || this.bombActive) return false;
        this.bombs--;
        this.bombActive = true;
        this.bombTimer = 2000; // Bomb 无敌窗口 ms
        this.invincible = true;
        this.invincibleTimer = Math.max(this.invincibleTimer, this.bombTimer);
        return true;
    }

    public getBombs(): number {
        return this.bombs;
    }

    public isBombActive(): boolean {
        return this.bombActive;
    }

    public setFocus(focused: boolean): void {
        this.focus = focused;
    }

    public isFocus(): boolean {
        return this.focus;
    }

    public getLives(): number {
        return this.lives;
    }

    public getHitboxRadius(): number {
        return this.hitboxRadius;
    }

    public isInvincible(): boolean {
        return this.invincible || this.bombActive;
    }

    public addLife(count: number = 1): void {
        this.lives = Math.min(MAX_LIVES, this.lives + count);
    }

    public getHealth(): number {
        return this.health;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public heal(amount: number): void {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    public getState(): STGPlayerState {
        return {
            lives: this.lives,
            bombs: this.bombs,
            power: this.power,
            graze: this.graze,
            hitboxRadius: this.hitboxRadius,
            invincible: this.isInvincible(),
            focus: this.focus,
            health: this.health,
            maxHealth: this.maxHealth,
            useHealthMode: this.useHealthMode
        };
    }

    /**
     * 每帧更新（递减无敌 / Bomb 计时）
     */
    public update(delta: number): void {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= delta;
            if (this.invincibleTimer <= 0) {
                this.invincibleTimer = 0;
                this.invincible = false;
            }
        }
        if (this.bombTimer > 0) {
            this.bombTimer -= delta;
            if (this.bombTimer <= 0) {
                this.bombTimer = 0;
                this.bombActive = false;
            }
        }
    }
}
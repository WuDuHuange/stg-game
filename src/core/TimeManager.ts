/**
 * 时间管理器
 * 提供deltaTime和timeScale控制
 */

import { logger } from '@utils/Logger';

export class TimeManager {
    private static instance: TimeManager;
    private deltaTime: number = 0;
    private timeScale: number = 1.0;
    private totalTime: number = 0;
    private unscaledTime: number = 0;
    private frameCount: number = 0;
    private targetFPS: number = 60;

    private constructor() {}

    /**
     * 获取TimeManager实例
     */
    public static getInstance(): TimeManager {
        if (!TimeManager.instance) {
            TimeManager.instance = new TimeManager();
        }
        return TimeManager.instance;
    }

    /**
     * 更新时间
     */
    public update(realDeltaTime: number): void {
        this.deltaTime = realDeltaTime * this.timeScale;
        this.totalTime += this.deltaTime;
        this.unscaledTime += realDeltaTime;
        this.frameCount++;
    }

    /**
     * 获取deltaTime（受timeScale影响）
     */
    public getDeltaTime(): number {
        return this.deltaTime;
    }

    /**
     * 获取未缩放的deltaTime
     */
    public getUnscaledDeltaTime(): number {
        return this.deltaTime / this.timeScale;
    }

    /**
     * 获取timeScale
     */
    public getTimeScale(): number {
        return this.timeScale;
    }

    /**
     * 设置timeScale
     */
    public setTimeScale(scale: number): void {
        if (scale < 0) {
            logger.warn('TimeScale cannot be negative');
            return;
        }

        const oldScale = this.timeScale;
        this.timeScale = scale;
        logger.info(`TimeScale changed from ${oldScale} to ${scale}`);
    }

    /**
     * 暂停时间（timeScale = 0）
     */
    public pause(): void {
        this.timeScale = 0;
        logger.info('Time paused');
    }

    /**
     * 恢复时间（timeScale = 1）
     */
    public resume(): void {
        this.timeScale = 1;
        logger.info('Time resumed');
    }

    /**
     * 检查时间是否暂停
     */
    public isPaused(): boolean {
        return this.timeScale === 0;
    }

    /**
     * 获取总时间（受timeScale影响）
     */
    public getTotalTime(): number {
        return this.totalTime;
    }

    /**
     * 获取未缩放的总时间
     */
    public getUnscaledTime(): number {
        return this.unscaledTime;
    }

    /**
     * 获取帧数
     */
    public getFrameCount(): number {
        return this.frameCount;
    }

    /**
     * 重置帧数
     */
    public resetFrameCount(): void {
        this.frameCount = 0;
        logger.info('Frame count reset');
    }

    /**
     * 获取目标FPS
     */
    public getTargetFPS(): number {
        return this.targetFPS;
    }

    /**
     * 设置目标FPS
     */
    public setTargetFPS(fps: number): void {
        if (fps <= 0) {
            logger.warn('Target FPS must be positive');
            return;
        }

        this.targetFPS = fps;
        logger.info(`Target FPS set to ${fps}`);
    }

    /**
     * 获取实际FPS
     */
    public getActualFPS(): number {
        if (this.deltaTime === 0) return 0;
        return 1 / this.deltaTime;
    }

    /**
     * 重置时间
     */
    public reset(): void {
        this.deltaTime = 0;
        this.timeScale = 1.0;
        this.totalTime = 0;
        this.unscaledTime = 0;
        this.frameCount = 0;
        logger.info('TimeManager reset');
    }

    /**
     * 创建定时器
     */
    public setTimeout(callback: () => void, delay: number): number {
        const targetTime = this.totalTime + delay;
        const timerId = Date.now() + Math.random();

        // 这里需要实现定时器逻辑
        // 实际使用时需要在update中检查定时器
        logger.info(`Timer created: ID=${timerId}, Delay=${delay}s`);

        return timerId;
    }

    /**
     * 创建间隔定时器
     */
    public setInterval(callback: () => void, interval: number): number {
        const timerId = Date.now() + Math.random();

        // 这里需要实现间隔定时器逻辑
        // 实际使用时需要在update中检查定时器
        logger.info(`Interval timer created: ID=${timerId}, Interval=${interval}s`);

        return timerId;
    }

    /**
     * 清除定时器
     */
    public clearTimeout(timerId: number): void {
        logger.info(`Timer cleared: ID=${timerId}`);
    }

    /**
     * 清除间隔定时器
     */
    public clearInterval(timerId: number): void {
        logger.info(`Interval timer cleared: ID=${timerId}`);
    }
}

// 导出单例实例
export const timeManager = TimeManager.getInstance();

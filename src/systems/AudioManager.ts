/**
 * 音频管理器
 * 管理音效和背景音乐播放，支持音量控制和音效池优化
 */

import Phaser from 'phaser';
import { logger } from '@utils/Logger';

/**
 * 音频类型
 */
export enum AudioType {
    SFX = 'SFX',           // 音效
    MUSIC = 'MUSIC',       // 背景音乐
    AMBIENT = 'AMBIENT'    // 环境音
}

/**
 * 音频配置
 */
export type AudioConfig = {
    type: AudioType;
    volume: number;
    loop: boolean;
    rate: number;
    detune: number;
};

/**
 * 音效池配置
 */
export type SoundPoolConfig = {
    key: string;
    maxSize: number;
    audioConfig: AudioConfig;
};

/**
 * 音效池项
 */
type SoundPoolItem = {
    sound: Phaser.Sound.BaseSound;
    inUse: boolean;
};

export class AudioManager {
    private static instance: AudioManager;
    private scene: Phaser.Scene | null = null;
    private masterVolume: number = 1.0;
    private sfxVolume: number = 1.0;
    private musicVolume: number = 1.0;
    private ambientVolume: number = 1.0;
    private soundPools: Map<string, SoundPoolItem[]> = new Map();
    private currentMusic: Phaser.Sound.BaseSound | null = null;
    private currentAmbient: Phaser.Sound.BaseSound | null = null;

    private constructor() {}

    /**
     * 获取AudioManager实例
     */
    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * 初始化音频管理器
     */
    public initialize(scene: Phaser.Scene): void {
        this.scene = scene;
        logger.info('AudioManager initialized');

        // 设置默认音量
        this.updateAllVolumes();
    }

    /**
     * 创建音效池
     */
    public createSoundPool(key: string, maxSize: number = 10, audioConfig?: Partial<AudioConfig>): void {
        if (this.soundPools.has(key)) {
            logger.warn(`Sound pool already exists for key: ${key}`);
            return;
        }

        const config: AudioConfig = {
            type: AudioType.SFX,
            volume: 1.0,
            loop: false,
            rate: 1.0,
            detune: 0,
            ...audioConfig
        };

        this.soundPools.set(key, []);
        logger.info(`Sound pool created: ${key}`, { maxSize, config });
    }

    /**
     * 播放音效（使用音效池）
     */
    public playSFX(key: string, config?: Partial<AudioConfig>): Phaser.Sound.BaseSound | null {
        if (!this.scene) {
            logger.error('Scene not initialized');
            return null;
        }

        // 检查音效池
        const pool = this.soundPools.get(key);
        let sound: Phaser.Sound.BaseSound | null = null;

        if (pool) {
            // 从池中获取可用音效
            const availableSound = pool.find(item => !item.inUse);
            if (availableSound) {
                sound = availableSound.sound;
                availableSound.inUse = true;
            } else {
                // 池中没有可用音效，创建新的
                sound = this.scene.sound.add(key, {
                    volume: this.sfxVolume * this.masterVolume,
                    ...config
                });
                pool.push({ sound, inUse: true });
                logger.debug(`New sound added to pool: ${key}`);
            }
        } else {
            // 没有池，直接创建
            sound = this.scene.sound.add(key, {
                volume: this.sfxVolume * this.masterVolume,
                ...config
            });
        }

        if (sound) {
            // 设置音效结束监听
            sound.once('complete', () => {
                if (pool) {
                    const item = pool.find(i => i.sound === sound);
                    if (item) {
                        item.inUse = false;
                    }
                }
            });

            sound.play();
        }

        return sound;
    }

    /**
     * 播放背景音乐
     */
    public playMusic(key: string, config?: Partial<AudioConfig>): void {
        if (!this.scene) {
            logger.error('Scene not initialized');
            return;
        }

        // 停止当前音乐
        this.stopMusic();

        const audioConfig: AudioConfig = {
            type: AudioType.MUSIC,
            volume: this.musicVolume * this.masterVolume,
            loop: true,
            rate: 1.0,
            detune: 0,
            ...config
        };

        this.currentMusic = this.scene.sound.add(key, audioConfig);
        this.currentMusic.play();
        logger.info(`Music started: ${key}`);
    }

    /**
     * 停止背景音乐
     */
    public stopMusic(): void {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
            logger.info('Music stopped');
        }
    }

    /**
     * 暂停背景音乐
     */
    public pauseMusic(): void {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.pause();
            logger.info('Music paused');
        }
    }

    /**
     * 恢复背景音乐
     */
    public resumeMusic(): void {
        if (this.currentMusic && this.currentMusic.isPaused) {
            this.currentMusic.resume();
            logger.info('Music resumed');
        }
    }

    /**
     * 播放环境音
     */
    public playAmbient(key: string, config?: Partial<AudioConfig>): void {
        if (!this.scene) {
            logger.error('Scene not initialized');
            return;
        }

        // 停止当前环境音
        this.stopAmbient();

        const audioConfig: AudioConfig = {
            type: AudioType.AMBIENT,
            volume: this.ambientVolume * this.masterVolume,
            loop: true,
            rate: 1.0,
            detune: 0,
            ...config
        };

        this.currentAmbient = this.scene.sound.add(key, audioConfig);
        this.currentAmbient.play();
        logger.info(`Ambient started: ${key}`);
    }

    /**
     * 停止环境音
     */
    public stopAmbient(): void {
        if (this.currentAmbient) {
            this.currentAmbient.stop();
            this.currentAmbient.destroy();
            this.currentAmbient = null;
            logger.info('Ambient stopped');
        }
    }

    /**
     * 设置主音量
     */
    public setMasterVolume(volume: number): void {
        this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.updateAllVolumes();
        logger.info(`Master volume set to: ${this.masterVolume}`);
    }

    /**
     * 设置音效音量
     */
    public setSFXVolume(volume: number): void {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.updateAllVolumes();
        logger.info(`SFX volume set to: ${this.sfxVolume}`);
    }

    /**
     * 设置音乐音量
     */
    public setMusicVolume(volume: number): void {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.updateAllVolumes();
        logger.info(`Music volume set to: ${this.musicVolume}`);
    }

    /**
     * 设置环境音音量
     */
    public setAmbientVolume(volume: number): void {
        this.ambientVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.updateAllVolumes();
        logger.info(`Ambient volume set to: ${this.ambientVolume}`);
    }

    /**
     * 更新所有音量
     */
    private updateAllVolumes(): void {
        if (!this.scene) return;

        // 更新背景音乐音量
        if (this.currentMusic) {
            this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
        }

        // 更新环境音音量
        if (this.currentAmbient) {
            this.currentAmbient.setVolume(this.ambientVolume * this.masterVolume);
        }

        // 更新音效池中的音量
        this.soundPools.forEach(pool => {
            pool.forEach(item => {
                if (item.sound) {
                    item.sound.setVolume(this.sfxVolume * this.masterVolume);
                }
            });
        });
    }

    /**
     * 获取主音量
     */
    public getMasterVolume(): number {
        return this.masterVolume;
    }

    /**
     * 获取音效音量
     */
    public getSFXVolume(): number {
        return this.sfxVolume;
    }

    /**
     * 获取音乐音量
     */
    public getMusicVolume(): number {
        return this.musicVolume;
    }

    /**
     * 获取环境音音量
     */
    public getAmbientVolume(): number {
        return this.ambientVolume;
    }

    /**
     * 静音所有音频
     */
    public muteAll(): void {
        this.setMasterVolume(0);
    }

    /**
     * 取消静音
     */
    public unmuteAll(): void {
        this.setMasterVolume(1);
    }

    /**
     * 检查是否静音
     */
    public isMuted(): boolean {
        return this.masterVolume === 0;
    }

    /**
     * 暂停所有音频
     */
    public pauseAll(): void {
        if (!this.scene) return;
        this.scene.sound.pauseAll();
        logger.info('All audio paused');
    }

    /**
     * 恢复所有音频
     */
    public resumeAll(): void {
        if (!this.scene) return;
        this.scene.sound.resumeAll();
        logger.info('All audio resumed');
    }

    /**
     * 停止所有音频
     */
    public stopAll(): void {
        if (!this.scene) return;
        this.scene.sound.stopAll();
        this.stopMusic();
        this.stopAmbient();
        logger.info('All audio stopped');
    }

    /**
     * 保存音频配置
     */
    public saveConfig(): string {
        const config = {
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            ambientVolume: this.ambientVolume
        };
        return JSON.stringify(config);
    }

    /**
     * 加载音频配置
     */
    public loadConfig(configJson: string): void {
        try {
            const config = JSON.parse(configJson);
            this.setMasterVolume(config.masterVolume || 1.0);
            this.setSFXVolume(config.sfxVolume || 1.0);
            this.setMusicVolume(config.musicVolume || 1.0);
            this.setAmbientVolume(config.ambientVolume || 1.0);
            logger.info('Audio config loaded');
        } catch (error) {
            logger.error('Failed to load audio config', error);
        }
    }

    /**
     * 清理音效池
     */
    public clearSoundPool(key: string): void {
        const pool = this.soundPools.get(key);
        if (pool) {
            pool.forEach(item => {
                if (item.sound) {
                    item.sound.destroy();
                }
            });
            this.soundPools.delete(key);
            logger.info(`Sound pool cleared: ${key}`);
        }
    }

    /**
     * 清理所有音效池
     */
    public clearAllSoundPools(): void {
        this.soundPools.forEach((pool, key) => {
            this.clearSoundPool(key);
        });
        logger.info('All sound pools cleared');
    }

    /**
     * 销毁音频管理器
     */
    public destroy(): void {
        this.stopAll();
        this.clearAllSoundPools();
        logger.info('AudioManager destroyed');
    }
}

// 导出单例实例
export const audioManager = AudioManager.getInstance();

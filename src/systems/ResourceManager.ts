/**
 * 资源管理器
 * 管理资源的加载、卸载和缓存
 */

import Phaser from 'phaser';
import { logger } from '@utils/Logger';

/**
 * 资源类型
 */
export enum ResourceType {
    IMAGE = 'IMAGE',
    SPRITE_SHEET = 'SPRITE_SHEET',
    ATLAS = 'ATLAS',
    AUDIO = 'AUDIO',
    JSON = 'JSON',
    TEXT = 'TEXT',
    BINARY = 'BINARY'
}

/**
 * 资源信息
 */
type ResourceInfo = {
    key: string;
    type: ResourceType;
    url: string;
    loaded: boolean;
    referenceCount: number;
    lastUsed: number;
    size: number;
    data: any;
};

/**
 * 资源加载进度
 */
export type LoadProgress = {
    total: number;
    loaded: number;
    percentage: number;
};

/**
 * 资源加载配置
 */
export type LoadConfig = {
    path: string;
    prefix?: string;
    onProgress?: (progress: LoadProgress) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
};

export class ResourceManager {
    private static instance: ResourceManager;
    private scene: Phaser.Scene | null = null;
    private resources: Map<string, ResourceInfo> = new Map();
    private loadQueue: Array<string> = [];
    private isLoading: boolean = false;
    private cacheSize: number = 0;
    private maxCacheSize: number = 100 * 1024 * 1024; // 100MB

    private constructor() {}

    /**
     * 获取ResourceManager实例
     */
    public static getInstance(): ResourceManager {
        if (!ResourceManager.instance) {
            ResourceManager.instance = new ResourceManager();
        }
        return ResourceManager.instance;
    }

    /**
     * 初始化资源管理器
     */
    public initialize(scene: Phaser.Scene): void {
        this.scene = scene;
        logger.info('ResourceManager initialized');

        // 监听资源加载事件
        this.scene.load.on('complete', () => {
            this.isLoading = false;
            logger.info('Resource loading completed');
        });

        this.scene.load.on('progress', (progress: number) => {
            logger.debug(`Loading progress: ${(progress * 100).toFixed(1)}%`);
        });
    }

    /**
     * 加载图片资源
     */
    public loadImage(key: string, url: string): void {
        if (this.resources.has(key)) {
            logger.warn(`Resource already exists: ${key}`);
            return;
        }

        this.scene!.load.image(key, url);
        this.registerResource(key, ResourceType.IMAGE, url);
    }

    /**
     * 加载精灵表资源
     */
    public loadSpriteSheet(
        key: string,
        url: string,
        frameConfig: Phaser.Types.Loader.FileTypes.SpriteSheetFrameConfig
    ): void {
        if (this.resources.has(key)) {
            logger.warn(`Resource already exists: ${key}`);
            return;
        }

        this.scene!.load.spritesheet(key, url, frameConfig);
        this.registerResource(key, ResourceType.SPRITE_SHEET, url);
    }

    /**
     * 加载图集资源
     */
    public loadAtlas(key: string, textureURL: string, atlasURL: string): void {
        if (this.resources.has(key)) {
            logger.warn(`Resource already exists: ${key}`);
            return;
        }

        this.scene!.load.atlas(key, textureURL, atlasURL);
        this.registerResource(key, ResourceType.ATLAS, textureURL);
    }

    /**
     * 加载音频资源
     */
    public loadAudio(key: string, urls: string | string[]): void {
        if (this.resources.has(key)) {
            logger.warn(`Resource already exists: ${key}`);
            return;
        }

        this.scene!.load.audio(key, urls);
        this.registerResource(key, ResourceType.AUDIO, Array.isArray(urls) ? urls[0] : urls);
    }

    /**
     * 加载JSON资源
     */
    public loadJSON(key: string, url: string): void {
        if (this.resources.has(key)) {
            logger.warn(`Resource already exists: ${key}`);
            return;
        }

        this.scene!.load.json(key, url);
        this.registerResource(key, ResourceType.JSON, url);
    }

    /**
     * 加载文本资源
     */
    public loadText(key: string, url: string): void {
        if (this.resources.has(key)) {
            logger.warn(`Resource already exists: ${key}`);
            return;
        }

        this.scene!.load.text(key, url);
        this.registerResource(key, ResourceType.TEXT, url);
    }

    /**
     * 批量加载资源
     */
    public loadResources(config: LoadConfig): void {
        const { path, prefix = '', onProgress, onComplete, onError } = config;

        logger.info(`Loading resources from: ${path}`);

        this.isLoading = true;

        // 设置进度回调
        if (onProgress) {
            this.scene!.load.on('progress', (progress: number) => {
                onProgress({
                    total: this.scene!.load.totalToLoad,
                    loaded: this.scene!.load.progress,
                    percentage: progress * 100
                });
            });
        }

        // 设置完成回调
        if (onComplete) {
            this.scene!.load.once('complete', onComplete);
        }

        // 设置错误回调
        if (onError) {
            this.scene!.load.on('loaderror', (file: Phaser.Loader.File) => {
                onError(new Error(`Failed to load: ${file.key}`));
            });
        }

        this.scene!.load.start();
    }

    /**
     * 开始加载队列中的资源
     */
    public startLoad(): void {
        if (this.isLoading) {
            logger.warn('Already loading resources');
            return;
        }

        if (this.loadQueue.length === 0) {
            logger.warn('No resources to load');
            return;
        }

        logger.info(`Starting load of ${this.loadQueue.length} resources`);
        this.scene!.load.start();
    }

    /**
     * 注册资源
     */
    private registerResource(key: string, type: ResourceType, url: string): void {
        const resourceInfo: ResourceInfo = {
            key,
            type,
            url,
            loaded: false,
            referenceCount: 0,
            lastUsed: Date.now(),
            size: 0,
            data: null
        };

        this.resources.set(key, resourceInfo);
        this.loadQueue.push(key);
        logger.debug(`Resource registered: ${key}`);
    }

    /**
     * 获取资源
     */
    public getResource(key: string): any {
        const resource = this.resources.get(key);
        if (!resource) {
            logger.warn(`Resource not found: ${key}`);
            return null;
        }

        if (!resource.loaded) {
            logger.warn(`Resource not loaded: ${key}`);
            return null;
        }

        // 更新引用计数和最后使用时间
        resource.referenceCount++;
        resource.lastUsed = Date.now();

        return resource.data;
    }

    /**
     * 增加资源引用
     */
    public addReference(key: string): void {
        const resource = this.resources.get(key);
        if (resource) {
            resource.referenceCount++;
            resource.lastUsed = Date.now();
            logger.debug(`Reference added: ${key} (${resource.referenceCount})`);
        }
    }

    /**
     * 释放资源引用
     */
    public releaseReference(key: string): void {
        const resource = this.resources.get(key);
        if (resource) {
            resource.referenceCount--;
            resource.lastUsed = Date.now();
            logger.debug(`Reference released: ${key} (${resource.referenceCount})`);

            // 如果引用计数为0，可以考虑卸载
            if (resource.referenceCount <= 0) {
                this.unloadResource(key);
            }
        }
    }

    /**
     * 卸载资源
     */
    public unloadResource(key: string): void {
        const resource = this.resources.get(key);
        if (!resource) {
            logger.warn(`Resource not found: ${key}`);
            return;
        }

        if (resource.referenceCount > 0) {
            logger.warn(`Cannot unload resource with active references: ${key}`);
            return;
        }

        // 卸载资源
        this.scene!.cache.remove(resource.type.toLowerCase() as any);
        this.resources.delete(key);
        this.cacheSize -= resource.size;

        logger.info(`Resource unloaded: ${key}`);
    }

    /**
     * 清理未使用的资源
     */
    public cleanupUnusedResources(maxAge: number = 300000): void {
        const now = Date.now();
        const toUnload: string[] = [];

        this.resources.forEach((resource, key) => {
            if (resource.referenceCount === 0 && (now - resource.lastUsed) > maxAge) {
                toUnload.push(key);
            }
        });

        toUnload.forEach(key => this.unloadResource(key));
        logger.info(`Cleaned up ${toUnload.length} unused resources`);
    }

    /**
     * 清理缓存（当缓存超过最大限制时）
     */
    private cleanupCache(): void {
        if (this.cacheSize <= this.maxCacheSize) return;

        // 按最后使用时间排序
        const sortedResources = Array.from(this.resources.entries())
            .filter(([_, resource]) => resource.referenceCount === 0)
            .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

        // 卸载最久未使用的资源
        let freedSpace = 0;
        for (const [key, resource] of sortedResources) {
            if (this.cacheSize - freedSpace <= this.maxCacheSize * 0.8) break;

            freedSpace += resource.size;
            this.unloadResource(key);
        }

        logger.info(`Cache cleanup freed ${freedSpace} bytes`);
    }

    /**
     * 预加载资源
     */
    public preloadResources(keys: string[]): void {
        keys.forEach(key => {
            const resource = this.resources.get(key);
            if (resource && !resource.loaded) {
                logger.debug(`Preloading resource: ${key}`);
                // 这里可以实现预加载逻辑
            }
        });
    }

    /**
     * 检查资源是否已加载
     */
    public isResourceLoaded(key: string): boolean {
        const resource = this.resources.get(key);
        return resource ? resource.loaded : false;
    }

    /**
     * 获取资源信息
     */
    public getResourceInfo(key: string): ResourceInfo | undefined {
        return this.resources.get(key);
    }

    /**
     * 获取所有资源信息
     */
    public getAllResources(): Map<string, ResourceInfo> {
        return new Map(this.resources);
    }

    /**
     * 获取缓存大小
     */
    public getCacheSize(): number {
        return this.cacheSize;
    }

    /**
     * 设置最大缓存大小
     */
    public setMaxCacheSize(size: number): void {
        this.maxCacheSize = size;
        this.cleanupCache();
        logger.info(`Max cache size set to: ${size} bytes`);
    }

    /**
     * 检查是否正在加载
     */
    public isLoadingResources(): boolean {
        return this.isLoading;
    }

    /**
     * 获取加载进度
     */
    public getLoadProgress(): LoadProgress {
        if (!this.scene) return { total: 0, loaded: 0, percentage: 0 };

        return {
            total: this.scene.load.totalToLoad,
            loaded: this.scene.load.progress,
            percentage: this.scene.load.progress * 100
        };
    }

    /**
     * 清空所有资源
     */
    public clearAllResources(): void {
        this.resources.forEach((_, key) => {
            this.unloadResource(key);
        });
        this.loadQueue = [];
        this.cacheSize = 0;
        logger.info('All resources cleared');
    }

    /**
     * 销毁资源管理器
     */
    public destroy(): void {
        this.clearAllResources();
        logger.info('ResourceManager destroyed');
    }
}

// 导出单例实例
export const resourceManager = ResourceManager.getInstance();

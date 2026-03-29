/**
 * 调试工具类
 * 提供游戏调试功能
 */

import Phaser from 'phaser';
import { logger } from './Logger';

export class DebugTools {
    private scene: Phaser.Scene;
    private debugGraphics: Phaser.GameObjects.Graphics;
    private fpsText: Phaser.GameObjects.Text;
    private debugInfo: Map<string, any>;
    private enabled: boolean;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.debugGraphics = scene.add.graphics();
        this.debugGraphics.setDepth(9999);
        this.debugInfo = new Map();
        this.enabled = false;

        this.setupDebugKeys();
        this.createFPSDisplay();
    }

    /**
     * 设置调试快捷键
     */
    private setupDebugKeys(): void {
        const f1Key = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
        f1Key.on('down', () => {
            this.toggle();
        });

        const f2Key = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F2);
        f2Key.on('down', () => {
            this.exportDebugInfo();
        });
    }

    /**
     * 创建FPS显示
     */
    private createFPSDisplay(): void {
        this.fpsText = this.scene.add.text(10, 10, '', {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.fpsText.setDepth(10000);
        this.fpsText.setVisible(false);

        // 定期更新FPS
        this.scene.time.addEvent({
            delay: 100,
            callback: this.updateFPS,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 更新FPS显示
     */
    private updateFPS(): void {
        if (!this.enabled) return;

        const fps = this.scene.game.loop.actualFps;
        const delta = this.scene.game.loop.delta;
        const objects = this.scene.children.list.length;

        let info = `FPS: ${fps.toFixed(1)}\n`;
        info += `Delta: ${delta.toFixed(2)}ms\n`;
        info += `Objects: ${objects}\n`;

        // 添加自定义调试信息
        this.debugInfo.forEach((value, key) => {
            info += `${key}: ${JSON.stringify(value)}\n`;
        });

        this.fpsText.setText(info);
    }

    /**
     * 切换调试模式
     */
    public toggle(): void {
        this.enabled = !this.enabled;
        this.fpsText.setVisible(this.enabled);
        logger.info(`Debug mode ${this.enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * 设置调试信息
     */
    public setDebugInfo(key: string, value: any): void {
        this.debugInfo.set(key, value);
    }

    /**
     * 移除调试信息
     */
    public removeDebugInfo(key: string): void {
        this.debugInfo.delete(key);
    }

    /**
     * 清空调试信息
     */
    public clearDebugInfo(): void {
        this.debugInfo.clear();
    }

    /**
     * 绘制调试矩形
     */
    public drawRect(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number = 0x00ff00,
        alpha: number = 1
    ): void {
        if (!this.enabled) return;

        this.debugGraphics.lineStyle(1, color, alpha);
        this.debugGraphics.strokeRect(x, y, width, height);
    }

    /**
     * 绘制调试圆形
     */
    public drawCircle(
        x: number,
        y: number,
        radius: number,
        color: number = 0x00ff00,
        alpha: number = 1
    ): void {
        if (!this.enabled) return;

        this.debugGraphics.lineStyle(1, color, alpha);
        this.debugGraphics.strokeCircle(x, y, radius);
    }

    /**
     * 绘制调试线条
     */
    public drawLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: number = 0x00ff00,
        alpha: number = 1
    ): void {
        if (!this.enabled) return;

        this.debugGraphics.lineStyle(1, color, alpha);
        this.debugGraphics.beginPath();
        this.debugGraphics.moveTo(x1, y1);
        this.debugGraphics.lineTo(x2, y2);
        this.debugGraphics.strokePath();
    }

    /**
     * 清除所有调试图形
     */
    public clearGraphics(): void {
        this.debugGraphics.clear();
    }

    /**
     * 导出调试信息
     */
    public exportDebugInfo(): void {
        const info: any = {
            timestamp: new Date().toISOString(),
            fps: this.scene.game.loop.actualFps,
            delta: this.scene.game.loop.delta,
            objects: this.scene.children.list.length,
            debugInfo: Object.fromEntries(this.debugInfo)
        };

        logger.info('Exporting debug info', info);

        // 下载为JSON文件
        const dataStr = JSON.stringify(info, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `debug_info_${Date.now()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    /**
     * 销毁调试工具
     */
    public destroy(): void {
        this.debugGraphics.destroy();
        this.fpsText.destroy();
        this.debugInfo.clear();
    }
}

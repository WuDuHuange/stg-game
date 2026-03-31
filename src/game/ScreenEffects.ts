/**
 * 屏幕特效系统 - 管理屏幕震动、闪光、慢动作等特效
 */

import Phaser from 'phaser';

export class ScreenEffects {
    private scene: Phaser.Scene;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private isShaking: boolean = false;
    private isFlashing: boolean = false;
    private isSlowMo: boolean = false;
    private originalTimeScale: number = 1.0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;
        this.originalTimeScale = scene.time.timeScale;
    }

    /**
     * 屏幕震动
     */
    public shake(intensity: number = 10, duration: number = 500): void {
        if (this.isShaking) return;

        this.isShaking = true;
        const originalX = this.camera.scrollX;
        const originalY = this.camera.scrollY;

        this.scene.tweens.add({
            targets: this.camera,
            x: originalX + Phaser.Math.Between(-intensity, intensity),
            y: originalY + Phaser.Math.Between(-intensity, intensity),
            duration: 50,
            repeat: Math.floor(duration / 50),
            yoyo: true,
            onComplete: () => {
                this.camera.x = originalX;
                this.camera.y = originalY;
                this.isShaking = false;
            }
        });
    }

    /**
     * 屏幕闪光
     */
    public flash(color: number = 0xffffff, duration: number = 200, alpha: number = 0.8): void {
        if (this.isFlashing) return;

        this.isFlashing = true;

        const flashRect = this.scene.add.rectangle(
            this.camera.width / 2,
            this.camera.height / 2,
            this.camera.width,
            this.camera.height,
            color,
            alpha
        ).setScrollFactor(0); // 固定在屏幕上

        this.scene.tweens.add({
            targets: flashRect,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                flashRect.destroy();
                this.isFlashing = false;
            }
        });
    }

    /**
     * 慢动作效果
     */
    public slowMotion(timeScale: number = 0.5, duration: number = 1000): void {
        if (this.isSlowMo) return;

        this.isSlowMo = true;
        this.scene.time.timeScale = timeScale;

        this.scene.time.delayedCall(duration, () => {
            this.scene.time.timeScale = this.originalTimeScale;
            this.isSlowMo = false;
        });
    }

    /**
     * 屏幕震动+闪光组合效果
     */
    public shakeAndFlash(
        shakeIntensity: number = 10,
        flashColor: number = 0xff0000,
        duration: number = 300
    ): void {
        this.shake(shakeIntensity, duration);
        this.flash(flashColor, duration);
    }

    /**
     * 屏幕缩放效果
     */
    public zoom(scale: number = 1.2, duration: number = 300, yoyo: boolean = true): void {
        this.scene.tweens.add({
            targets: this.camera,
            zoom: scale,
            duration: duration,
            ease: 'Sine.easeInOut',
            yoyo: yoyo,
            onComplete: () => {
                if (!yoyo) {
                    this.camera.zoom = 1;
                }
            }
        });
    }

    /**
     * 屏幕倾斜效果
     */
    public tilt(angle: number = 0.1, duration: number = 300, yoyo: boolean = true): void {
        this.scene.tweens.add({
            targets: this.camera,
            rotation: angle,
            duration: duration,
            ease: 'Sine.easeInOut',
            yoyo: yoyo,
            onComplete: () => {
                if (!yoyo) {
                    this.camera.rotation = 0;
                }
            }
        });
    }

    /**
     * 屏幕震动+缩放组合效果
     */
    public shakeAndZoom(
        shakeIntensity: number = 10,
        zoomScale: number = 1.1,
        duration: number = 300
    ): void {
        this.shake(shakeIntensity, duration);
        this.zoom(zoomScale, duration);
    }

    /**
     * 屏幕震动+倾斜组合效果
     */
    public shakeAndTilt(
        shakeIntensity: number = 10,
        tiltAngle: number = 0.1,
        duration: number = 300
    ): void {
        this.shake(shakeIntensity, duration);
        this.tilt(tiltAngle, duration);
    }

    /**
     * 重置所有特效
     */
    public resetAll(): void {
        // 重置时间缩放
        this.scene.time.timeScale = this.originalTimeScale;
        this.isSlowMo = false;

        // 重置相机
        this.camera.zoom = 1;
        this.camera.rotation = 0;
    }

    /**
     * 销毁特效系统
     */
    public destroy(): void {
        this.resetAll();
    }
}

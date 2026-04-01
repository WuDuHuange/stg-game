/**
 * 场景管理器
 * 负责场景切换、过场动画等场景管理功能
 */
export class SceneManager {
    private scene: Phaser.Scene;
    private overlay!: Phaser.GameObjects.Graphics;
    private currentTransition: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 初始化场景管理器
     */
    public initialize(): void {
        // 创建全屏遮罩
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 1);
        this.overlay.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        this.overlay.setAlpha(0);
        this.overlay.setDepth(10000);
    }

    /**
     * 淡入效果
     */
    public fadeIn(duration: number = 500, onComplete?: () => void): void {
        if (this.currentTransition) return;
        this.currentTransition = true;

        this.overlay.setAlpha(1);

        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 0,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.currentTransition = false;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 淡出效果
     */
    public fadeOut(duration: number = 500, onComplete?: () => void): void {
        if (this.currentTransition) return;
        this.currentTransition = true;

        this.overlay.setAlpha(0);

        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.currentTransition = false;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 淡入淡出效果
     */
    public fadeInOut(duration: number = 500, holdDuration: number = 1000, onComplete?: () => void): void {
        if (this.currentTransition) return;
        this.currentTransition = true;

        this.overlay.setAlpha(1);

        // 淡入
        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 0,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                // 保持
                this.scene.time.delayedCall(holdDuration, () => {
                    // 淡出
                    this.scene.tweens.add({
                        targets: this.overlay,
                        alpha: 1,
                        duration: duration,
                        ease: 'Linear',
                        onComplete: () => {
                            this.currentTransition = false;
                            if (onComplete) onComplete();
                        }
                    });
                });
            }
        });
    }

    /**
     * 缩放过渡效果
     */
    public zoomTransition(duration: number = 500, onComplete?: () => void): void {
        if (this.currentTransition) return;
        this.currentTransition = true;

        const camera = this.scene.cameras.main;

        // 缩放进入
        camera.setZoom(2);
        camera.setAlpha(0);

        this.scene.tweens.add({
            targets: camera,
            zoom: 1,
            alpha: 1,
            duration: duration,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.currentTransition = false;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 滑动过渡效果
     */
    public slideTransition(direction: 'left' | 'right' | 'up' | 'down', duration: number = 500, onComplete?: () => void): void {
        if (this.currentTransition) return;
        this.currentTransition = true;

        const camera = this.scene.cameras.main;
        const width = camera.width;
        const height = camera.height;

        // 设置初始位置
        switch (direction) {
            case 'left':
                camera.scrollX = -width;
                break;
            case 'right':
                camera.scrollX = width;
                break;
            case 'up':
                camera.scrollY = -height;
                break;
            case 'down':
                camera.scrollY = height;
                break;
        }

        // 滑动到目标位置
        this.scene.tweens.add({
            targets: camera,
            scrollX: 0,
            scrollY: 0,
            duration: duration,
            ease: 'Power2.easeOut',
            onComplete: () => {
                this.currentTransition = false;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 旋转过渡效果
     */
    public rotateTransition(duration: number = 500, onComplete?: () => void): void {
        if (this.currentTransition) return;
        this.currentTransition = true;

        const camera = this.scene.cameras.main;

        // 旋转进入
        camera.setRotation(Math.PI);
        camera.setAlpha(0);

        this.scene.tweens.add({
            targets: camera,
            rotation: 0,
            alpha: 1,
            duration: duration,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.currentTransition = false;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 波纹过渡效果
     */
    public rippleTransition(duration: number = 500, onComplete?: () => void): void {
        if (this.currentTransition) return;
        this.currentTransition = true;

        const camera = this.scene.cameras.main;
        const centerX = camera.width / 2;
        const centerY = camera.height / 2;

        // 创建波纹效果
        const ripple = this.scene.add.circle(centerX, centerY, 0, 0x000000, 1);
        ripple.setDepth(9999);

        this.scene.tweens.add({
            targets: ripple,
            radius: Math.max(camera.width, camera.height) * 1.5,
            duration: duration,
            ease: 'Power2.easeOut',
            onUpdate: () => {
                camera.setAlpha(ripple.scale);
            },
            onComplete: () => {
                ripple.destroy();
                camera.setAlpha(1);
                this.currentTransition = false;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 显示关卡标题
     */
    public showLevelTitle(title: string, duration: number = 2000): void {
        const titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            title,
            {
                fontSize: '48px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(10001);

        // 淡入
        titleText.setAlpha(0);
        this.scene.tweens.add({
            targets: titleText,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 保持一段时间后淡出
                this.scene.time.delayedCall(duration, () => {
                    this.scene.tweens.add({
                        targets: titleText,
                        alpha: 0,
                        scale: 1.2,
                        duration: 500,
                        ease: 'Power2.easeIn',
                        onComplete: () => {
                            titleText.destroy();
                        }
                    });
                });
            }
        });
    }

    /**
     * 显示游戏开始提示
     */
    public showGameStartPrompt(): void {
        const promptText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height * 0.8,
            '按空格键开始',
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(10001);

        // 脉动效果
        this.scene.tweens.add({
            targets: promptText,
            alpha: { from: 1, to: 0.5 },
            scale: { from: 1, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 清理场景管理器
     */
    public destroy(): void {
        if (this.overlay) {
            this.overlay.destroy();
        }
    }
}

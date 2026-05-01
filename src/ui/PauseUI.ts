/**
 * 暂停UI类
 * 负责显示暂停界面，支持继续游戏、返回主菜单等功能
 */
export class PauseUI {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private visible: boolean = false;
    private isPaused: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 初始化暂停UI
     */
    public initialize(): void {
        // 创建暂停UI容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(6000);
        this.container.setVisible(false);

        // 创建暂停界面
        this.createPauseInterface();
    }

    /**
     * 创建暂停界面
     */
    private createPauseInterface(): void {
        // 半透明背景
        const bg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.7
        );

        // 暂停面板
        const panel = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            400,
            400,
            0x0a0a15,
            0.95
        );
        panel.setStrokeStyle(2, 0x4a4a5e);

        // 标题
        const title = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 150,
            '游戏暂停',
            {
                fontSize: '48px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 创建按钮
        this.createButton(
            '继续游戏 [ESC]',
            this.scene.cameras.main.height / 2 - 50,
            () => {
                this.resume();
            }
        );

        this.createButton(
            '返回主菜单',
            this.scene.cameras.main.height / 2 + 30,
            () => {
                this.returnToMenu();
            }
        );

        this.createButton(
            '退出游戏',
            this.scene.cameras.main.height / 2 + 110,
            () => {
                this.quitGame();
            }
        );

        // 添加到容器
        this.container.add([bg, panel, title]);
    }

    /**
     * 创建按钮
     */
    private createButton(text: string, y: number, callback: () => void): void {
        // 按钮背景
        const buttonBg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            y,
            300,
            50,
            0x1a1a2e,
            1
        );
        buttonBg.setStrokeStyle(2, 0x2a2a3e);

        // 按钮文字
        const buttonText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            y,
            text,
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 交互
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerdown', callback);
        buttonBg.on('pointerover', () => {
            buttonBg.fillColor = 0x2a2a3e;
            buttonBg.setStrokeStyle(2, 0x4a4a5e);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.fillColor = 0x1a1a2e;
            buttonBg.setStrokeStyle(2, 0x2a2a3e);
        });

        this.container.add([buttonBg, buttonText]);
    }

    /**
     * 暂停游戏
     */
    public pause(): void {
        if (this.isPaused) return;
        this.isPaused = true;

        this.show();

        this.scene.scene.pause();
    }

    /**
     * 继续游戏
     */
    public resume(): void {
        if (!this.isPaused) return;
        this.isPaused = false;

        this.scene.scene.resume();

        this.hide();
    }

    /**
     * 返回主菜单
     */
    public returnToMenu(): void {
        this.isPaused = false;
        this.hide();

        // 停止当前场景
        this.scene.scene.stop();

        // 启动主菜单场景
        this.scene.scene.start('MenuScene');
    }

    /**
     * 退出游戏
     */
    public quitGame(): void {
        this.isPaused = false;
        this.hide();

        // 停止所有场景
        this.scene.scene.stop();
        this.scene.scene.stop('MenuScene');

        // 退出游戏（在Web中无法直接关闭窗口，所以返回主菜单）
        this.scene.scene.start('MenuScene');
    }

    /**
     * 显示暂停UI
     */
    private show(): void {
        if (this.visible) return;
        this.visible = true;

        this.container.setVisible(true);
        this.container.setAlpha(0);

        // 淡入效果
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 200,
            ease: 'Power2.easeOut'
        });
    }

    /**
     * 隐藏暂停UI
     */
    private hide(): void {
        if (!this.visible) return;
        this.visible = false;

        // 淡出效果
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 200,
            ease: 'Power2.easeIn',
            onComplete: () => {
                this.container.setVisible(false);
            }
        });
    }

    /**
     * 切换暂停状态
     */
    public toggle(): void {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * 检查是否暂停
     */
    public isGamePaused(): boolean {
        return this.isPaused;
    }

    /**
     * 清理暂停UI
     */
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
        }
    }
}

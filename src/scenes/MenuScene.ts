/**
 * 主菜单场景
 */

import Phaser from 'phaser';
import { SettingsUI } from '@ui/SettingsUI';

export class MenuScene extends Phaser.Scene {
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;
    private menuButtons: Phaser.GameObjects.Container[] = [];
    private selectedButtonIndex: number = 0;
    private versionText!: Phaser.GameObjects.Text;
    private settingsUI!: SettingsUI;
    private isSettingsOpen: boolean = false;
    private escKey!: Phaser.Input.Keyboard.Key;
    private upKey!: Phaser.Input.Keyboard.Key;
    private downKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private stars: Phaser.GameObjects.Arc[] = [];

    constructor() {
        super({ key: 'MenuScene' });
    }

    /**
     * 场景创建
     */
    create(): void {
        console.log('MenuScene: 场景创建');

        // 创建背景
        this.createBackground();

        // 创建标题
        this.createTitle();

        // 创建菜单按钮
        this.createMenuButtons();

        // 创建设置UI
        this.settingsUI = new SettingsUI(this);
        this.settingsUI.initialize();

        // 设置键盘输入
        this.setupKeyboardInput();

        // 默认选中第一个按钮
        this.selectButton(0);

        // 创建版本信息
        this.versionText = this.add.text(
            this.cameras.main.width - 10,
            this.cameras.main.height - 10,
            'v0.1.0',
            {
                fontSize: '12px',
                color: '#666666'
            }
        ).setOrigin(1, 1);
    }

    /**
     * 创建背景
     */
    private createBackground(): void {
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // 添加星星效果
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.8));

            // 添加闪烁动画
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });

            this.stars.push(star);
        }

        // 添加装饰线条
        const lineY = this.cameras.main.height * 0.35;
        const lineGraphics = this.add.graphics();
        lineGraphics.lineStyle(1, 0xe94560, 0.3);
        lineGraphics.beginPath();
        lineGraphics.moveTo(0, lineY);
        lineGraphics.lineTo(this.cameras.main.width, lineY);
        lineGraphics.strokePath();

        const lineY2 = this.cameras.main.height * 0.75;
        const lineGraphics2 = this.add.graphics();
        lineGraphics2.lineStyle(1, 0x0f3460, 0.3);
        lineGraphics2.beginPath();
        lineGraphics2.moveTo(0, lineY2);
        lineGraphics2.lineTo(this.cameras.main.width, lineY2);
        lineGraphics2.strokePath();
    }

    /**
     * 创建标题
     */
    private createTitle(): void {
        this.titleText = this.add.text(
            this.cameras.main.width / 2,
            120,
            'STG 机娘游戏',
            {
                fontSize: '56px',
                color: '#e94560',
                fontStyle: 'bold',
                stroke: '#0f3460',
                strokeThickness: 6,
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // 添加标题呼吸动画
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 1, to: 1.03 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 副标题
        this.subtitleText = this.add.text(
            this.cameras.main.width / 2,
            185,
            '弹幕射击 · 机娘武装 · 深度装备',
            {
                fontSize: '18px',
                color: '#aaaaaa',
                fontStyle: 'italic'
            }
        ).setOrigin(0.5);

        // 副标题淡入
        this.subtitleText.setAlpha(0);
        this.tweens.add({
            targets: this.subtitleText,
            alpha: 1,
            duration: 1000,
            delay: 500
        });
    }

    /**
     * 创建菜单按钮
     */
    private createMenuButtons(): void {
        const buttonStyle = {
            fontSize: '26px',
            color: '#ffffff',
            fontStyle: 'bold'
        };

        const buttonWidth = 280;
        const buttonHeight = 55;
        const centerX = this.cameras.main.width / 2;
        const startY = 320;
        const spacing = 75;

        // 开始游戏按钮
        this.menuButtons.push(this.createButton(
            centerX,
            startY,
            buttonWidth,
            buttonHeight,
            '开始游戏',
            buttonStyle,
            () => this.startGame()
        ));

        // 设置按钮
        this.menuButtons.push(this.createButton(
            centerX,
            startY + spacing,
            buttonWidth,
            buttonHeight,
            '设置',
            buttonStyle,
            () => this.openSettings()
        ));

        // 退出按钮
        this.menuButtons.push(this.createButton(
            centerX,
            startY + spacing * 2,
            buttonWidth,
            buttonHeight,
            '退出游戏',
            buttonStyle,
            () => this.exitGame()
        ));
    }

    /**
     * 创建按钮
     */
    private createButton(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        style: any,
        callback: () => void
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // 创建按钮背景
        const background = this.add.rectangle(0, 0, width, height, 0x0f3460, 0.8);
        background.setStrokeStyle(2, 0xe94560);

        // 创建选中指示器（左侧箭头）
        const selector = this.add.text(-width / 2 - 30, 0, '▶', {
            fontSize: '20px',
            color: '#e94560',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        selector.setVisible(false);

        // 创建按钮文本
        const buttonText = this.add.text(0, 0, text, style).setOrigin(0.5);

        container.add([background, selector, buttonText]);

        // 存储引用
        container.setData('background', background);
        container.setData('selector', selector);
        container.setData('buttonText', buttonText);
        container.setData('callback', callback);
        container.setData('defaultColor', 0x0f3460);
        container.setData('selectedColor', 0x1a1a4e);

        // 添加按钮交互
        background.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                const index = this.menuButtons.indexOf(container);
                this.selectButton(index);
            })
            .on('pointerout', () => {
                // 不取消选中，保持当前选中状态
            })
            .on('pointerdown', () => {
                callback();
            });

        return container;
    }

    /**
     * 选中按钮
     */
    private selectButton(index: number): void {
        if (index < 0 || index >= this.menuButtons.length) return;

        // 取消所有按钮的选中状态
        this.menuButtons.forEach((btn, i) => {
            const background = btn.getData('background') as Phaser.GameObjects.Rectangle;
            const selector = btn.getData('selector') as Phaser.GameObjects.Text;
            const buttonText = btn.getData('buttonText') as Phaser.GameObjects.Text;

            if (i === index) {
                background.setFillStyle(0x1a1a4e, 0.9);
                background.setStrokeStyle(3, 0xe94560);
                selector.setVisible(true);
                buttonText.setColor('#e94560');
            } else {
                background.setFillStyle(0x0f3460, 0.8);
                background.setStrokeStyle(2, 0xe94560);
                selector.setVisible(false);
                buttonText.setColor('#ffffff');
            }
        });

        this.selectedButtonIndex = index;
    }

    /**
     * 设置键盘输入
     */
    private setupKeyboardInput(): void {
        this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // WASD 也支持导航
        const wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        const sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        // 上键/W键 - 选择上一个按钮
        this.upKey.on('down', () => this.navigateUp());
        wKey.on('down', () => {
            if (!this.isSettingsOpen) this.navigateUp();
        });

        // 下键/S键 - 选择下一个按钮
        this.downKey.on('down', () => this.navigateDown());
        sKey.on('down', () => {
            if (!this.isSettingsOpen) this.navigateDown();
        });

        // 回车键 - 确认选择
        this.enterKey.on('down', () => {
            if (!this.isSettingsOpen) this.confirmSelection();
        });

        // ESC键 - 关闭设置或无操作（主菜单是顶层）
        this.escKey.on('down', () => {
            if (this.isSettingsOpen) {
                this.closeSettings();
            }
            // 在主菜单顶层，ESC不做任何操作
        });
    }

    /**
     * 向上导航
     */
    private navigateUp(): void {
        if (this.isSettingsOpen) return;
        const newIndex = (this.selectedButtonIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
        this.selectButton(newIndex);
    }

    /**
     * 向下导航
     */
    private navigateDown(): void {
        if (this.isSettingsOpen) return;
        const newIndex = (this.selectedButtonIndex + 1) % this.menuButtons.length;
        this.selectButton(newIndex);
    }

    /**
     * 确认选择
     */
    private confirmSelection(): void {
        if (this.isSettingsOpen) return;
        const btn = this.menuButtons[this.selectedButtonIndex];
        const callback = btn.getData('callback') as () => void;
        if (callback) callback();
    }

    /**
     * 开始游戏
     */
    private startGame(): void {
        console.log('开始游戏');

        // 淡出效果后切换场景
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    /**
     * 打开设置
     */
    private openSettings(): void {
        if (this.isSettingsOpen) return;
        console.log('打开设置');
        this.isSettingsOpen = true;
        this.settingsUI.show();
    }

    /**
     * 关闭设置
     */
    private closeSettings(): void {
        if (!this.isSettingsOpen) return;
        console.log('关闭设置');
        this.isSettingsOpen = false;
        this.settingsUI.hide();
    }

    /**
     * 退出游戏
     */
    private exitGame(): void {
        console.log('退出游戏');
        // 在浏览器中无法真正退出，显示提示
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        const message = this.add.text(width / 2, height / 2, '感谢游玩！请关闭浏览器标签页退出', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // 3秒后自动隐藏
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [overlay, message],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    message.destroy();
                }
            });
        });
    }

    /**
     * 场景销毁
     */
    destroy(): void {
        console.log('MenuScene: 场景销毁');

        // 清理设置UI
        if (this.settingsUI) {
            this.settingsUI.destroy();
        }

        // 停止所有动画
        this.tweens.killAll();

        super.destroy();
    }
}

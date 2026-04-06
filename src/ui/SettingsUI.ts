/**
 * 设置UI类
 * 负责显示设置界面，支持图形、音频、控制等设置
 */
export class SettingsUI {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private visible: boolean = false;
    private currentTab: string = 'graphics'; // graphics, audio, controls

    // 设置值
    private settings: {
        graphics: {
            quality: number; // 0: low, 1: medium, 2: high
            fullscreen: boolean;
            vsync: boolean;
        };
        audio: {
            masterVolume: number;
            musicVolume: number;
            sfxVolume: number;
        };
        controls: {
            moveUp: string;
            moveDown: string;
            moveLeft: string;
            moveRight: string;
            shoot: string;
        };
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.settings = {
            graphics: {
                quality: 2,
                fullscreen: false,
                vsync: true
            },
            audio: {
                masterVolume: 80,
                musicVolume: 70,
                sfxVolume: 90
            },
            controls: {
                moveUp: 'W',
                moveDown: 'S',
                moveLeft: 'A',
                moveRight: 'D',
                shoot: 'SPACE'
            }
        };
    }

    /**
     * 初始化设置UI
     */
    public initialize(): void {
        // 创建设置UI容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(5000);
        this.container.setVisible(false);

        // 创建设置界面
        this.createSettingsInterface();
    }

    /**
     * 创建设置界面
     */
    private createSettingsInterface(): void {
        // 背景
        const bg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            500,
            400,
            0x0a0a15,
            0.95
        );
        bg.setStrokeStyle(2, 0x4a4a5e);

        // 标题
        const title = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 170,
            '设置',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 标签页
        this.createTabs();

        // 内容区域
        this.createContent();

        // 关闭按钮
        const closeButton = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 180,
            '关闭 [ESC]',
            {
                fontSize: '20px',
                color: '#e94560',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on('pointerdown', () => {
            this.hide();
        });

        // 添加到容器
        this.container.add([bg, title, closeButton]);
    }

    /**
     * 创建标签页
     */
    private createTabs(): void {
        const tabs = [
            { key: 'graphics', label: '图形', x: -150 },
            { key: 'audio', label: '音频', x: 0 },
            { key: 'controls', label: '控制', x: 150 }
        ];

        tabs.forEach(tab => {
            const tabBg = this.scene.add.rectangle(
                this.scene.cameras.main.width / 2 + tab.x,
                this.scene.cameras.main.height / 2 - 120,
                120,
                40,
                0x1a1a2e,
                1
            );
            tabBg.setStrokeStyle(2, 0x2a2a3e);

            const tabText = this.scene.add.text(
                this.scene.cameras.main.width / 2 + tab.x,
                this.scene.cameras.main.height / 2 - 120,
                tab.label,
                {
                    fontSize: '18px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

            tabText.setInteractive({ useHandCursor: true });
            tabText.on('pointerdown', () => {
                this.switchTab(tab.key);
            });

            this.container.add([tabBg, tabText]);
        });
    }

    /**
     * 创建内容区域
     */
    private createContent(): void {
        // 创建图形设置内容
        this.createGraphicsContent();

        // 创建音频设置内容
        this.createAudioContent();

        // 创建控制设置内容
        this.createControlsContent();

        // 默认显示图形设置
        this.showTabContent('graphics');
    }

    /**
     * 创建图形设置内容
     */
    private createGraphicsContent(): void {
        const content = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
        content.setName('graphics-content');
        content.setVisible(false);

        // 画质设置
        this.createSettingOption(content, -50, '画质', ['低', '中', '高'], this.settings.graphics.quality, (value) => {
            this.settings.graphics.quality = value;
        });

        // 全屏设置
        this.createToggleOption(content, 20, '全屏', this.settings.graphics.fullscreen, (value) => {
            this.settings.graphics.fullscreen = value;
            this.scene.scale.toggleFullscreen();
        });

        // 垂直同步
        this.createToggleOption(content, 90, '垂直同步', this.settings.graphics.vsync, (value) => {
            this.settings.graphics.vsync = value;
        });

        this.container.add(content);
    }

    /**
     * 创建音频设置内容
     */
    private createAudioContent(): void {
        const content = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
        content.setName('audio-content');
        content.setVisible(false);

        // 主音量
        this.createSliderOption(content, -50, '主音量', this.settings.audio.masterVolume, (value) => {
            this.settings.audio.masterVolume = value;
        });

        // 音乐音量
        this.createSliderOption(content, 20, '音乐音量', this.settings.audio.musicVolume, (value) => {
            this.settings.audio.musicVolume = value;
        });

        // 音效音量
        this.createSliderOption(content, 90, '音效音量', this.settings.audio.sfxVolume, (value) => {
            this.settings.audio.sfxVolume = value;
        });

        this.container.add(content);
    }

    /**
     * 创建控制设置内容
     */
    private createControlsContent(): void {
        const content = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
        content.setName('controls-content');
        content.setVisible(false);

        // 移动设置
        this.createKeyOption(content, -80, '向上移动', this.settings.controls.moveUp);
        this.createKeyOption(content, -30, '向下移动', this.settings.controls.moveDown);
        this.createKeyOption(content, 20, '向左移动', this.settings.controls.moveLeft);
        this.createKeyOption(content, 70, '向右移动', this.settings.controls.moveRight);
        this.createKeyOption(content, 120, '射击', this.settings.controls.shoot);

        this.container.add(content);
    }

    /**
     * 创建设置选项（下拉式）
     */
    private createSettingOption(container: Phaser.GameObjects.Container, y: number, label: string, options: string[], currentValue: number, callback: (value: number) => void): void {
        // 标签
        const labelText = this.scene.add.text(-180, y, label, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 选项背景
        const optionBg = this.scene.add.rectangle(100, y, 100, 30, 0x1a1a2e, 1);
        optionBg.setStrokeStyle(1, 0x2a2a3e);

        // 选项文字
        const optionText = this.scene.add.text(100, y, options[currentValue], {
            fontSize: '14px',
            color: '#ffd700'
        }).setOrigin(0.5);

        // 左右箭头
        const leftArrow = this.scene.add.text(40, y, '◀', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const rightArrow = this.scene.add.text(160, y, '▶', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 交互
        leftArrow.setInteractive({ useHandCursor: true });
        leftArrow.on('pointerdown', () => {
            currentValue = (currentValue - 1 + options.length) % options.length;
            optionText.setText(options[currentValue]);
            callback(currentValue);
        });

        rightArrow.setInteractive({ useHandCursor: true });
        rightArrow.on('pointerdown', () => {
            currentValue = (currentValue + 1) % options.length;
            optionText.setText(options[currentValue]);
            callback(currentValue);
        });

        container.add([labelText, optionBg, optionText, leftArrow, rightArrow]);
    }

    /**
     * 创建开关选项
     */
    private createToggleOption(container: Phaser.GameObjects.Container, y: number, label: string, currentValue: boolean, callback: (value: boolean) => void): void {
        // 标签
        const labelText = this.scene.add.text(-180, y, label, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 开关背景
        const toggleBg = this.scene.add.rectangle(100, y, 60, 30, 0x1a1a2e, 1);
        toggleBg.setStrokeStyle(1, 0x2a2a3e);

        // 开关指示器
        const toggleIndicator = this.scene.add.rectangle(currentValue ? 120 : 80, y, 20, 20, currentValue ? 0x00ff00 : 0xff0000, 1);

        // 开关文字
        const toggleText = this.scene.add.text(100, y, currentValue ? '开' : '关', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 交互
        toggleBg.setInteractive({ useHandCursor: true });
        toggleBg.on('pointerdown', () => {
            currentValue = !currentValue;
            toggleIndicator.x = currentValue ? 120 : 80;
            toggleIndicator.fillColor = currentValue ? 0x00ff00 : 0xff0000;
            toggleText.setText(currentValue ? '开' : '关');
            callback(currentValue);
        });

        container.add([labelText, toggleBg, toggleIndicator, toggleText]);
    }

    /**
     * 创建滑块选项
     */
    private createSliderOption(container: Phaser.GameObjects.Container, y: number, label: string, currentValue: number, callback: (value: number) => void): void {
        // 标签
        const labelText = this.scene.add.text(-180, y, label, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 滑块背景
        const sliderBg = this.scene.add.rectangle(100, y, 200, 10, 0x1a1a2e, 1);

        // 滑块填充
        const sliderFill = this.scene.add.rectangle(10, y, (currentValue / 100) * 200, 8, 0x00ffff, 1);

        // 滑块手柄
        const sliderHandle = this.scene.add.circle(10 + (currentValue / 100) * 200, y, 8, 0xffffff, 1);

        // 数值显示
        const valueText = this.scene.add.text(210, y, `${currentValue}%`, {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 交互
        sliderHandle.setInteractive({ useHandCursor: true, draggable: true });
        sliderHandle.on('drag', (pointer: any, dragX: number, dragY: number) => {
            const minX = 10;
            const maxX = 210;
            const clampedX = Math.max(minX, Math.min(maxX, dragX));

            sliderHandle.x = clampedX;
            sliderFill.width = clampedX - 10;

            const newValue = Math.round(((clampedX - 10) / 200) * 100);
            valueText.setText(`${newValue}%`);

            callback(newValue);
        });

        container.add([labelText, sliderBg, sliderFill, sliderHandle, valueText]);
    }

    /**
     * 创建按键选项
     */
    private createKeyOption(container: Phaser.GameObjects.Container, y: number, label: string, currentValue: string): void {
        // 标签
        const labelText = this.scene.add.text(-180, y, label, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // 按键背景
        const keyBg = this.scene.add.rectangle(100, y, 100, 30, 0x1a1a2e, 1);
        keyBg.setStrokeStyle(1, 0x2a2a3e);

        // 按键文字
        const keyText = this.scene.add.text(100, y, currentValue, {
            fontSize: '14px',
            color: '#ffd700'
        }).setOrigin(0.5);

        // 交互
        keyBg.setInteractive({ useHandCursor: true });
        keyBg.on('pointerdown', () => {
            keyText.setText('按下键...');
            // 这里可以添加按键绑定逻辑
            this.scene.time.delayedCall(2000, () => {
                keyText.setText(currentValue);
            });
        });

        container.add([labelText, keyBg, keyText]);
    }

    /**
     * 切换标签页
     */
    private switchTab(tabKey: string): void {
        this.currentTab = tabKey;
        this.showTabContent(tabKey);
    }

    /**
     * 显示标签页内容
     */
    private showTabContent(tabKey: string): void {
        // 隐藏所有内容
        this.container.list.forEach((child: any) => {
            if (child.name && child.name.includes('-content')) {
                child.setVisible(false);
            }
        });

        // 显示当前内容
        const content = this.container.getByName(`${tabKey}-content`);
        if (content) {
            content.setVisible(true);
        }
    }

    /**
     * 显示设置UI
     */
    public show(): void {
        if (this.visible) return;
        this.visible = true;

        this.container.setVisible(true);
        this.container.setAlpha(0);

        // 淡入效果
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2.easeOut'
        });
    }

    /**
     * 隐藏设置UI
     */
    public hide(): void {
        if (!this.visible) return;
        this.visible = false;

        // 淡出效果
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 300,
            ease: 'Power2.easeIn',
            onComplete: () => {
                this.container.setVisible(false);
            }
        });
    }

    /**
     * 切换设置UI显示状态
     */
    public toggle(): void {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 获取设置
     */
    public getSettings() {
        return this.settings;
    }

    /**
     * 清理设置UI
     */
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
        }
    }
}

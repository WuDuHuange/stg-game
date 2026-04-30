/**
 * 技能UI类
 * 负责显示技能界面、技能列表、技能类型标识、技能等级和强化进度
 */
export class SkillUI {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private visible: boolean = false;
    private skillSlots: Map<number, Phaser.GameObjects.Container> = new Map();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 初始化技能UI
     */
    public initialize(): void {
        // 创建技能UI容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(5000);
        this.container.setVisible(false);

        // 创建背景
        const bg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            400,
            500,
            0x0a0a15,
            0.95
        );
        bg.setStrokeStyle(2, 0x4a4a5e);

        // 标题
        const title = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 220,
            '技能列表',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 关闭按钮
        const closeButton = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 230,
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

        // 创建技能槽位（3个技能槽）
        this.createSkillSlots();
    }

    /**
     * 创建技能槽位
     */
    private createSkillSlots(): void {
        const startY = this.scene.cameras.main.height / 2 - 150;
        const gap = 120;

        for (let i = 0; i < 3; i++) {
            const slot = this.createSkillSlot(i, startY + i * gap);
            this.skillSlots.set(i, slot);
            this.container.add(slot);
        }

        // 添加技能示例数据
        this.updateSkillData();
    }

    /**
     * 创建单个技能槽位
     */
    private createSkillSlot(index: number, y: number): Phaser.GameObjects.Container {
        const slot = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            y
        );

        // 技能槽背景
        const slotBg = this.scene.add.rectangle(
            0,
            0,
            350,
            100,
            0x1a1a2e,
            0.8
        );
        slotBg.setStrokeStyle(2, 0x2a2a3e);

        // 技能图标（占位）
        const iconBg = this.scene.add.circle(
            -140,
            0,
            30,
            0x4a4a5e,
            1
        );

        const iconText = this.scene.add.text(
            -140,
            0,
            ['Q', 'W', 'E'][index],
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 技能名称
        const skillName = this.scene.add.text(
            -90,
            -25,
            ['能量冲击', '护盾屏障', '终极毁灭'][index],
            {
                fontSize: '20px',
                color: '#ffd700',
                fontStyle: 'bold'
            }
        ).setOrigin(0, 0.5);

        // 技能类型
        const skillType = this.scene.add.text(
            -90,
            5,
            ['主动技能', '主动技能', '终极技能'][index],
            {
                fontSize: '14px',
                color: '#88ff88'
            }
        ).setOrigin(0, 0.5);

        // 技能等级
        const skillLevel = this.scene.add.text(
            -90,
            30,
            ['等级: 3/5', '等级: 2/5', '等级: 1/5'][index],
            {
                fontSize: '14px',
                color: '#aaaaaa'
            }
        ).setOrigin(0, 0.5);

        // 强化进度条背景
        const progressBg = this.scene.add.rectangle(
            100,
            0,
            120,
            10,
            0x2a2a3e,
            1
        );

        // 强化进度条
        const progressFill = this.scene.add.rectangle(
            100,
            0,
            [72, 48, 24][index],  // 3/5, 2/5, 1/5
            8,
            0x00ffff,
            1
        );

        // 强化进度文字
        const progressText = this.scene.add.text(
            100,
            20,
            ['60%', '40%', '20%'][index],
            {
                fontSize: '12px',
                color: '#00ffff'
            }
        ).setOrigin(0.5);

        slot.add([
            slotBg,
            iconBg,
            iconText,
            skillName,
            skillType,
            skillLevel,
            progressBg,
            progressFill,
            progressText
        ]);

        return slot;
    }

    /**
     * 更新技能数据（示例）
     */
    private updateSkillData(): void {
        // 技能数据已在initialize中通过createSkillSlot设置
        // 此方法可在后续从SkillManager刷新数据时使用
    }

    /**
     * 显示技能UI
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
     * 隐藏技能UI
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
     * 切换技能UI显示状态
     */
    public toggle(): void {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 更新技能信息
     */
    public updateSkill(index: number, data: {
        name: string;
        type: string;
        level: number;
        maxLevel: number;
        progress: number;
    }): void {
        const slot = this.skillSlots.get(index);
        if (!slot) return;

        const nameText = slot.getData('nameText') as Phaser.GameObjects.Text;
        const levelText = slot.getData('levelText') as Phaser.GameObjects.Text;

        if (nameText && nameText.active) {
            nameText.setText(data.name);
        }
        if (levelText && levelText.active) {
            levelText.setText(`Lv.${data.level}/${data.maxLevel}`);
        }
    }

    /**
     * 清理技能UI
     */
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
        }
        this.skillSlots.clear();
    }
}

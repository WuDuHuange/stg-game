/**
 * HUD UI类
 * 负责显示游戏内HUD界面，包括血条、护盾、技能冷却、分数、等级经验值等
 */
export class HUDUI {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;

    // 血条
    private healthBarBg!: Phaser.GameObjects.Rectangle;
    private healthBar!: Phaser.GameObjects.Rectangle;
    private healthText!: Phaser.GameObjects.Text;

    // 护盾条
    private shieldBarBg!: Phaser.GameObjects.Rectangle;
    private shieldBar!: Phaser.GameObjects.Rectangle;
    private shieldText!: Phaser.GameObjects.Text;

    // 技能冷却
    private skillSlots: {
        container: Phaser.GameObjects.Container;
        iconBg: Phaser.GameObjects.Arc;
        iconText: Phaser.GameObjects.Text;
        cooldownOverlay: Phaser.GameObjects.Arc;
        cooldownText: Phaser.GameObjects.Text;
    }[] = [];

    // 分数
    private scoreText!: Phaser.GameObjects.Text;

    // 等级和经验值
    private levelText!: Phaser.GameObjects.Text;
    private expBarBg!: Phaser.GameObjects.Rectangle;
    private expBar!: Phaser.GameObjects.Rectangle;
    private expText!: Phaser.GameObjects.Text;

    // 连击
    private comboText!: Phaser.GameObjects.Text;

    // 关卡信息
    private levelInfoText!: Phaser.GameObjects.Text;

    // 协同效果显示
    private synergyContainer!: Phaser.GameObjects.Container;
    private synergyTexts: Phaser.GameObjects.Text[] = [];

    // 关卡流程进度（节点+连线风格）
    private levelProgressContainer!: Phaser.GameObjects.Container;
    private levelNodes: {
        node: Phaser.GameObjects.Arc;
        glow: Phaser.GameObjects.Arc;
        label: Phaser.GameObjects.Text;
        bossMark?: Phaser.GameObjects.Text;
    }[] = [];
    private levelLines: Phaser.GameObjects.Rectangle[] = [];
    private currentLevelIndex: number = 0;
    private totalLevels: number = 5;

    // 底部提示
    private controlsHint!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 初始化HUD
     */
    public initialize(): void {
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(100);

        this.createHealthBar();
        this.createShieldBar();
        this.createSkillSlots();
        this.createScoreDisplay();
        this.createLevelDisplay();
        this.createComboDisplay();
        this.createSynergyDisplay();
        this.createLevelProgress();
        this.createLevelInfo();
        this.createControlsHint();
    }

    /**
     * 创建血条
     */
    private createHealthBar(): void {
        const x = 10;
        const y = 15;
        const width = 200;
        const height = 18;

        // 标签
        const label = this.scene.add.text(x, y - 12, 'HP', {
            fontSize: '10px',
            color: '#e94560',
            fontStyle: 'bold'
        });

        // 背景
        this.healthBarBg = this.scene.add.rectangle(x + width / 2, y, width, height, 0x1a1a2e, 0.9);
        this.healthBarBg.setStrokeStyle(1, 0x333355);
        this.healthBarBg.setOrigin(0.5, 0.5);

        // 血条
        this.healthBar = this.scene.add.rectangle(x, y, width, height, 0xe94560, 1);
        this.healthBar.setOrigin(0, 0.5);

        // 文本
        this.healthText = this.scene.add.text(x + width / 2, y, '100/100', {
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add([label, this.healthBarBg, this.healthBar, this.healthText]);
    }

    /**
     * 创建护盾条
     */
    private createShieldBar(): void {
        const x = 10;
        const y = 38;
        const width = 200;
        const height = 14;

        // 标签
        const label = this.scene.add.text(x, y - 10, 'SH', {
            fontSize: '10px',
            color: '#00aaff',
            fontStyle: 'bold'
        });

        // 背景
        this.shieldBarBg = this.scene.add.rectangle(x + width / 2, y, width, height, 0x1a1a2e, 0.9);
        this.shieldBarBg.setStrokeStyle(1, 0x333355);
        this.shieldBarBg.setOrigin(0.5, 0.5);

        // 护盾条
        this.shieldBar = this.scene.add.rectangle(x, y, width, height, 0x00aaff, 1);
        this.shieldBar.setOrigin(0, 0.5);

        // 文本
        this.shieldText = this.scene.add.text(x + width / 2, y, '50/50', {
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add([label, this.shieldBarBg, this.shieldBar, this.shieldText]);
    }

    /**
     * 创建技能槽位
     */
    private createSkillSlots(): void {
        const startX = this.scene.cameras.main.width / 2 - 100;
        const y = this.scene.cameras.main.height - 50;
        const slotSize = 40;
        const gap = 55;

        const skillKeys = ['Q', 'R', 'F'];
        const skillNames = ['激光射击', '护盾激活', '激光弹幕'];
        const skillColors = [0x00ff88, 0x00aaff, 0xff6600];

        for (let i = 0; i < 3; i++) {
            const slotContainer = this.scene.add.container(startX + i * gap, y);

            // 背景圆
            const iconBg = this.scene.add.circle(0, 0, slotSize / 2, 0x1a1a2e, 0.9);
            iconBg.setStrokeStyle(2, skillColors[i]);

            // 快捷键文字
            const iconText = this.scene.add.text(0, 0, skillKeys[i], {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // 冷却遮罩（半圆覆盖）
            const cooldownOverlay = this.scene.add.circle(0, 0, slotSize / 2 - 2, 0x000000, 0.6);
            cooldownOverlay.setVisible(false);

            // 冷却时间文字
            const cooldownText = this.scene.add.text(0, 0, '', {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // 技能名称（底部）
            const nameText = this.scene.add.text(0, slotSize / 2 + 10, skillNames[i], {
                fontSize: '9px',
                color: '#888888'
            }).setOrigin(0.5);

            slotContainer.add([iconBg, iconText, cooldownOverlay, cooldownText, nameText]);

            this.skillSlots.push({
                container: slotContainer,
                iconBg,
                iconText,
                cooldownOverlay,
                cooldownText
            });

            this.container.add(slotContainer);
        }
    }

    /**
     * 创建分数显示
     */
    private createScoreDisplay(): void {
        this.scoreText = this.scene.add.text(
            this.scene.cameras.main.width - 15,
            15,
            '分数: 0',
            {
                fontSize: '20px',
                color: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(1, 0);

        this.container.add(this.scoreText);
    }

    /**
     * 创建等级和经验值显示
     */
    private createLevelDisplay(): void {
        const x = this.scene.cameras.main.width - 15;
        const y = 45;

        // 等级文字
        this.levelText = this.scene.add.text(x, y, 'Lv.1', {
            fontSize: '14px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        // 经验值条
        const expBarWidth = 120;
        const expBarHeight = 8;
        const expX = x - expBarWidth;

        this.expBarBg = this.scene.add.rectangle(expX + expBarWidth / 2, y + 22, expBarWidth, expBarHeight, 0x1a1a2e, 0.9);
        this.expBarBg.setStrokeStyle(1, 0x333355);
        this.expBarBg.setOrigin(0.5, 0.5);

        this.expBar = this.scene.add.rectangle(expX, y + 22, expBarWidth, expBarHeight - 2, 0x00ff88, 1);
        this.expBar.setOrigin(0, 0.5);

        this.expText = this.scene.add.text(x, y + 22, '0/100', {
            fontSize: '9px',
            color: '#aaaaaa'
        }).setOrigin(1, 0.5);

        this.container.add([this.levelText, this.expBarBg, this.expBar, this.expText]);
    }

    /**
     * 创建连击显示
     */
    private createComboDisplay(): void {
        this.comboText = this.scene.add.text(
            10,
            this.scene.cameras.main.height - 80,
            '',
            {
                fontSize: '20px',
                color: '#ffff00',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }
        );

        this.container.add(this.comboText);
    }

    /**
     * 创建协同效果显示
     */
    private createSynergyDisplay(): void {
        this.synergyContainer = this.scene.add.container(0, 0);
        const x = this.scene.cameras.main.width - 15;
        const y = 75;

        // 标签
        const label = this.scene.add.text(x, y, '协同', {
            fontSize: '10px',
            color: '#aa88ff',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
        this.synergyContainer.add(label);

        this.container.add(this.synergyContainer);
    }

    /**
     * 更新协同效果显示
     */
    public updateSynergies(synergyNames: string[]): void {
        // 清除旧的
        this.synergyTexts.forEach(t => t.destroy());
        this.synergyTexts = [];

        const x = this.scene.cameras.main.width - 15;
        const startY = 90;

        for (let i = 0; i < synergyNames.length; i++) {
            const text = this.scene.add.text(x, startY + i * 16, `◆ ${synergyNames[i]}`, {
                fontSize: '10px',
                color: '#cc99ff',
                fontStyle: 'bold'
            }).setOrigin(1, 0);
            this.synergyContainer.add(text);
            this.synergyTexts.push(text);
        }
    }

    /**
     * 创建关卡流程进度显示（节点+连线路线图风格）
     */
    private createLevelProgress(): void {
        this.levelProgressContainer = this.scene.add.container(0, 0);

        const levelNames = ['I', 'II', 'III', 'IV', 'V'];
        const isBoss = [false, false, true, false, true];
        const startX = 10;
        const y = this.scene.cameras.main.height - 55;
        const nodeSpacing = 52;
        const nodeRadius = 8;

        for (let i = 0; i < this.totalLevels; i++) {
            const x = startX + i * nodeSpacing + nodeRadius;

            // 连线（节点之间的线段）
            if (i > 0) {
                const lineX = startX + (i - 1) * nodeSpacing + nodeRadius * 2 + 2;
                const lineWidth = nodeSpacing - nodeRadius * 2 - 4;
                const line = this.scene.add.rectangle(
                    lineX + lineWidth / 2,
                    y,
                    Math.max(1, lineWidth),
                    2,
                    0x333355,
                    0.6
                );
                this.levelLines.push(line);
                this.levelProgressContainer.add(line);
            }

            // 节点光晕（当前关卡脉动）
            const glow = this.scene.add.circle(x, y, nodeRadius + 6, 0xe94560, 0);
            glow.setVisible(false);

            // 节点圆
            const node = this.scene.add.circle(x, y, nodeRadius, 0x333355, 0.8);
            node.setStrokeStyle(2, 0x4a4a5e);

            // 关卡编号标签
            const label = this.scene.add.text(x, y + nodeRadius + 10, levelNames[i], {
                fontSize: '9px',
                color: '#555555',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Boss标记
            let bossMark: Phaser.GameObjects.Text | undefined;
            if (isBoss[i]) {
                bossMark = this.scene.add.text(x, y - nodeRadius - 8, '★', {
                    fontSize: '10px',
                    color: '#555555'
                }).setOrigin(0.5);
                this.levelProgressContainer.add(bossMark);
            }

            this.levelNodes.push({ node, glow, label, bossMark });
            this.levelProgressContainer.add([glow, node, label]);
        }

        // 默认设置第1关为当前
        this.setLevelProgress(0);

        this.container.add(this.levelProgressContainer);
    }

    /**
     * 设置关卡流程进度
     * @param currentIndex 当前关卡索引（0-based）
     * @param total 总关卡数（可选，默认5）
     */
    public setLevelProgress(currentIndex: number, total?: number): void {
        this.currentLevelIndex = currentIndex;
        if (total !== undefined) {
            this.totalLevels = total;
        }

        for (let i = 0; i < this.levelNodes.length; i++) {
            const entry = this.levelNodes[i];
            if (i < currentIndex) {
                // 已完成关卡 - 亮绿色
                entry.node.setFillStyle(0x00ff88, 0.9);
                entry.node.setStrokeStyle(2, 0x00ff88);
                entry.glow.setVisible(false);
                entry.label.setColor('#00ff88');
                if (entry.bossMark) entry.bossMark.setColor('#00ff88');
            } else if (i === currentIndex) {
                // 当前关卡 - 红色脉动
                entry.node.setFillStyle(0xe94560, 0.9);
                entry.node.setStrokeStyle(2, 0xe94560);
                entry.glow.setVisible(true);
                entry.glow.setAlpha(0.3);
                entry.label.setColor('#e94560');
                if (entry.bossMark) entry.bossMark.setColor('#e94560');

                // 脉动动画
                this.scene.tweens.killTweensOf(entry.glow);
                this.scene.tweens.add({
                    targets: entry.glow,
                    alpha: { from: 0.3, to: 0.05 },
                    scale: { from: 1, to: 1.5 },
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                // 未到达关卡 - 暗淡
                entry.node.setFillStyle(0x333355, 0.8);
                entry.node.setStrokeStyle(2, 0x4a4a5e);
                entry.glow.setVisible(false);
                entry.label.setColor('#555555');
                if (entry.bossMark) entry.bossMark.setColor('#555555');
            }
        }

        // 更新连线颜色
        for (let i = 0; i < this.levelLines.length; i++) {
            if (i < currentIndex) {
                // 已通过的连线 - 亮绿色
                this.levelLines[i].fillColor = 0x00ff88;
                this.levelLines[i].setAlpha(0.7);
            } else if (i === currentIndex) {
                // 当前段连线 - 半亮
                this.levelLines[i].fillColor = 0xe94560;
                this.levelLines[i].setAlpha(0.4);
            } else {
                // 未到达连线 - 暗淡
                this.levelLines[i].fillColor = 0x333355;
                this.levelLines[i].setAlpha(0.6);
            }
        }
    }

    /**
     * 创建关卡信息
     */
    private createLevelInfo(): void {
        this.levelInfoText = this.scene.add.text(
            10,
            this.scene.cameras.main.height - 20,
            '第 1 关 - 初次接触',
            {
                fontSize: '11px',
                color: '#888888'
            }
        );

        this.container.add(this.levelInfoText);
    }

    /**
     * 创建操作提示
     */
    private createControlsHint(): void {
        this.controlsHint = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 15,
            'ESC 暂停 | E 装备 | K 技能 | O 设置 | Q/R/F 释放技能',
            {
                fontSize: '11px',
                color: '#444444',
                fontStyle: 'italic'
            }
        ).setOrigin(0.5);

        this.container.add(this.controlsHint);

        // 5秒后淡出
        this.scene.time.delayedCall(5000, () => {
            if (this.controlsHint && this.controlsHint.active) {
                this.scene.tweens.add({
                    targets: this.controlsHint,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.controlsHint) {
                            this.controlsHint.destroy();
                        }
                    }
                });
            }
        });
    }

    /**
     * 更新血条
     */
    public updateHealth(current: number, max: number): void {
        const percent = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
        const barWidth = 200;

        this.healthBar.width = barWidth * percent;
        this.healthText.setText(`${Math.ceil(current)}/${Math.ceil(max)}`);

        // 血量低时改变颜色
        if (percent < 0.3) {
            this.healthBar.fillColor = 0xff0000;
        } else if (percent < 0.6) {
            this.healthBar.fillColor = 0xffaa00;
        } else {
            this.healthBar.fillColor = 0xe94560;
        }
    }

    /**
     * 更新护盾条
     */
    public updateShield(current: number, max: number): void {
        const percent = max > 0 ? Math.max(0, current / max) : 0;
        const barWidth = 200;

        this.shieldBar.width = barWidth * percent;
        this.shieldText.setText(`${Math.ceil(current)}/${Math.ceil(max)}`);

        if (percent < 0.3) {
            this.shieldBar.fillColor = 0xff4444;
        } else {
            this.shieldBar.fillColor = 0x00aaff;
        }
    }

    /**
     * 更新技能冷却
     */
    public updateSkillCooldown(index: number, cooldownPercent: number, cooldownText?: string): void {
        if (index < 0 || index >= this.skillSlots.length) return;

        const slot = this.skillSlots[index];
        if (cooldownPercent >= 1) {
            // 技能可用
            slot.cooldownOverlay.setVisible(false);
            slot.cooldownText.setText('');
            slot.iconBg.setFillStyle(0x1a1a2e, 0.9);
        } else {
            // 技能冷却中
            slot.cooldownOverlay.setVisible(true);
            slot.cooldownOverlay.setAlpha(0.6 * (1 - cooldownPercent));
            slot.cooldownText.setText(cooldownText || `${Math.ceil((1 - cooldownPercent) * 100)}%`);
            slot.iconBg.setFillStyle(0x0a0a15, 0.9);
        }
    }

    /**
     * 更新分数
     */
    public updateScore(score: number): void {
        this.scoreText.setText(`分数: ${score}`);
    }

    /**
     * 更新等级和经验值
     */
    public updateLevel(level: number, exp: number, expToNext: number): void {
        this.levelText.setText(`Lv.${level}`);

        const percent = expToNext > 0 ? Math.min(1, exp / expToNext) : 0;
        const barWidth = 120;
        this.expBar.width = barWidth * percent;
        this.expText.setText(`${exp}/${expToNext}`);
    }

    /**
     * 更新连击
     */
    public updateCombo(combo: number): void {
        if (combo >= 2) {
            const multiplier = 1 + (combo - 1) * 0.1;
            this.comboText.setText(`${combo} COMBO x${multiplier.toFixed(1)}`);
            this.comboText.setAlpha(1);

            if (combo >= 10) {
                this.comboText.setColor('#ff0000');
            } else if (combo >= 5) {
                this.comboText.setColor('#ff6600');
            } else {
                this.comboText.setColor('#ffff00');
            }
        } else {
            this.comboText.setAlpha(0);
        }
    }

    /**
     * 更新关卡信息
     */
    public updateLevelInfo(level: number, name: string): void {
        if (this.levelInfoText && this.levelInfoText.active) {
            this.levelInfoText.setText(`第 ${level} 关 - ${name}`);
        }
    }

    /**
     * 显示HUD
     */
    public show(): void {
        this.container.setVisible(true);
    }

    /**
     * 隐藏HUD
     */
    public hide(): void {
        this.container.setVisible(false);
    }

    /**
     * 清理HUD
     */
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
        }
        this.skillSlots = [];
        this.levelNodes = [];
        this.levelLines = [];
    }
}

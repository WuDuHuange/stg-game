/**
 * 武装装备UI管理器
 * 负责显示和管理武装装备界面
 */
export class EquipmentUI {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private equipmentSlots: Map<string, Phaser.GameObjects.Container> = new Map();
    private equipmentData: Map<string, any> = new Map();
    private isVisible: boolean = false;
    private selectedSlot: string = '头部';
    private onEnhance?: (slotName: string, newLevel: number) => void;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 初始化装备UI
     */
    public initialize(): void {
        // 创建主容器
        this.container = this.scene.add.container(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // 创建背景
        const bg = this.scene.add.rectangle(0, 0, 600, 400, 0x0a0a15, 0.95);
        bg.setStrokeStyle(2, 0x4a4a6a);
        this.container.add(bg);

        // 创建标题
        const title = this.scene.add.text(0, -170, '武装装备', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.container.add(title);

        // 创建装备槽位
        this.createEquipmentSlots();

        // 创建装备详情面板
        this.createDetailPanel();

        // 创建关闭按钮
        this.createCloseButton();
    }

    /**
     * 创建装备槽位
     */
    private createEquipmentSlots(): void {
        const slotNames = ['头部', '左手', '右手', '躯干', '腿部'];
        const slotPositions = [
            { x: -220, y: -80 },
            { x: -110, y: 0 },
            { x: 110, y: 0 },
            { x: 0, y: 100 },
            { x: 0, y: 180 }
        ];

        slotNames.forEach((name, index) => {
            const slot = this.scene.add.container(slotPositions[index].x, slotPositions[index].y);

            // 槽位背景
            const slotBg = this.scene.add.rectangle(0, 0, 80, 80, 0x1a1a2e, 0.8);
            slotBg.setStrokeStyle(2, 0x4a4a6a);
            slot.add(slotBg);

            // 槽位名称
            const slotName = this.scene.add.text(0, -50, name, {
                fontSize: '14px',
                color: '#888888',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            slot.add(slotName);

            // 槽位图标（占位）
            const slotIcon = this.scene.add.circle(0, 0, 30, 0x333355, 0.5);
            slot.add(slotIcon);

            // 装备图标（占位）
            const equipmentIcon = this.scene.add.circle(0, 0, 25, 0x00ff00, 0.8);
            equipmentIcon.setVisible(false);
            slot.add(equipmentIcon);

            // 稀有度指示器
            const rarityIndicator = this.scene.add.rectangle(0, 40, 60, 4, 0x888888);
            rarityIndicator.setVisible(false);
            slot.add(rarityIndicator);

            slot.setData('slotName', name);
            slot.setData('equipmentIcon', equipmentIcon);
            slot.setData('rarityIndicator', rarityIndicator);

            // 添加点击事件
            slotBg.setInteractive({ useHandCursor: true });
            slotBg.on('pointerdown', () => {
                this.selectedSlot = name;
                this.showEquipmentDetail(name);
            });

            this.container.add(slot);
            this.equipmentSlots.set(name, slot);
        });
    }

    /**
     * 创建装备详情面板
     */
    private createDetailPanel(): void {
        const detailPanel = this.scene.add.container(180, 0);

        // 详情背景
        const detailBg = this.scene.add.rectangle(0, 0, 200, 300, 0x1a1a2e, 0.9);
        detailBg.setStrokeStyle(2, 0x4a4a6a);
        detailPanel.add(detailBg);

        // 详情标题
        const detailTitle = this.scene.add.text(0, -130, '装备详情', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        detailPanel.add(detailTitle);

        // 装备名称
        const equipmentName = this.scene.add.text(0, -90, '未装备', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
        detailPanel.add(equipmentName);

        // 装备属性（占位）
        const statsText = this.scene.add.text(0, -50, '', {
            fontSize: '14px',
            color: '#aaaaaa',
            align: 'left',
            lineSpacing: 5
        }).setOrigin(0.5);
        detailPanel.add(statsText);

        // 强化按钮
        const enhanceButton = this.scene.add.rectangle(0, 100, 120, 40, 0x4CAF50, 0.8);
        enhanceButton.setInteractive({ useHandCursor: true });
        detailPanel.add(enhanceButton);

        const enhanceText = this.scene.add.text(0, 100, '强化', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        detailPanel.add(enhanceText);

        enhanceButton.on('pointerdown', () => {
            this.enhanceEquipment();
        });

        detailPanel.setData('equipmentName', equipmentName);
        detailPanel.setData('statsText', statsText);
        detailPanel.setData('enhanceButton', enhanceButton);

        this.container.add(detailPanel);
        this.container.setData('detailPanel', detailPanel);
    }

    /**
     * 创建关闭按钮
     */
    private createCloseButton(): void {
        const closeButton = this.scene.add.rectangle(250, -170, 80, 40, 0xe94560, 0.8);
        closeButton.setInteractive({ useHandCursor: true });
        this.container.add(closeButton);

        const closeText = this.scene.add.text(250, -170, '关闭', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(closeText);

        closeButton.on('pointerdown', () => {
            this.hide();
        });
    }

    /**
     * 显示装备UI
     */
    public show(): void {
        if (this.isVisible) return;
        this.isVisible = true;
        this.container.setVisible(true);

        // 淡入动画
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * 隐藏装备UI
     */
    public hide(): void {
        if (!this.isVisible) return;
        this.isVisible = false;

        // 淡出动画
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scale: 0.8,
            duration: 200,
            ease: 'Power2.easeIn',
            onComplete: () => {
                this.container.setVisible(false);
            }
        });
    }

    /**
     * 显示装备详情
     */
    private showEquipmentDetail(slotName: string): void {
        const detailPanel = this.container.getData('detailPanel');
        const equipmentName = detailPanel.getData('equipmentName');
        const statsText = detailPanel.getData('statsText');
        const enhanceButton = detailPanel.getData('enhanceButton');

        // 模拟装备数据
        const equipment = this.getEquipmentData(slotName);

        if (equipment) {
            equipmentName.setText(equipment.name);
            equipmentName.setStyle({ color: this.getRarityColor(equipment.rarity) });

            statsText.setText(
                `攻击力: ${equipment.attack}\n` +
                `防御力: ${equipment.defense}\n` +
                `敏捷: ${equipment.agility}\n` +
                `强化等级: ${equipment.level}/5`
            );

            enhanceButton.setVisible(true);
        } else {
            equipmentName.setText('未装备');
            equipmentName.setStyle({ color: '#888888' });
            statsText.setText('');
            enhanceButton.setVisible(false);
        }
    }

    /**
     * 从WeaponManager同步装备数据
     */
    public syncFromWeaponManager(weaponManager: any): void {
        const slotMapping: Record<string, string> = {
            '头部': 'HEAD',
            '左手': 'LEFT_HAND',
            '右手': 'RIGHT_HAND',
            '躯干': 'TORSO',
            '腿部': 'LEGS'
        };

        for (const [slotName, slotType] of Object.entries(slotMapping)) {
            const weapon = weaponManager.getEquippedWeapon(slotType);
            if (weapon) {
                const data = weapon.getData ? weapon.getData() : weapon;
                const baseStats = data.baseStats || {};
                this.equipmentData.set(slotName, {
                    name: data.name || '未知武装',
                    attack: baseStats.damage || 0,
                    defense: baseStats.defense || 0,
                    agility: baseStats.attackSpeed ? Math.round(baseStats.attackSpeed * 10) : 0,
                    level: 0,
                    maxLevel: 5,
                    rarity: data.rarity || 'COMMON'
                });
            }
        }
    }

    /**
     * 获取装备数据
     */
    private getEquipmentData(slotName: string): any {
        // 初始化装备数据（如果尚未初始化）
        if (this.equipmentData.size === 0) {
            this.initEquipmentData();
        }
        return this.equipmentData.get(slotName) || null;
    }

    /**
     * 初始化装备数据
     */
    private initEquipmentData(): void {
        const defaults = {
            '头部': { name: '战术头盔', attack: 10, defense: 20, agility: 5, level: 0, maxLevel: 5, rarity: 'RARE' },
            '左手': { name: '激光手枪', attack: 30, defense: 5, agility: 10, level: 0, maxLevel: 5, rarity: 'EPIC' },
            '右手': { name: '能量剑', attack: 40, defense: 5, agility: 15, level: 0, maxLevel: 5, rarity: 'LEGENDARY' },
            '躯干': { name: '纳米装甲', attack: 5, defense: 30, agility: 5, level: 0, maxLevel: 5, rarity: 'EPIC' },
            '腿部': { name: '推进靴', attack: 5, defense: 10, agility: 20, level: 0, maxLevel: 5, rarity: 'RARE' }
        };

        for (const [key, value] of Object.entries(defaults)) {
            this.equipmentData.set(key, { ...value });
        }
    }

    /**
     * 获取稀有度颜色
     */
    private getRarityColor(rarity: string): string {
        const colors = {
            'COMMON': '#888888',
            'RARE': '#4CAF50',
            'EPIC': '#2196F3',
            'LEGENDARY': '#FF9800'
        };
        return colors[rarity] || '#888888';
    }

    /**
     * 强化装备
     */
    private enhanceEquipment(): void {
        const equipment = this.getEquipmentData(this.selectedSlot);
        if (!equipment) return;

        // 检查是否已达最大等级
        if (equipment.level >= equipment.maxLevel) {
            this.showEnhanceMessage('已达最高强化等级!');
            return;
        }

        // 强化：每级提升10%属性
        const enhanceRate = 0.1;
        equipment.level++;
        equipment.attack = Math.round(equipment.attack * (1 + enhanceRate));
        equipment.defense = Math.round(equipment.defense * (1 + enhanceRate));
        equipment.agility = Math.round(equipment.agility * (1 + enhanceRate));

        // 更新详情面板
        this.showEquipmentDetail(this.selectedSlot);

        // 创建强化特效
        this.createEnhanceEffect();

        // 显示强化成功消息
        this.showEnhanceMessage(`强化成功! Lv.${equipment.level}`);

        // 通知外部
        if (this.onEnhance) {
            this.onEnhance(this.selectedSlot, equipment.level);
        }
    }

    /**
     * 显示强化消息
     */
    private showEnhanceMessage(message: string): void {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2 - 100;

        const msg = this.scene.add.text(centerX, centerY, message, {
            fontSize: '18px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: msg,
            y: centerY - 30,
            alpha: 0,
            duration: 1500,
            ease: 'Power2.easeOut',
            onComplete: () => msg.destroy()
        });
    }

    /**
     * 设置强化回调
     */
    public setEnhanceCallback(callback: (slotName: string, newLevel: number) => void): void {
        this.onEnhance = callback;
    }

    /**
     * 通过击杀数强化所有装备
     */
    public enhanceByKill(killCount: number): void {
        if (this.equipmentData.size === 0) {
            this.initEquipmentData();
        }

        // 每10击杀强化一次随机装备
        if (killCount % 10 !== 0 || killCount === 0) return;

        const slots = Array.from(this.equipmentData.keys());
        const randomSlot = slots[Math.floor(Math.random() * slots.length)];
        const equipment = this.equipmentData.get(randomSlot);

        if (equipment && equipment.level < equipment.maxLevel) {
            const enhanceRate = 0.1;
            equipment.level++;
            equipment.attack = Math.round(equipment.attack * (1 + enhanceRate));
            equipment.defense = Math.round(equipment.defense * (1 + enhanceRate));
            equipment.agility = Math.round(equipment.agility * (1 + enhanceRate));
        }
    }

    /**
     * 创建强化特效
     */
    private createEnhanceEffect(): void {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        // 创建金色光芒
        const glow = this.scene.add.circle(centerX, centerY, 100, 0xffd700, 0.3);

        this.scene.tweens.add({
            targets: glow,
            scale: 2,
            alpha: 0,
            duration: 500,
            ease: 'Power2.easeOut',
            onComplete: () => {
                glow.destroy();
            }
        });

        // 创建星星粒子
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const star = this.scene.add.circle(centerX, centerY, 5, 0xffd700);

            this.scene.tweens.add({
                targets: star,
                x: centerX + Math.cos(angle) * 150,
                y: centerY + Math.sin(angle) * 150,
                scale: 0,
                alpha: 0,
                duration: 600,
                delay: i * 30,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    star.destroy();
                }
            });
        }
    }

    /**
     * 清理装备UI
     */
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
        }
    }
}

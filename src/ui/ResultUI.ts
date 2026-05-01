/**
 * 结算UI类
 * 负责显示关卡结算界面，包括分数、奖励、重试和继续选项
 */
export class ResultUI {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private visible: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 初始化结算UI
     */
    public initialize(): void {
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(7000);
        this.container.setVisible(false);
    }

    /**
     * 显示结算界面
     */
    public showResult(data: {
        isVictory: boolean;
        score: number;
        enemiesKilled: number;
        maxCombo: number;
        timeElapsed: number;
        level: number;
    }): void {
        if (this.visible) return;
        this.visible = true;

        // 清空容器
        this.container.removeAll(true);

        // 半透明背景
        const bg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.8
        );

        // 结算面板
        const panel = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            500,
            500,
            0x0a0a15,
            0.95
        );
        panel.setStrokeStyle(2, data.isVictory ? 0xffd700 : 0xff0000);

        // 标题
        const title = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 210,
            data.isVictory ? '关卡完成' : '游戏结束',
            {
                fontSize: '48px',
                color: data.isVictory ? '#ffd700' : '#ff0000',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 分隔线
        const divider = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 160,
            400,
            2,
            data.isVictory ? 0xffd700 : 0xff0000,
            0.5
        );

        // 统计数据
        const startY = this.scene.cameras.main.height / 2 - 120;
        const gap = 45;

        // 分数
        this.createStatRow('最终分数', `${data.score}`, startY, '#ffd700');

        // 击杀数
        this.createStatRow('击杀数', `${data.enemiesKilled}`, startY + gap, '#ffffff');

        // 最大连击
        this.createStatRow('最大连击', `${data.maxCombo}`, startY + gap * 2, '#00ffff');

        // 用时
        const minutes = Math.floor(data.timeElapsed / 60);
        const seconds = Math.floor(data.timeElapsed % 60);
        this.createStatRow('用时', `${minutes}:${seconds.toString().padStart(2, '0')}`, startY + gap * 3, '#ffffff');

        // 关卡
        this.createStatRow('关卡', `第 ${data.level} 关`, startY + gap * 4, '#ffffff');

        // 评级（根据分数计算）
        const rank = this.calculateRank(data.score);
        const rankText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            startY + gap * 5 + 10,
            `评级: ${rank}`,
            {
                fontSize: '36px',
                color: this.getRankColor(rank),
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // 按钮区域
        const buttonY = this.scene.cameras.main.height / 2 + 200;

        if (data.isVictory) {
            this.createButton('重新开始', buttonY - 30, 0x00ff00, () => {
                this.hide();
                this.scene.scene.restart();
            });

            this.createButton('返回主菜单', buttonY + 40, 0xe94560, () => {
                this.hide();
                this.scene.scene.start('MenuScene');
            });
        } else {
            // 失败：重新挑战 + 返回主菜单
            this.createButton('重新挑战', buttonY - 30, 0xffd700, () => {
                this.hide();
                this.scene.scene.restart();
            });

            this.createButton('返回主菜单', buttonY + 40, 0xe94560, () => {
                this.hide();
                this.scene.scene.start('MenuScene');
            });
        }

        // 添加到容器
        this.container.add([bg, panel, title, divider, rankText]);
        this.container.setVisible(true);
        this.container.setAlpha(0);

        // 淡入效果
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500,
            ease: 'Power2.easeOut'
        });

        // 标题缩放动画
        title.setScale(0);
        this.scene.tweens.add({
            targets: title,
            scale: 1,
            duration: 500,
            delay: 200,
            ease: 'Back.easeOut'
        });
    }

    /**
     * 创建统计行
     */
    private createStatRow(label: string, value: string, y: number, valueColor: string): void {
        const labelText = this.scene.add.text(
            this.scene.cameras.main.width / 2 - 150,
            y,
            label,
            {
                fontSize: '18px',
                color: '#aaaaaa'
            }
        ).setOrigin(0, 0.5);

        const valueText = this.scene.add.text(
            this.scene.cameras.main.width / 2 + 150,
            y,
            value,
            {
                fontSize: '22px',
                color: valueColor,
                fontStyle: 'bold'
            }
        ).setOrigin(1, 0.5);

        this.container.add([labelText, valueText]);
    }

    /**
     * 创建按钮
     */
    private createButton(text: string, y: number, color: number, callback: () => void): void {
        const buttonBg = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            y,
            300,
            50,
            0x1a1a2e,
            1
        );
        buttonBg.setStrokeStyle(2, color);

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

        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerdown', callback);
        buttonBg.on('pointerover', () => {
            buttonBg.fillColor = 0x2a2a3e;
        });
        buttonBg.on('pointerout', () => {
            buttonBg.fillColor = 0x1a1a2e;
        });

        this.container.add([buttonBg, buttonText]);
    }

    /**
     * 计算评级
     */
    private calculateRank(score: number): string {
        if (score >= 10000) return 'SSS';
        if (score >= 8000) return 'SS';
        if (score >= 6000) return 'S';
        if (score >= 4000) return 'A';
        if (score >= 2000) return 'B';
        if (score >= 1000) return 'C';
        return 'D';
    }

    /**
     * 获取评级颜色
     */
    private getRankColor(rank: string): string {
        switch (rank) {
            case 'SSS': return '#ff0000';
            case 'SS': return '#ff6600';
            case 'S': return '#ffd700';
            case 'A': return '#00ff00';
            case 'B': return '#00ffff';
            case 'C': return '#ffffff';
            default: return '#aaaaaa';
        }
    }

    /**
     * 隐藏结算UI
     */
    public hide(): void {
        if (!this.visible) return;
        this.visible = false;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 300,
            ease: 'Power2.easeIn',
            onComplete: () => {
                this.container.setVisible(false);
                this.container.removeAll(true);
            }
        });
    }

    /**
     * 清理结算UI
     */
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
        }
    }
}

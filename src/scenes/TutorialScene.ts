/**
 * 新手引导场景
 * 分步教学：移动 → Focus 精准走位 → 判定点 → 擦弹 → 射击与 Bomb → 完成
 */

import Phaser from 'phaser';
import { TextureFactory } from '@game/TextureFactory';
import { MECHAS } from '@data/MechaData';

interface TutorialStep {
    title: string;
    lines: string[];
    footer?: string;
    setup?: () => void;
    /** 返回 true 表示本步条件达成，可自动推进（条件型步骤） */
    check?: () => boolean;
    /** 是否需要按空格/回车推进（提示型步骤）。默认 true */
    waitKey?: boolean;
}

export class TutorialScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Image;
    private playerGlow!: Phaser.GameObjects.Arc;
    private hitboxDot!: Phaser.GameObjects.Arc;
    private enemyBullets!: Phaser.GameObjects.Group;
    private playerBullets!: Phaser.GameObjects.Group;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private shiftKey!: Phaser.Input.Keyboard.Key;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private bombKey!: Phaser.Input.Keyboard.Key;
    private escKey!: Phaser.Input.Keyboard.Key;

    private steps: TutorialStep[] = [];
    private stepIndex: number = 0;
    private hintBox!: Phaser.GameObjects.Container;
    private hintTitle!: Phaser.GameObjects.Text;
    private hintBody!: Phaser.GameObjects.Text;
    private hintFooter!: Phaser.GameObjects.Text;
    private stepIndicator!: Phaser.GameObjects.Text;

    private grazeCount: number = 0;
    private grazeText!: Phaser.GameObjects.Text;
    private focusHint!: Phaser.GameObjects.Text;
    private bombFlash!: Phaser.GameObjects.Rectangle;

    private mecha = MECHAS[0];

    constructor() {
        super({ key: 'TutorialScene' });
    }

    create(): void {
        TextureFactory.ensure(this);

        this.cameras.main.setBackgroundColor('#0a0a1a');
        this.add.graphics().fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f23, 0x0f0f23, 1).fillRect(0, 0, 1280, 720);

        this.enemyBullets = this.add.group();
        this.playerBullets = this.add.group();

        this.createPlayer();
        this.createHintBox();
        this.createStatusTexts();
        this.setupInput();
        this.buildSteps();

        this.bombFlash = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0).setDepth(50);

        this.enterStep(0);
    }

    private createPlayer(): void {
        const x = 640;
        const y = 540;
        this.player = this.add.image(x, y, TextureFactory.resolve(this, 'player_ship')).setScale(1.05);
        this.playerGlow = this.add.circle(x, y, 30, this.mecha.color, 0.3);
        this.hitboxDot = this.add.circle(x, y, this.mecha.hitboxRadius, 0xffffff, 1).setDepth(10);
        this.player.setData('speed', this.mecha.moveSpeed);
    }

    private createHintBox(): void {
        const w = 760;
        const h = 200;
        const cx = 640;
        const cy = 200;
        this.hintBox = this.add.container(cx, cy).setDepth(40);

        const bg = this.add.rectangle(0, 0, w, h, 0x000000, 0.82);
        bg.setStrokeStyle(2, 0xe94560);
        const titleBar = this.add.rectangle(0, -h / 2 + 3, w, 6, 0xe94560);

        this.hintTitle = this.add.text(0, -h / 2 + 28, '', {
            fontSize: '24px',
            color: '#e94560',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5, 0);

        this.hintBody = this.add.text(0, -h / 2 + 64, '', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'left',
            lineSpacing: 6,
            wordWrap: { width: w - 60 }
        }).setOrigin(0.5, 0);

        this.hintFooter = this.add.text(0, h / 2 - 24, '', {
            fontSize: '14px',
            color: '#00ffcc',
            fontStyle: 'italic'
        }).setOrigin(0.5, 1);

        this.stepIndicator = this.add.text(w / 2 - 16, -h / 2 + 16, '', {
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(1, 0);

        this.hintBox.add([bg, titleBar, this.hintTitle, this.hintBody, this.hintFooter, this.stepIndicator]);
    }

    private createStatusTexts(): void {
        this.grazeText = this.add.text(20, 20, '擦弹：0', {
            fontSize: '18px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 2
        }).setDepth(30);

        this.focusHint = this.add.text(640, 700, '', {
            fontSize: '14px',
            color: '#00ffcc',
            fontStyle: 'italic'
        }).setOrigin(0.5, 1).setDepth(30);
    }

    private setupInput(): void {
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,A,S,D');
        this.shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.bombKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.spaceKey.on('down', () => this.advance());
        this.escKey.on('down', () => this.returnToMenu());
    }

    private buildSteps(): void {
        this.steps = [
            {
                title: '欢迎来到 STG 机娘世界',
                lines: [
                    '本作是纵向卷轴弹幕射击游戏，乐趣来自「读弹幕 → 走位 → 擦弹」。',
                    '',
                    '【移动】方向键 或 W/A/S/D',
                    '试着移动你的机体熟悉一下手感。'
                ],
                footer: '按 空格/回车 继续下一步'
            },
            {
                title: 'Focus 精准走位',
                lines: [
                    '【Focus】按住 Shift 键进入精准模式：',
                    '  · 机体移动速度降为 40%',
                    '  · 判定点（白点）高亮显示',
                    '',
                    '在密集弹幕中用 Focus 微调走位是 STG 的核心技巧。',
                    '现在按住 Shift 试试慢速移动。'
                ],
                footer: '按 空格/回车 继续'
            },
            {
                title: '判定点 —— STG 的灵魂',
                lines: [
                    '机体中央的白色小圆点是「判定点」。',
                    '被弹判定只看这一个点，机体贴图不参与碰撞！',
                    '',
                    '这意味着：即使弹幕覆盖了机翼，只要判定点没碰到就安全。',
                    '本机娘判定半径仅 ' + this.mecha.hitboxRadius + ' px，可以贴着弹幕穿过去。',
                    '',
                    'Focus 时判定点会高亮，方便你精确把握位置。'
                ],
                footer: '按 空格/回车 继续'
            },
            {
                title: '擦弹 —— 极限回避的艺术',
                lines: [
                    '当敌弹擦过判定点边缘（判定圈外 14px 内）时触发「擦弹」，',
                    '累积擦弹数，是 STG 高手的标志。',
                    '',
                    '接下来会从上方发射几发弹幕，试着靠近但不要被命中。',
                    '擦弹成功时会有金色闪光与计数增加。'
                ],
                setup: () => this.spawnGrazeBullets(),
                check: () => this.grazeCount >= 3,
                waitKey: false,
                footer: '擦弹 3 次以上自动继续（或按空格跳过）'
            },
            {
                title: '射击与 Bomb',
                lines: [
                    '【射击】按住 空格 键持续射击',
                    '【Bomb】按 X 键释放炸弹，清空全屏敌弹并短暂无敌',
                    '',
                    'Bomb 是救命底牌，被弹幕围死时用它脱险。',
                    '现在试试射击和 Bomb 吧（会发射一些靶子弹供你清除）。'
                ],
                setup: () => this.spawnPracticeBullets(),
                footer: '按 空格/回车 完成教学'
            },
            {
                title: '教学完成！',
                lines: [
                    '你已掌握：移动 / Focus / 判定点 / 擦弹 / 射击 / Bomb',
                    '',
                    '实战中记得：读弹幕优先，Focus 走位，擦弹蓄力，Bomb 保命。',
                    '不同机娘有差异化性能，通关主线可解锁更多机体。',
                    '',
                    '祝你在弹幕中翩翩起舞。'
                ],
                footer: '按 空格/回车 返回主菜单'
            }
        ];
    }

    private enterStep(index: number): void {
        if (index >= this.steps.length) {
            this.returnToMenu();
            return;
        }
        this.stepIndex = index;
        const step = this.steps[index];

        this.hintTitle.setText(step.title);
        this.hintBody.setText(step.lines.join('\n'));
        this.hintFooter.setText(step.footer ?? '');
        this.stepIndicator.setText(`步骤 ${index + 1}/${this.steps.length}`);

        this.tweens.add({
            targets: this.hintBox,
            alpha: { from: 0.3, to: 1 },
            duration: 250,
            ease: 'Sine.easeOut'
        });

        if (step.setup) step.setup();
    }

    private advance(): void {
        const step = this.steps[this.stepIndex];
        if (step && step.waitKey === false) return;
        this.enterStep(this.stepIndex + 1);
    }

    update(): void {
        const focused = this.shiftKey.isDown;
        const speed = this.player.getData('speed') * (focused ? 0.4 : 1);
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

        const dt = this.game.loop.delta / 1000;
        this.player.x = Phaser.Math.Clamp(this.player.x + vx * dt, 20, 1260);
        this.player.y = Phaser.Math.Clamp(this.player.y + vy * dt, 20, 700);

        this.playerGlow.x = this.player.x;
        this.playerGlow.y = this.player.y;
        this.hitboxDot.x = this.player.x;
        this.hitboxDot.y = this.player.y;
        this.hitboxDot.setAlpha(focused ? 1 : 0.55);
        this.focusHint.setText(focused ? '◆ Focus 模式中（Shift）' : '');

        this.updateBullets();
        this.checkCollisions();

        if (this.spaceKey.isDown) this.shoot();
        if (Phaser.Input.Keyboard.JustDown(this.bombKey)) this.castBomb();

        const step = this.steps[this.stepIndex];
        if (step && step.waitKey === false && step.check && step.check()) {
            this.enterStep(this.stepIndex + 1);
        }
    }

    private shoot(): void {
        if (this.game.loop.time - (this.player.getData('lastShot') as number ?? 0) < 90) return;
        this.player.setData('lastShot', this.game.loop.time);

        const b = this.add.circle(this.player.x, this.player.y - 20, 4, 0x00ffcc, 1);
        b.setStrokeStyle(1, 0xffffff, 0.8);
        b.setData('vy', -680);
        b.setDepth(5);
        this.playerBullets.add(b);
    }

    private castBomb(): void {
        this.flashHit();
        this.enemyBullets.getChildren().forEach((b: any) => b.destroy());
    }

    private updateBullets(): void {
        const dt = this.game.loop.delta;
        this.playerBullets.getChildren().forEach((b: any) => {
            b.y += (b.getData('vy') as number) * dt / 1000;
            if (b.y < -20) b.destroy();
        });
        this.enemyBullets.getChildren().forEach((b: any) => {
            b.x += (b.getData('vx') as number ?? 0) * dt / 1000;
            b.y += (b.getData('vy') as number) * dt / 1000;
            if (b.y > 740 || b.x < -20 || b.x > 1300) b.destroy();
        });
    }

    private checkCollisions(): void {
        const hitR = this.mecha.hitboxRadius;
        const grazeR = hitR + 14;

        this.enemyBullets.getChildren().forEach((b: any) => {
            if (!b.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);

            if (!b.getData('grazed') && d < grazeR && d > hitR) {
                b.setData('grazed', true);
                this.grazeCount++;
                this.grazeText.setText(`擦弹：${this.grazeCount}`);
                this.add.particles(this.player.x, this.player.y, 'proc_bullet_enemy', {
                    lifespan: 300,
                    scale: { start: 0.6, end: 0 },
                    quantity: 6,
                    tint: 0xffd700
                });
            }

            if (d <= hitR) {
                this.flashHit();
                b.destroy();
            }
        });

        this.playerBullets.getChildren().forEach((pb: any) => {
            if (!pb.active) return;
            this.enemyBullets.getChildren().forEach((eb: any) => {
                if (!eb.active) return;
                if (Phaser.Math.Distance.Between(pb.x, pb.y, eb.x, eb.y) < 14) {
                    eb.destroy();
                    pb.destroy();
                }
            });
        });
    }

    private flashHit(): void {
        this.tweens.add({
            targets: this.bombFlash,
            alpha: { from: 0.4, to: 0 },
            duration: 200
        });
    }

    private spawnGrazeBullets(): void {
        const spawn = (delay: number, x: number, vx: number) => {
            this.time.delayedCall(delay, () => {
                const b = this.add.circle(x, -10, 6, 0xff4466, 1);
                b.setStrokeStyle(1, 0xffffff, 0.6);
                b.setData('vx', vx);
                b.setData('vy', 220);
                b.setDepth(4);
                this.enemyBullets.add(b);
            });
        };
        spawn(200, 400, 60);
        spawn(500, 880, -60);
        spawn(800, 500, 40);
        spawn(1100, 780, -40);
        spawn(1400, 640, 0);
        spawn(1700, 460, 50);
        spawn(2000, 820, -50);
    }

    private spawnPracticeBullets(): void {
        for (let i = 0; i < 8; i++) {
            this.time.delayedCall(i * 250, () => {
                const x = 200 + Math.random() * 880;
                const b = this.add.circle(x, -10, 6, 0xff4466, 1);
                b.setStrokeStyle(1, 0xffffff, 0.6);
                b.setData('vx', (Math.random() - 0.5) * 80);
                b.setData('vy', 200 + Math.random() * 80);
                b.setDepth(4);
                this.enemyBullets.add(b);
            });
        }
    }

    private returnToMenu(): void {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }
}
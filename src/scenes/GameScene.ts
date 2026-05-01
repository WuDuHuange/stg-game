/**
 * 游戏场景 - 主游戏场景
 */

import Phaser from 'phaser';
import { ParticleSystem } from '@game/ParticleSystem';
import { ScreenEffects } from '@game/ScreenEffects';
import { SceneManager } from '@game/SceneManager';
import { SkillManager } from '@game/SkillManager';
import { SynergySystem } from '@game/SynergySystem';
import { EnemyAI } from '@game/EnemyAI';
import { audioManager } from '@systems/AudioManager';
import { PlayerManager } from '@game/PlayerManager';
import { WeaponManager } from '@game/WeaponManager';
import { WeaponLoader } from '@data/WeaponLoader';
import { SlotType } from '@data/WeaponData';
import { StatType } from '@data/PlayerData';
import { SkillType } from '@data/SkillData';
import { getLevelConfig, getEnemiesForLevel, getEnemyConfig, LevelConfig, WaveConfig } from '@data/LevelConfigs';
import { SkillUI } from '@ui/SkillUI';
import { SettingsUI } from '@ui/SettingsUI';
import { PauseUI } from '@ui/PauseUI';
import { ResultUI } from '@ui/ResultUI';
import { EquipmentUI } from '@ui/EquipmentUI';
import { HUDUI } from '@ui/HUDUI';

/**
 * UI层级枚举，用于ESC键导航
 * 层级越高优先级越高，ESC先关闭最顶层的UI
 */
enum UILayerLevel {
    NONE = 0,        // 无UI打开，ESC触发暂停
    EQUIPMENT = 1,   // 装备UI，ESC关闭装备UI
    SKILL = 2,       // 技能UI，ESC关闭技能UI
    SETTINGS = 3,    // 设置UI，ESC关闭设置UI
    PAUSE = 4,       // 暂停UI，ESC恢复游戏
    RESULT = 5       // 结算UI，ESC无操作（需点击按钮）
}

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Arc;
    private playerGlow!: Phaser.GameObjects.Arc;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private escKey!: Phaser.Input.Keyboard.Key;
    private eKey!: Phaser.Input.Keyboard.Key;
    private kKey!: Phaser.Input.Keyboard.Key;
    private oKey!: Phaser.Input.Keyboard.Key;
    private qKey!: Phaser.Input.Keyboard.Key;
    private rKey!: Phaser.Input.Keyboard.Key;
    private fKey!: Phaser.Input.Keyboard.Key;
    private bullets!: Phaser.GameObjects.Group;
    private enemyBullets!: Phaser.GameObjects.Group;
    private enemies!: Phaser.GameObjects.Group;
    private score: number = 0;
    private particleSystem!: ParticleSystem;
    private screenEffects!: ScreenEffects;
    private sceneManager!: SceneManager;
    private equipmentUI!: EquipmentUI;
    private skillUI!: SkillUI;
    private settingsUI!: SettingsUI;
    private pauseUI!: PauseUI;
    private resultUI!: ResultUI;
    private hudUI!: HUDUI;
    private lastShotTime: number = 0;
    private shotCooldown: number = 200;
    private gameOver: boolean = false;

    // 关卡波次系统
    private currentLevelIndex: number = 0;
    private currentWaveIndex: number = 0;
    private currentLevelConfig!: LevelConfig;
    private waveEnemiesSpawned: number = 0;
    private waveTimer!: Phaser.Time.TimerEvent;
    private levelComplete: boolean = false;
    private enemyFireTimer!: Phaser.Time.TimerEvent;
    private playerInvincible: boolean = false;
    private comboCount: number = 0;
    private comboTimer!: Phaser.Time.TimerEvent;
    private lastKillTime: number = 0;
    private trailFrameCounter: number = 0;

    // 玩家管理器（替代内联属性）
    private playerManager!: PlayerManager;
    private killCount: number = 0;
    private maxCombo: number = 0;

    // UI层级管理
    private currentUILayer: UILayerLevel = UILayerLevel.NONE;

    // 技能冷却
    private skillCooldowns: number[] = [0, 0, 0]; // Q, W, E
    private skillMaxCooldowns: number[] = [3, 5, 10]; // 秒
    private skillLastCastTime: number[] = [-999, -999, -999];
    private skillManager!: SkillManager;
    private synergySystem!: SynergySystem;
    private weaponManager!: WeaponManager;
    private boundSkillIds: string[] = ['laser_shot', 'shield_activate', 'laser_barrage']; // Q/R/F绑定的技能ID
    private enemyAIs: Map<any, EnemyAI> = new Map();

    constructor() {
        super({ key: 'GameScene' });
    }

    /**
     * 预加载资源
     */
    preload(): void {
        // 这里可以加载游戏资源
    }

    /**
     * 场景创建
     */
    create(): void {
        console.log('GameScene: 场景创建');

        // 重置游戏状态
        this.gameOver = false;
        this.playerInvincible = false;
        this.score = 0;
        this.comboCount = 0;
        this.killCount = 0;
        this.maxCombo = 0;
        this.currentUILayer = UILayerLevel.NONE;
        this.enemyAIs.clear();
        this.skillCooldowns = [0, 0, 0];
        this.skillLastCastTime = [-999, -999, -999];

        // 初始化玩家管理器
        this.playerManager = new PlayerManager();
        this.playerManager.setStat(StatType.MAX_SHIELD, 50);
        this.playerManager.restoreShield(50);

        // 初始化技能管理器
        this.skillManager = new SkillManager();
        this.synergySystem = new SynergySystem();
        this.weaponManager = new WeaponManager();
        this.equipStartingWeapons();
        this.syncSkillCooldowns();

        // 创建游戏对象组
        this.bullets = this.add.group();
        this.enemyBullets = this.add.group();
        this.enemies = this.add.group();

        // 创建粒子系统
        this.particleSystem = new ParticleSystem(this);

        audioManager.initialize(this);

        // 创建屏幕特效系统
        this.screenEffects = new ScreenEffects(this);

        // 创建场景管理器
        this.sceneManager = new SceneManager(this);
        this.sceneManager.initialize();

        // 创建HUD UI
        this.hudUI = new HUDUI(this);
        this.hudUI.initialize();

        // 创建装备UI
        this.equipmentUI = new EquipmentUI(this);
        this.equipmentUI.initialize();

        // 创建技能UI
        this.skillUI = new SkillUI(this);
        this.skillUI.initialize();

        // 创建设置UI
        this.settingsUI = new SettingsUI(this);
        this.settingsUI.initialize();

        // 创建暂停UI
        this.pauseUI = new PauseUI(this);
        this.pauseUI.initialize();

        // 创建结算UI
        this.resultUI = new ResultUI(this);
        this.resultUI.initialize();

        // 创建背景
        this.createBackground();

        // 创建玩家
        this.createPlayer();

        // 设置输入
        this.setupInput();

        // 显示关卡标题
        this.sceneManager.showLevelTitle('第 1 关', 1500);

        // 显示操作提示
        this.showInstructions();

        // 开始生成敌人
        this.startEnemySpawning();

        // 淡入效果
        this.sceneManager.fadeIn(800);

        // 初始化HUD显示
        this.updateHUD();
    }

    /**
     * 创建背景
     */
    private createBackground(): void {
        // 创建渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0a0a15, 0x0a0a15, 0x1a1a2e, 0x1a1a2e, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // 添加移动的星星
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 2);
            const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.7));

            // 添加移动动画
            this.tweens.add({
                targets: star,
                x: x - this.cameras.main.width,
                duration: Phaser.Math.Between(5000, 15000),
                repeat: -1,
                ease: 'Linear'
            });
        }

        // 创建环境光效
        this.particleSystem.createAmbientLight();

        // 创建时间指示器
        this.particleSystem.createTimeEffect();
    }

    /**
     * 创建玩家
     */
    private createPlayer(): void {
        // 创建玩家精灵（临时使用圆形代替）
        this.player = this.add.circle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            20,
            0xe94560
        );

        // 添加玩家光晕效果
        this.playerGlow = this.add.circle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            30,
            0xe94560,
            0.3
        );

        // 设置玩家属性
        this.player.setData('speed', 300);
    }

    /**
     * 设置输入
     */
    private setupInput(): void {
        // 创建键盘输入
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.kKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.oKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.fKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        // ESC键 - 智能导航
        this.escKey.on('down', () => {
            this.handleESC();
        });

        // E键 - 打开/关闭装备UI
        this.eKey.on('down', () => {
            if (this.currentUILayer > UILayerLevel.EQUIPMENT) return;
            if (this.currentUILayer === UILayerLevel.EQUIPMENT) {
                this.closeEquipmentUI();
            } else if (this.currentUILayer === UILayerLevel.NONE) {
                this.openEquipmentUI();
            }
        });

        // K键 - 打开/关闭技能UI
        this.kKey.on('down', () => {
            if (this.currentUILayer > UILayerLevel.SKILL) return;
            if (this.currentUILayer === UILayerLevel.SKILL) {
                this.closeSkillUI();
            } else if (this.currentUILayer === UILayerLevel.NONE) {
                this.openSkillUI();
            }
        });

        // O键 - 打开/关闭设置UI
        this.oKey.on('down', () => {
            if (this.currentUILayer > UILayerLevel.SETTINGS) return;
            if (this.currentUILayer === UILayerLevel.SETTINGS) {
                this.closeSettingsUI();
            } else if (this.currentUILayer === UILayerLevel.NONE) {
                this.openSettingsUI();
            }
        });

        // Q键 - 释放技能1（无冲突）
        this.qKey.on('down', () => {
            this.castSkill(0);
        });

        // R键 - 释放技能2（不与WASD移动冲突）
        this.rKey.on('down', () => {
            this.castSkill(1);
        });

        // F键 - 释放技能3（不与任何功能冲突）
        this.fKey.on('down', () => {
            this.castSkill(2);
        });
    }

    /**
     * ESC键智能导航
     * 根据当前UI层级决定ESC的行为：
     * - 结算UI打开 → 无操作（需点击按钮）
     * - 暂停UI打开 → 恢复游戏
     * - 设置UI打开 → 关闭设置
     * - 技能UI打开 → 关闭技能
     * - 装备UI打开 → 关闭装备
     * - 无UI打开 → 暂停游戏
     */
    private handleESC(): void {
        switch (this.currentUILayer) {
            case UILayerLevel.RESULT:
                // 结算界面不响应ESC，需点击按钮
                break;
            case UILayerLevel.PAUSE:
                this.closePauseUI();
                break;
            case UILayerLevel.SETTINGS:
                this.closeSettingsUI();
                break;
            case UILayerLevel.SKILL:
                this.closeSkillUI();
                break;
            case UILayerLevel.EQUIPMENT:
                this.closeEquipmentUI();
                break;
            case UILayerLevel.NONE:
                this.openPauseUI();
                break;
        }
    }

    /**
     * 打开装备UI
     */
    private openEquipmentUI(): void {
        if (this.currentUILayer !== UILayerLevel.NONE) return;
        this.currentUILayer = UILayerLevel.EQUIPMENT;
        this.equipmentUI.syncFromWeaponManager(this.weaponManager);
        this.equipmentUI.show();
    }

    /**
     * 关闭装备UI
     */
    private closeEquipmentUI(): void {
        if (this.currentUILayer !== UILayerLevel.EQUIPMENT) return;
        this.currentUILayer = UILayerLevel.NONE;
        this.equipmentUI.hide();
    }

    /**
     * 打开技能UI
     */
    private openSkillUI(): void {
        if (this.currentUILayer !== UILayerLevel.NONE) return;
        this.currentUILayer = UILayerLevel.SKILL;
        this.skillUI.show();
    }

    /**
     * 关闭技能UI
     */
    private closeSkillUI(): void {
        if (this.currentUILayer !== UILayerLevel.SKILL) return;
        this.currentUILayer = UILayerLevel.NONE;
        this.skillUI.hide();
    }

    /**
     * 打开设置UI
     */
    private openSettingsUI(): void {
        if (this.currentUILayer !== UILayerLevel.NONE) return;
        this.currentUILayer = UILayerLevel.SETTINGS;
        this.settingsUI.show();
    }

    /**
     * 关闭设置UI
     */
    private closeSettingsUI(): void {
        if (this.currentUILayer !== UILayerLevel.SETTINGS) return;
        this.currentUILayer = UILayerLevel.NONE;
        this.settingsUI.hide();
    }

    /**
     * 打开暂停UI
     */
    private openPauseUI(): void {
        if (this.currentUILayer !== UILayerLevel.NONE) return;
        this.currentUILayer = UILayerLevel.PAUSE;
        this.pauseUI.pause();
    }

    /**
     * 关闭暂停UI（恢复游戏）
     */
    private closePauseUI(): void {
        if (this.currentUILayer !== UILayerLevel.PAUSE) return;
        this.currentUILayer = UILayerLevel.NONE;
        this.pauseUI.resume();
    }

    /**
     * 从暂停UI返回主菜单
     */
    private returnToMenuFromPause(): void {
        this.currentUILayer = UILayerLevel.NONE;
        this.pauseUI.returnToMenu();
    }

    /**
     * 释放技能
     */
    private castSkill(index: number): void {
        if (this.currentUILayer !== UILayerLevel.NONE) return;
        if (this.gameOver) return;

        const now = this.time.now / 1000;
        const elapsed = now - this.skillLastCastTime[index];

        if (elapsed >= this.skillMaxCooldowns[index]) {
            this.skillLastCastTime[index] = now;

            // 从SkillManager获取技能数据
            const skillId = this.boundSkillIds[index];
            const skill = this.skillManager.getSkill(skillId);

            // 创建技能释放特效
            this.particleSystem.createSkillCast(this.player.x, this.player.y);
            audioManager.playProceduralSFX('skill');

            // 技能效果 - 根据技能类型决定效果
            if (index === 0) {
                // Q技能 - 主动攻击技能
                const damage = skill ? skill.getEffect().damage : 50;
                const shots = Math.ceil(damage / 25); // 伤害越高子弹越多
                for (let i = 0; i < Math.min(shots, 5); i++) {
                    this.time.delayedCall(i * 50, () => this.shoot());
                }
            } else if (index === 1) {
                // W技能 - 护盾/辅助技能
                const shieldRestore = skill ? Math.round(skill.getEffect().damage * 0.4) : 20;
                this.playerManager.restoreShield(shieldRestore);
                this.updateHUD();
            } else if (index === 2) {
                this.enemies.getChildren().forEach((enemy: any) => {
                    if (enemy.active) {
                        const score = enemy.getData('score') || 100;
                        const experience = enemy.getData('experience') || 10;
                        this.score += score;
                        this.killCount++;
                        this.comboCount++;
                        if (this.comboCount > this.maxCombo) {
                            this.maxCombo = this.comboCount;
                        }
                        this.createExplosion(enemy.x, enemy.y);
                        this.destroyEnemy(enemy);
                        this.gainExperience(experience);
                    }
                });
                if (this.comboCount >= 2) {
                    this.particleSystem.createComboEffect(this.player.x, this.player.y, this.comboCount);
                    audioManager.playProceduralSFX('combo');
                }
                audioManager.playProceduralSFX('explosion');
                this.screenEffects.shakeAndFlash(20, 0xffd700, 500);
            }
        }
    }

    /**
     * 从SkillManager同步技能冷却时间
     */
    private syncSkillCooldowns(): void {
        for (let i = 0; i < this.boundSkillIds.length; i++) {
            const skill = this.skillManager.getSkill(this.boundSkillIds[i]);
            if (skill) {
                this.skillMaxCooldowns[i] = skill.getEffect().cooldown;
            }
        }
    }

    /**
     * 绑定技能到快捷键槽位
     */
    public bindSkillToSlot(skillId: string, slotIndex: number): void {
        if (slotIndex < 0 || slotIndex >= 3) return;
        this.boundSkillIds[slotIndex] = skillId;
        this.syncSkillCooldowns();
    }

    /**
     * 装备初始武器（从WeaponLoader获取）
     */
    private equipStartingWeapons(): void {
        const weapons = WeaponLoader.createExampleWeapons();
        const slotTypes = [SlotType.LEFT_HAND, SlotType.RIGHT_HAND, SlotType.HEAD, SlotType.TORSO, SlotType.LEGS];

        for (let i = 0; i < Math.min(weapons.length, slotTypes.length); i++) {
            this.weaponManager.equipWeapon(slotTypes[i], weapons[i]);
        }

        // 更新协同效果
        this.synergySystem.checkSynergies(this.weaponManager.getAllEquippedWeapons());
    }

    /**
     * 获取WeaponManager（供EquipmentUI使用）
     */
    public getWeaponManager(): WeaponManager {
        return this.weaponManager;
    }

    /**
     * 显示操作提示
     */
    private showInstructions(): void {
        const instructions = [
            'WASD/方向键 移动 | SPACE 射击',
            'Q/R/F 技能 | ESC 暂停'
        ];

        const instructionTexts: Phaser.GameObjects.Text[] = [];

        instructions.forEach((text, index) => {
            const instructionText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 30 + index * 30,
                text,
                {
                    fontSize: '18px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);
            instructionTexts.push(instructionText);
        });

        // 3秒后隐藏提示
        this.time.delayedCall(3000, () => {
            instructionTexts.forEach(text => {
                if (text && text.active) {
                    this.tweens.add({
                        targets: text,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => text.destroy()
                    });
                }
            });
        });
    }

    /**
     * 更新HUD显示
     */
    private updateHUD(): void {
        const stats = this.playerManager.getStats();
        const levelData = this.playerManager.getLevelData();
        this.hudUI.updateHealth(stats.health, stats.maxHealth);
        this.hudUI.updateShield(stats.shield, stats.maxShield);
        this.hudUI.updateScore(this.score);
        this.hudUI.updateLevel(levelData.level, levelData.experience, levelData.experienceToNextLevel);
        this.hudUI.updateCombo(this.comboCount);

        // 更新协同效果显示
        const activeSynergies = this.synergySystem.getActiveSynergies();
        this.hudUI.updateSynergies(activeSynergies.map(s => s.synergyId));
    }

    /**
     * 更新游戏逻辑
     */
    update(): void {
        // 如果游戏结束，停止更新
        if (this.gameOver) return;

        if (!this.player || !this.player.active) return;

        // 更新技能冷却显示
        this.updateSkillCooldowns();

        // 如果有UI打开（非NONE），不处理游戏输入
        if (this.currentUILayer !== UILayerLevel.NONE) return;

        // 更新连击显示
        this.hudUI.updateCombo(this.comboCount);

        const speed = this.player.getData('speed');
        let velocityX = 0;
        let velocityY = 0;

        // 检查键盘输入
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = speed;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = speed;
        }

        // 归一化对角线移动
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        // 更新玩家位置
        this.player.x += velocityX * this.game.loop.delta / 1000;
        this.player.y += velocityY * this.game.loop.delta / 1000;

        // 更新光晕位置（跟随玩家）
        if (this.playerGlow && this.playerGlow.active) {
            this.playerGlow.x = this.player.x;
            this.playerGlow.y = this.player.y;
        }

        // 限制玩家在屏幕内
        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            20,
            this.cameras.main.width - 20
        );
        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            20,
            this.cameras.main.height - 20
        );

        // 检查射击
        if (this.spaceKey.isDown) {
            const currentTime = Date.now();
            if (currentTime - this.lastShotTime >= this.shotCooldown) {
                this.shoot();
                this.lastShotTime = currentTime;
            }
        }

        // 更新子弹
        this.updateBullets();

        // 更新敌人
        this.updateEnemies();

        // 检查碰撞
        this.checkCollisions();

        // 更新敌人子弹并检测碰撞
        this.updateEnemyBullets();
        this.checkEnemyBulletCollisions();

        // 护盾缓慢恢复
        const stats = this.playerManager.getStats();
        if (stats.shield < stats.maxShield) {
            this.playerManager.restoreShield(0.02);
            this.hudUI.updateShield(this.playerManager.getStats().shield, stats.maxShield);
        }
    }

    /**
     * 更新技能冷却显示
     */
    private updateSkillCooldowns(): void {
        const now = this.time.now / 1000;
        for (let i = 0; i < 3; i++) {
            const elapsed = now - this.skillLastCastTime[i];
            const percent = Math.min(1, elapsed / this.skillMaxCooldowns[i]);
            this.hudUI.updateSkillCooldown(i, percent);
        }
    }

    /**
     * 射击
     */
    private shoot(): void {
        const bullet = this.add.circle(
            this.player.x,
            this.player.y - 20,
            5,
            0x00ff00
        );

        bullet.setData('speed', 500);
        bullet.setData('damage', 10);

        this.bullets.add(bullet);

        this.particleSystem.createBulletMuzzle(this.player.x, this.player.y - 20);
        audioManager.playProceduralSFX('shoot');
    }

    /**
     * 更新子弹
     */
    private updateBullets(): void {
        this.bullets.getChildren().forEach((bullet: any) => {
            const speed = bullet.getData('speed');
            bullet.y -= speed * this.game.loop.delta / 1000;

            // 移除超出屏幕的子弹
            if (bullet.y < -10) {
                bullet.destroy();
            }
        });
    }

    /**
     * 开始关卡波次系统
     */
    private startEnemySpawning(): void {
        this.currentLevelIndex = 0;
        this.currentWaveIndex = 0;
        this.levelComplete = false;
        this.startLevel(this.currentLevelIndex);

        // 启动敌人射击定时器（每500ms检查一次哪些敌人需要射击）
        this.enemyFireTimer = this.time.addEvent({
            delay: 500,
            callback: this.processEnemyFire,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 处理敌人射击 - 根据敌人类型发射不同弹幕
     */
    private processEnemyFire(): void {
        if (this.gameOver || this.currentUILayer !== UILayerLevel.NONE) return;

        this.enemies.getChildren().forEach((enemy: any) => {
            if (!enemy.active) return;

            const isBoss = enemy.getData('isBoss') || false;
            const enemyId = enemy.getData('enemyId') || '';
            const now = this.time.now;

            // 检查射击间隔
            const lastFire = enemy.getData('lastFireTime') || 0;
            const fireRate = isBoss ? 1500 : 3000; // Boss射速快
            if (now - lastFire < fireRate) return;

            enemy.setData('lastFireTime', now);

            // 根据敌人ID决定弹幕模式
            if (isBoss) {
                this.fireBossBullets(enemy);
            } else if (enemyId.startsWith('heavy')) {
                this.fireSpreadBullets(enemy, 3, 150);
            } else if (enemyId.startsWith('elite')) {
                this.fireSpreadBullets(enemy, 5, 120);
            } else {
                this.fireSingleBullet(enemy, 180);
            }
        });
    }

    /**
     * 敌人发射单发子弹
     */
    private fireSingleBullet(enemy: any, speed: number): void {
        const bullet = this.add.circle(enemy.x, enemy.y + 10, 4, 0xff6600);
        const glow = this.add.circle(enemy.x, enemy.y + 10, 8, 0xff6600, 0.3);
        bullet.setData('velocityX', Math.cos(Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)) * speed);
        bullet.setData('velocityY', Math.sin(Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)) * speed);
        bullet.setData('damage', 8);
        bullet.setData('glow', glow);
        this.enemyBullets.add(bullet);
    }

    /**
     * 敌人发射扇形弹幕
     */
    private fireSpreadBullets(enemy: any, count: number, speed: number): void {
        const baseAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const spreadAngle = Math.PI / 6;

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i - (count - 1) / 2) * (spreadAngle / count * 2);
            const bullet = this.add.circle(enemy.x, enemy.y + 10, 3, 0xff8800);
            const glow = this.add.circle(enemy.x, enemy.y + 10, 7, 0xff8800, 0.3);
            bullet.setData('velocityX', Math.cos(angle) * speed);
            bullet.setData('velocityY', Math.sin(angle) * speed);
            bullet.setData('damage', 10);
            bullet.setData('glow', glow);
            this.enemyBullets.add(bullet);
        }
    }

    /**
     * Boss发射弹幕（圆形+螺旋混合）
     */
    private fireBossBullets(enemy: any): void {
        const bulletCount = 8;
        const speed = 140;
        const healthPercent = (enemy.getData('health') || 1) / (enemy.getData('maxHealth') || 1);

        const actualCount = healthPercent < 0.3 ? bulletCount * 2 : bulletCount;
        const time = this.time.now / 1000;

        for (let i = 0; i < actualCount; i++) {
            const angle = (i / actualCount) * Math.PI * 2 + time * 2;
            const bullet = this.add.circle(enemy.x, enemy.y, 5, 0xff4400);
            const glow = this.add.circle(enemy.x, enemy.y, 10, 0xff4400, 0.3);
            bullet.setData('velocityX', Math.cos(angle) * speed);
            bullet.setData('velocityY', Math.sin(angle) * speed);
            bullet.setData('damage', 15);
            bullet.setData('glow', glow);
            this.enemyBullets.add(bullet);
        }
    }

    /**
     * 更新敌人子弹
     */
    private updateEnemyBullets(): void {
        this.trailFrameCounter++;
        const shouldTrail = this.trailFrameCounter % 3 === 0;

        this.enemyBullets.getChildren().forEach((bullet: any) => {
            const vx = bullet.getData('velocityX') || 0;
            const vy = bullet.getData('velocityY') || 100;
            bullet.x += vx * this.game.loop.delta / 1000;
            bullet.y += vy * this.game.loop.delta / 1000;

            const glow = bullet.getData('glow');
            if (glow && glow.active) {
                glow.x = bullet.x;
                glow.y = bullet.y;
            }

            if (shouldTrail && bullet.active) {
                const color = bullet.fillColor || 0xff6600;
                this.particleSystem.createEnemyBulletTrail(bullet.x, bullet.y, color);
            }

            if (bullet.y > this.cameras.main.height + 20 ||
                bullet.y < -20 ||
                bullet.x < -20 ||
                bullet.x > this.cameras.main.width + 20) {
                if (glow && glow.active) glow.destroy();
                bullet.destroy();
            }
        });
    }

    /**
     * 检查敌人子弹与玩家的碰撞
     */
    private checkEnemyBulletCollisions(): void {
        if (this.gameOver || this.playerInvincible) return;

        this.enemyBullets.getChildren().forEach((bullet: any) => {
            if (!bullet.active) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                bullet.x, bullet.y
            );

            if (distance < 20) {
                const damage = bullet.getData('damage') || 8;
                const glow = bullet.getData('glow');
                if (glow && glow.active) glow.destroy();
                this.playerTakeDamage(damage);
                bullet.destroy();
            }
        });
    }

    /**
     * 开始指定关卡
     */
    private startLevel(levelIndex: number): void {
        const config = getLevelConfig(`level_${levelIndex + 1}`);
        if (!config) {
            // 所有关卡完成
            this.levelComplete = true;
            return;
        }

        this.currentLevelConfig = config;
        this.currentWaveIndex = 0;
        this.waveEnemiesSpawned = 0;

        // 更新HUD关卡进度
        if (this.hudUI) {
            this.hudUI.setLevelProgress(levelIndex);
            this.hudUI.updateLevelInfo(levelIndex + 1, config.name);
        }

        // 显示关卡开始提示
        this.showLevelStartMessage(config.name);

        // 开始第一波
        this.startWave();
    }

    /**
     * 开始当前波次
     */
    private startWave(): void {
        if (!this.currentLevelConfig || this.currentWaveIndex >= this.currentLevelConfig.waves.length) {
            // 所有波次完成，进入下一关
            this.currentLevelIndex++;
            this.time.delayedCall(2000, () => this.startLevel(this.currentLevelIndex));
            return;
        }

        const wave = this.currentLevelConfig.waves[this.currentWaveIndex];
        this.waveEnemiesSpawned = 0;

        // 按波次间隔生成敌人
        this.waveTimer = this.time.addEvent({
            delay: wave.spawnInterval,
            callback: this.spawnWaveEnemy,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 生成波次敌人
     */
    private spawnWaveEnemy(): void {
        if (!this.currentLevelConfig || this.currentWaveIndex >= this.currentLevelConfig.waves.length) return;

        const wave = this.currentLevelConfig.waves[this.currentWaveIndex];

        // 计算波次总敌人数
        const totalEnemies = wave.enemies.reduce((sum, e) => sum + e.count, 0);

        if (this.waveEnemiesSpawned >= totalEnemies) {
            // 当前波次完成
            if (this.waveTimer) this.waveTimer.destroy();
            this.currentWaveIndex++;

            // 等待后开始下一波
            this.time.delayedCall(wave.spawnInterval * 2, () => {
                if (!this.gameOver) this.startWave();
            });
            return;
        }

        // 根据已生成数量确定当前敌人类型
        let remaining = this.waveEnemiesSpawned;
        let enemyId = wave.enemies[0]?.id || 'light_scout';
        let isBoss = false;

        for (const entry of wave.enemies) {
            if (remaining < entry.count) {
                enemyId = entry.id;
                isBoss = entry.id.startsWith('boss');
                break;
            }
            remaining -= entry.count;
        }

        // 生成敌人 - 优先从EnemyConfig获取数据，否则用默认值
        const x = Phaser.Math.Between(30, this.cameras.main.width - 30);
        const y = -30;

        const config = getEnemyConfig(enemyId);
        const enemyRadius = config ? config.radius : (isBoss ? 30 : 15);
        const enemyColor = config ? config.color : (isBoss ? 0xff4400 : 0xff0000);
        const enemyHealth = config ? config.health : (isBoss ? 200 : 20);
        const enemyDamage = config ? config.damage : 10;
        const enemySpeed = config ? config.speed : Phaser.Math.Between(50, 150);
        const enemyScore = config ? config.score : (isBoss ? 500 : 100);
        const enemyExp = config ? config.experience : 10;

        const enemy = this.add.circle(x, y, enemyRadius, enemyColor);
        enemy.setData('speed', enemySpeed);
        enemy.setData('health', enemyHealth);
        enemy.setData('maxHealth', enemyHealth);
        enemy.setData('damage', enemyDamage);
        enemy.setData('score', enemyScore);
        enemy.setData('experience', enemyExp);
        enemy.setData('isBoss', isBoss);
        enemy.setData('enemyId', enemyId);

        // 添加敌人光晕 - 关联到enemy以便销毁时清理
        const glow = this.add.circle(x, y, enemyRadius + 10, enemyColor, 0.3);
        enemy.setData('glow', glow);

        this.enemies.add(enemy);
        this.waveEnemiesSpawned++;

        const aiConfig = isBoss
            ? { chaseRange: 500, attackRange: 300, retreatHealthPercent: 0.1, chaseSpeed: 80 }
            : enemyId.startsWith('heavy')
                ? { chaseRange: 350, attackRange: 200, chaseSpeed: 60 }
                : enemyId.startsWith('elite')
                    ? { chaseRange: 400, attackRange: 250, chaseSpeed: 100 }
                    : { chaseRange: 300, attackRange: 150, chaseSpeed: 90 };
        this.enemyAIs.set(enemy, new EnemyAI(enemy, aiConfig));
    }

    /**
     * 显示关卡开始消息
     */
    private showLevelStartMessage(levelName: string): void {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const title = this.add.text(centerX, centerY - 20, `第 ${this.currentLevelIndex + 1} 关`, {
            fontSize: '28px',
            color: '#e94560',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const subtitle = this.add.text(centerX, centerY + 15, levelName, {
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [title, subtitle],
            alpha: 0,
            y: '-=30',
            duration: 2000,
            delay: 1000,
            ease: 'Power2.easeOut',
            onComplete: () => {
                title.destroy();
                subtitle.destroy();
            }
        });
    }

    /**
     * 更新敌人
     */
    private updateEnemies(): void {
        const sw = this.cameras.main.width;
        const sh = this.cameras.main.height;

        this.enemies.getChildren().forEach((enemy: any) => {
            if (!enemy.active) return;

            const ai = this.enemyAIs.get(enemy);
            if (ai) {
                ai.update(this.game.loop.delta, this.player.x, this.player.y, sw, sh);
            }

            const glow = enemy.getData('glow');
            if (glow && glow.active) {
                glow.x = enemy.x;
                glow.y = enemy.y;
            }

            if (enemy.y > sh + 60) {
                this.destroyEnemy(enemy);
            }
        });
    }

    /**
     * 销毁敌人及其关联的光晕
     */
    private destroyEnemy(enemy: any): void {
        const glow = enemy.getData('glow');
        if (glow && glow.active) {
            glow.destroy();
        }
        const ai = this.enemyAIs.get(enemy);
        if (ai) {
            ai.destroy();
            this.enemyAIs.delete(enemy);
        }
        if (enemy.active) {
            enemy.destroy();
        }
    }

    /**
     * 检查碰撞
     */
    private checkCollisions(): void {
        if (this.gameOver) return;

        // 子弹与敌人的碰撞
        const bulletsToDestroy: any[] = [];
        const enemiesToDamage: Map<any, number> = new Map();

        this.bullets.getChildren().forEach((bullet: any) => {
            if (!bullet.active) return;

            this.enemies.getChildren().forEach((enemy: any) => {
                if (!enemy.active) return;

                const distance = Phaser.Math.Distance.Between(
                    bullet.x, bullet.y,
                    enemy.x, enemy.y
                );

                if (distance < 20) {
                    if (!bulletsToDestroy.includes(bullet)) {
                        bulletsToDestroy.push(bullet);
                    }

                    const damage = bullet.getData('damage');
                    const currentDamage = enemiesToDamage.get(enemy) || 0;
                    enemiesToDamage.set(enemy, currentDamage + damage);
                }
            });
        });

        // 应用伤害
        enemiesToDamage.forEach((damage, enemy) => {
            if (!enemy.active) return;

            const health = enemy.getData('health');
            const newHealth = health - damage;

            if (newHealth <= 0) {
                // 敌人死亡
                const score = enemy.getData('score');
                const experience = enemy.getData('experience') || 10;
                this.comboCount++;
                this.lastKillTime = Date.now();
                if (this.comboCount > this.maxCombo) {
                    this.maxCombo = this.comboCount;
                }
                const comboMultiplier = 1 + (this.comboCount - 1) * 0.1;
                this.score += Math.floor(score * comboMultiplier);
                this.killCount++;

                // 重置连击计时器
                if (this.comboTimer) {
                    this.comboTimer.destroy();
                }
                this.comboTimer = this.time.delayedCall(2000, () => {
                    this.comboCount = 0;
                });

                if (this.comboCount >= 2) {
                    this.particleSystem.createComboEffect(enemy.x, enemy.y, this.comboCount);
                    audioManager.playProceduralSFX('combo');
                }

                this.createExplosion(enemy.x, enemy.y);
                audioManager.playProceduralSFX('explosion');

                // 添加轻微屏幕震动
                this.screenEffects.shake(5, 200);

                // 销毁敌人及光晕
                this.destroyEnemy(enemy);

                // 获取经验值
                this.gainExperience(experience);
            } else {
                // 敌人受伤
                enemy.setData('health', newHealth);

                // 闪烁效果
                const originalColor = enemy.fillColor;
                enemy.setFillStyle(0xffffff);

                this.time.delayedCall(100, () => {
                    if (enemy.active) {
                        enemy.setFillStyle(originalColor);
                    }
                });
            }
        });

        // 销毁子弹
        bulletsToDestroy.forEach(bullet => {
            if (bullet.active) {
                bullet.destroy();
            }
        });

        // 敌人与玩家的碰撞
        const enemiesToDestroy: any[] = [];
        this.enemies.getChildren().forEach((enemy: any) => {
            if (!enemy.active) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance < 35) {
                const enemyDamage = enemy.getData('damage') || 10;
                this.playerTakeDamage(enemyDamage);
                enemiesToDestroy.push(enemy);
            }
        });

        enemiesToDestroy.forEach(enemy => {
            this.destroyEnemy(enemy);
        });
    }

    /**
     * 获取经验值
     */
    private gainExperience(amount: number): void {
        const oldLevel = this.playerManager.getLevel();
        const leveledUp = this.playerManager.addExperience(amount);

        // 检查升级
        if (leveledUp) {
            // 升级属性提升
            this.playerManager.addStat(StatType.MAX_HEALTH, 10);
            this.playerManager.heal(this.playerManager.getStats().maxHealth); // 满血
            this.playerManager.addStat(StatType.MAX_SHIELD, 5);
            this.playerManager.restoreShield(this.playerManager.getStats().maxShield); // 满盾

            // 升级特效
            this.particleSystem.createLevelUp(this.player.x, this.player.y);
            audioManager.playProceduralSFX('upgrade');
            this.screenEffects.shakeAndFlash(10, 0x00ff88, 300);
        }

        this.updateHUD();
    }

    /**
     * 玩家受到伤害
     */
    private playerTakeDamage(damage: number): void {
        if (this.playerInvincible || this.gameOver) return;

        // 委托给PlayerManager处理（先扣护盾再扣血量，考虑防御）
        this.playerManager.takeDamage(damage);

        // 更新HUD
        this.updateHUD();

        // 创建屏幕震动+闪光效果
        this.screenEffects.shakeAndFlash(15, 0xff0000, 300);

        this.particleSystem.createPlayerHit(this.player.x, this.player.y);
        audioManager.playProceduralSFX('hit');

        // 闪烁效果
        const originalColor = this.player.fillColor;
        this.player.setFillStyle(0xff0000);
        this.playerInvincible = true;

        this.time.delayedCall(100, () => {
            if (this.player && this.player.active) {
                this.player.setFillStyle(originalColor);
            }
        });

        // 1秒无敌时间
        this.time.delayedCall(1000, () => {
            this.playerInvincible = false;
        });

        // 检查游戏结束
        if (!this.playerManager.isAlive()) {
            this.gameOver = true;
            this.handleGameOver();
        }
    }

    /**
     * 处理游戏结束
     */
    private handleGameOver(): void {
        console.log('GameScene: 游戏结束，分数:', this.score);

        if (this.waveTimer) {
            this.waveTimer.destroy();
        }
        if (this.enemyFireTimer) {
            this.enemyFireTimer.destroy();
        }

        // 停止连击计时器
        if (this.comboTimer) {
            this.comboTimer.destroy();
        }

        // 设置结算UI层级
        this.currentUILayer = UILayerLevel.RESULT;

        // 显示结算界面
        this.resultUI.showResult({
            isVictory: false,
            score: this.score,
            enemiesKilled: this.killCount,
            maxCombo: this.maxCombo,
            timeElapsed: this.time.now / 1000,
            level: 1
        });
    }

    /**
     * 创建爆炸效果
     */
    private createExplosion(x: number, y: number): void {
        this.particleSystem.createEnemyDeath(x, y);
    }

    /**
     * 场景销毁
     */
    destroy(): void {
        console.log('GameScene: 场景销毁');

        // 清理HUD UI
        if (this.hudUI) {
            this.hudUI.destroy();
        }

        // 清理装备UI
        if (this.equipmentUI) {
            this.equipmentUI.destroy();
        }

        // 清理场景管理器
        if (this.sceneManager) {
            this.sceneManager.destroy();
        }

        // 清理技能UI
        if (this.skillUI) {
            this.skillUI.destroy();
        }

        // 清理设置UI
        if (this.settingsUI) {
            this.settingsUI.destroy();
        }

        // 清理暂停UI
        if (this.pauseUI) {
            this.pauseUI.destroy();
        }

        // 清理结算UI
        if (this.resultUI) {
            this.resultUI.destroy();
        }

        // 停止所有定时器
        if (this.waveTimer) {
            this.waveTimer.destroy();
        }
        if (this.enemyFireTimer) {
            this.enemyFireTimer.destroy();
        }

        // 停止所有动画
        this.tweens.killAll();

        // 停止所有延迟调用
        this.time.removeAllEvents();

        // 清理粒子系统
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }

        // 清理屏幕特效系统
        if (this.screenEffects) {
            this.screenEffects.destroy();
        }

        // 清理所有游戏对象
        if (this.bullets) {
            this.bullets.clear(true, true);
        }
        if (this.enemyBullets) {
            this.enemyBullets.clear(true, true);
        }
        if (this.enemies) {
            this.enemies.clear(true, true);
        }

        super.destroy();
    }
}

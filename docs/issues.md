# STG 项目问题清单与修复状态

> 生成日期: 2026-04-24
> 审查范围: src/ 下所有 .ts 文件

## 修复状态说明

- [x] 已修复
- [ ] 未修复
- [~] 部分修复 / 需后续跟进

---

## HIGH 严重度

### #1 [x] 重复枚举定义 — EnemyConfigs vs EnemyData
- **文件**: `src/data/EnemyConfigs.ts:7-20`, `src/data/EnemyData.ts:8-23`
- **问题**: `EnemyType` 和 `EnemyRarity` 在两个文件中重复定义，值不同（小写 vs 大写，枚举成员不同）
- **修复**: 删除 `EnemyConfigs.ts` 中的重复枚举，改为从 `EnemyData.ts` 导入；调整 `EnemyConfigs` 使用统一的枚举值

### #2 [x] 重复枚举定义 — LevelConfigs vs EnemyData
- **文件**: `src/data/LevelConfigs.ts:9-24`, `src/data/EnemyData.ts:8-23`
- **问题**: `EnemyRarity` 和 `EnemyCategory` 与 `EnemyData.ts` 中的 `EnemyType`/`EnemyRarity` 重复且值不同
- **修复**: `LevelConfigs` 改为从 `EnemyData.ts` 导入枚举，`EnemyCategory` 映射到 `EnemyType`

### #3 [x] WeakPointConfig 接口冲突
- **文件**: `src/data/LevelConfigs.ts:48-53`, `src/data/EnemyConfigs.ts:64-70`
- **问题**: 两个同名接口结构完全不同
- **修复**: `LevelConfigs.WeakPointConfig` 重命名为 `LevelWeakPointConfig`，`EnemyConfigs.WeakPointConfig` 重命名为 `EnemyConfigWeakPoint`

### #4 [x] EnemyAI 导入不存在的导出
- **文件**: `src/game/EnemyAI.ts:5`
- **问题**: `import { Enemy, EnemyState } from '@data/EnemyData'` 但 `data/index.ts` 未导出
- **修复**: 在 `data/index.ts` 中添加 `EnemyData` 模块的导出

### #5 [ ] EnemyAI 未集成到 GameScene
- **文件**: `src/game/EnemyAI.ts`, `src/scenes/GameScene.ts:848-860`
- **问题**: EnemyAI 类已定义但 GameScene 完全没有使用
- **修复**: 需后续集成（标记为后续任务，本次不修改 GameScene 核心逻辑）

### #6 [x] TimeManager setTimeout/setInterval 空壳实现
- **文件**: `src/core/TimeManager.ts:169-205`
- **问题**: 只返回 ID，不执行回调；clearTimeout/clearInterval 只打日志
- **修复**: 实现基于 update 的定时器队列

### #7 [x] as any 类型绕过 — WeaponLoader
- **文件**: `src/data/WeaponLoader.ts:46-47,67-68 等`
- **问题**: `type: 'RANGED' as any` 等绕过类型检查
- **修复**: 使用正确的枚举值 `WeaponType.RANGED` 等

### #8 [x] as any 类型绕过 — SynergySystem
- **文件**: `src/game/SynergySystem.ts:43-44,61-62 等`
- **问题**: `weaponType: 'RANGED' as any` 等
- **修复**: 使用正确的枚举值 `WeaponType.RANGED`、`SynergyEffectType.ATTACK_SPEED_BOOST` 等

### #9 [x] BootScene preload 使用 delayedCall 模拟加载
- **文件**: `src/scenes/BootScene.ts:15-25`
- **问题**: `preload()` 中用 `delayedCall` 模拟加载，Phaser preload 阶段行为不确定
- **修复**: 将加载完成逻辑移到 `create()` 中

### #10 [x] initGameConfig 是空方法
- **文件**: `src/scenes/BootScene.ts:73-76`
- **问题**: 方法体为空
- **修复**: 实现基础游戏配置初始化（音量、难度等从 localStorage 读取）

### #11 [x] SettingsUI 按键绑定功能是假的
- **文件**: `src/ui/SettingsUI.ts:410-416`
- **问题**: 点击按键后显示"按下键..."，2秒后恢复原值，没有实际监听键盘
- **修复**: 实现键盘监听捕获新按键

### #12 [x] SkillUI updateSkillData 是空方法
- **文件**: `src/ui/SkillUI.ts:211-214`
- **问题**: 方法体为空，技能 UI 永远显示硬编码数据
- **修复**: 实现从 SkillManager 获取真实数据并更新 UI

### #13 [x] SkillUI updateSkill 是空方法
- **文件**: `src/ui/SkillUI.ts:268-280`
- **问题**: 方法体为空
- **修复**: 实现根据 data 参数更新对应技能槽位的 UI 元素

### #14 [x] EquipmentUI 使用硬编码数据格式
- **文件**: `src/ui/EquipmentUI.ts:231-258`
- **问题**: 数据格式 `{name, attack, defense, agility}` 与 `WeaponData` 接口完全不同
- **修复**: 改为接收 `WeaponManager` 数据，使用 `WeaponData` 接口格式

### #15 [x] boundSkillIds 引用不存在的技能
- **文件**: `src/scenes/GameScene.ts:93`
- **问题**: `'rapid_fire'` 和 `'energy_burst'` 在 SkillManager 中不存在
- **修复**: 改为存在的技能 ID：`'laser_shot'`, `'blade_slash'`, `'laser_barrage'`

### #16 [x] getSkill 返回 null 但静默失败
- **文件**: `src/scenes/GameScene.ts:440-442`
- **问题**: 技能不存在时用 fallback 值静默失败
- **修复**: 添加日志警告，确保技能 ID 有效

---

## MEDIUM 严重度

### #17-#23 [ ] 核心系统未集成（GameManager/GameStateManager/SceneManager/InputManager/AudioManager/ResourceManager/UIManager）
- **问题**: 完整的系统架构已实现但 GameScene 未使用
- **修复**: 需后续系统性集成（本次不修改，标记为后续任务）

### #24-#28 [ ] 游戏系统未集成（WeaponLoader/WeaponManager/WeaponEnhancementManager/SkillEnhancementManager/PlayerManager）
- **问题**: 完整的装备/技能/玩家系统未在 GameScene 中使用
- **修复**: 需后续系统性集成

### #29 [ ] DebugTools 未使用
- **问题**: 完整的调试工具未在 GameScene 中创建
- **修复**: 需后续集成

### #30 [x] player 类型声明为 Sprite 但实际是 Circle
- **文件**: `src/scenes/GameScene.ts:34`
- **修复**: 将类型声明改为 `Phaser.GameObjects.Arc`

### #31 [x] playerGlow 类型为 GameObject
- **文件**: `src/scenes/GameScene.ts:35`
- **修复**: 将类型声明改为 `Phaser.GameObjects.Arc`

### #32-#33 [x] enemy/player fillColor 类型不安全
- **文件**: `src/scenes/GameScene.ts:944,1039`
- **修复**: 使用正确的 Arc 类型后自动解决

### #34-#35 [x] console.log/console.error 而非 logger
- **文件**: 多处
- **修复**: 统一替换为 logger 调用

### #36 [x] 敌人光晕内存泄漏
- **文件**: `src/scenes/GameScene.ts:803`
- **问题**: 光晕 Circle 不添加到 enemies 组，敌人销毁时光晕不清理
- **修复**: 将光晕存储在 enemy 的 data 中，销毁时一并清理

### #37 [x] 敌人属性硬编码
- **文件**: `src/scenes/GameScene.ts:791-799`
- **问题**: 未使用 LevelConfigs 中定义的 EnemyConfig 数据
- **修复**: 从 LevelConfigs 获取敌人配置并应用

### #38 [x] SynergySystem matchesSynergy 逻辑 bug
- **文件**: `src/game/SynergySystem.ts:172-192`
- **问题**: 同一把武器可以匹配多个 requirement
- **修复**: 匹配后从可用武器列表中移除已匹配的武器

### #39 [x] 终极技能跳过正常击杀流程
- **文件**: `src/scenes/GameScene.ts:462-469`
- **问题**: 直接销毁敌人，跳过连击/经验/爆炸效果
- **修复**: 改为对每个敌人造成伤害，走正常击杀流程

### #40 [x] W 技能效果与绑定技能不匹配
- **文件**: `src/scenes/GameScene.ts:456-458`
- **问题**: boundSkillIds[1] 是 'rapid_fire'（不存在），且护盾恢复逻辑不匹配
- **修复**: 随 boundSkillIds 修复一并解决

---

## LOW 严重度

### #41 [x] isSceneActive/isScenePaused 返回值类型不精确
- **文件**: `src/core/SceneManager.ts:200-201`
- **修复**: 添加显式 null 检查

### #42 [x] game/SceneManager 缺少 Phaser import
- **文件**: `src/game/SceneManager.ts:6`
- **修复**: 添加 `import Phaser from 'phaser'`

### #43 [x] ParticleSystem 'default' 纹理不存在
- **文件**: `src/game/ParticleSystem.ts:20`
- **修复**: 改用程序化生成粒子纹理

### #44 [x] player 用 add.circle 创建但赋值给 Sprite 类型
- **文件**: `src/scenes/GameScene.ts:236`
- **修复**: 随 #30 一并修复

### #45-#46 [x] EquipmentUI selectedSlot 不更新
- **文件**: `src/ui/EquipmentUI.ts:11,304-334`
- **修复**: 在 showEquipmentDetail 中更新 selectedSlot

### #47-#48 [x] W/E 键技能未绑定 + returnToMenuFromPause 未使用
- **文件**: `src/scenes/GameScene.ts:310-312,422-425`
- **修复**: 添加 W/E 键技能绑定，删除未使用方法

### #49 [x] getEnemiesForLevel 重复定义
- **文件**: `src/data/LevelConfigs.ts:488-499`, `src/data/EnemyConfigs.ts:261-280`
- **修复**: 删除 EnemyConfigs 中的重复函数

### #50 [x] loadingBar null 检查缺失
- **文件**: `src/main.ts:52`
- **修复**: 添加 null 检查

### #51 [x] enemySpawnTimer 赋值 null!
- **文件**: `src/scenes/GameScene.ts:1070`
- **修复**: 将类型声明改为可空类型

### #52 [ ] canEquip 永远返回 true
- **文件**: `src/game/WeaponSlot.ts:54-58`
- **问题**: 没有槽位类型限制
- **修复**: 需后续设计武器-槽位匹配规则

### #53 [x] getUnscaledDeltaTime 除以 timeScale 可能为 0
- **文件**: `src/core/TimeManager.ts:50`
- **修复**: 添加 timeScale === 0 的保护

### #54 [ ] menuButtons 类型不精确
- **文件**: `src/scenes/MenuScene.ts:11`
- **修复**: 低优先级，需后续优化

### #55 [x] HUDUI 技能名称硬编码
- **文件**: `src/ui/HUDUI.ts:194`
- **修复**: 改为从 SkillManager 获取真实技能名称

---

## 未集成系统清单（后续任务）

以下系统已完整实现但未在 GameScene 中集成，需要后续系统性工作：

| 系统 | 文件 | 状态 |
|------|------|------|
| GameManager | src/core/GameManager.ts | 未使用，main.ts 直接创建 Phaser.Game |
| GameStateManager | src/core/GameStateManager.ts | 未使用，场景切换直接用 Phaser API |
| core/SceneManager | src/core/SceneManager.ts | 未使用，未调用 initialize |
| InputManager | src/systems/InputManager.ts | 未使用，GameScene 直接用 keyboard API |
| AudioManager | src/systems/AudioManager.ts | 未使用，无音效播放 |
| ResourceManager | src/systems/ResourceManager.ts | 未使用，BootScene preload 为空 |
| UIManager | src/ui/UIManager.ts | 未使用，各 UI 自行管理 |
| WeaponLoader | src/data/WeaponLoader.ts | 未使用，EquipmentUI 用硬编码数据 |
| WeaponManager | src/game/WeaponManager.ts | 未使用，GameScene 无装备系统 |
| WeaponEnhancementManager | src/game/WeaponEnhancementManager.ts | 未使用 |
| SkillEnhancementManager | src/game/SkillEnhancementManager.ts | 未使用 |
| PlayerManager | src/game/PlayerManager.ts | 未使用，GameScene 用内联属性 |
| EnemyAI | src/game/EnemyAI.ts | 未使用，敌人用简单移动逻辑 |
| DebugTools | src/utils/DebugTools.ts | 未使用，GameScene 未创建实例 |

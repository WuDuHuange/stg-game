# 美术资源规格清单（Art Assets Manifest）

> 本文件是 M2「程序化美术生成 + 资源加载管线」的配套清单。
> 游戏运行时由 `src/data/AssetManifest.ts` 驱动加载：
> 只要把同名 PNG 放入对应路径，**重新启动游戏即自动替换程序化美术**，无需改动代码。

## 替换规则

1. 将图片放入 `assets/textures/` 目录，文件名与下表 `key` 一致（如 `player_ship.png`）。
2. Vite 会以 `assets/textures/<key>.png` 作为资源路径加载；加载成功后 `TextureFactory.resolve` 优先返回该纹理。
3. 缺省时游戏自动使用 `proc_<key>` 程序化兜底纹理，保证始终可玩。

## 纹理清单

| key | 路径 | 建议规格 | 说明 |
|-----|------|----------|------|
| `player_ship` | `assets/textures/player_ship.png` | 64×64，透明底 | 自机机体，主体朝上，视觉中心即机动中心；建议包含机翼/驾驶舱，主色红粉 |
| `enemy_light` | `assets/textures/enemy_light.png` | 48×48 | 轻型敌机（侦察艇），暖橙红色 |
| `enemy_heavy` | `assets/textures/enemy_heavy.png` | 56×56 | 重型敌机（装甲艇），橙黄色 |
| `enemy_elite` | `assets/textures/enemy_elite.png` | 56×56 | 精英敌机（带翼），紫色 |
| `enemy_boss` | `assets/textures/enemy_boss.png` | 96×96 | Boss 机体，深红紫 + 发光核心 |
| `bullet_player` | `assets/textures/bullet_player.png` | 16×32 | 自机弹，冷青/洋红（运行时按 Power 染色） |
| `bullet_enemy` | `assets/textures/bullet_enemy.png` | 32×32 | 敌弹基底（白色，运行时 tint 上色） |
| `pickup_power` | `assets/textures/pickup_power.png` | 24×24 | Power 道具，青色 |
| `pickup_bomb` | `assets/textures/pickup_bomb.png` | 24×24 | Bomb 道具，橙色 |
| `pickup_life` | `assets/textures/pickup_life.png` | 24×24 | 残机道具，粉色 |
| `pickup_score` | `assets/textures/pickup_score.png` | 24×24 | 分数道具，白色 |

## 程序化兜底（无需美术也能玩）

缺省时由 `src/game/TextureFactory.ts` 用 Graphics 绘制：

- 自机：尖头机体 + 双翼 + 白色驾驶舱（红粉主色）
- 敌机：light=扁圆形 / heavy=装甲矩形 / elite=三角带翼 / boss=大六边+紫核心
- 自机弹：冷色菱形
- 道具：深色圆底 + 彩色图标

## 视觉纪律（供美术参考）

- 敌弹一律暖色（橙/红/品红）；自机弹冷色（青/蓝/绿）；擦弹高亮金色——保证弹幕可读性，勿打破。
- 机娘主题关键词：**机翼、霓虹光带、细小机械线**；配色主红粉 + 冷青点缀。
- 后续「机娘立绘」属于选机界面资产，规格（尺寸/格式）待 DLC 阶段单独出清单。
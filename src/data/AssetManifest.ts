/**
 * 美术资源清单
 * 定义游戏所需贴图的 key、可替换路径与程序化回退 key。
 * 用户将同名 PNG 放入 `assets/textures/` 并触发加载后，资源加载管线会自动优先使用真实资源，
 * 缺失时回退到 TextureFactory 生成的程序化纹理，保证游戏始终可运行。
 */

export interface AssetSpec {
    key: string;            // 使用时获取的 key（如 'player_ship'）
    path: string;           // 外部资源路径（assets/textures/xxx.png）
    fallback: string;       // 程序化兜底纹理 key（'proc_' + key）
    desc: string;           // 规格说明（供美术替用参考）
}

export const TEXTURE_ASSETS: AssetSpec[] = [
    { key: 'player_ship', path: 'assets/textures/player_ship.png', fallback: 'proc_player_ship', desc: '自机机体，朝上，中心视为判定视觉，建议 64x64，透明底' },
    { key: 'enemy_light', path: 'assets/textures/enemy_light.png', fallback: 'proc_enemy_light', desc: '轻型敌机（侦察艇），建议 48x48' },
    { key: 'enemy_heavy', path: 'assets/textures/enemy_heavy.png', fallback: 'proc_enemy_heavy', desc: '重型敌机（装甲艇），建议 56x56' },
    { key: 'enemy_elite', path: 'assets/textures/enemy_elite.png', fallback: 'proc_enemy_elite', desc: '精英敌机（带翼），建议 56x56' },
    { key: 'enemy_boss', path: 'assets/textures/enemy_boss.png', fallback: 'proc_enemy_boss', desc: 'Boss 机体（含核心发光），建议 96x96' },
    { key: 'bullet_player', path: 'assets/textures/bullet_player.png', fallback: 'proc_bullet_player', desc: '自机弹，冷色发光，建议 16x32' },
    { key: 'bullet_enemy', path: 'assets/textures/bullet_enemy.png', fallback: 'proc_bullet_enemy', desc: '敌弹（剂扁圆），建议 32x32' },
    { key: 'pickup_power', path: 'assets/textures/pickup_power.png', fallback: 'proc_pickup_power', desc: 'Power 道具（青），建议 24x24' },
    { key: 'pickup_bomb', path: 'assets/textures/pickup_bomb.png', fallback: 'proc_pickup_bomb', desc: 'Bomb 道具（橙），建议 24x24' },
    { key: 'pickup_life', path: 'assets/textures/pickup_life.png', fallback: 'proc_pickup_life', desc: '残机道具（粉），建议 24x24' },
    { key: 'pickup_score', path: 'assets/textures/pickup_score.png', fallback: 'proc_pickup_score', desc: '分数道具（白），建议 24x24' }
];

export function getAssetSpec(key: string): AssetSpec | undefined {
    return TEXTURE_ASSETS.find(a => a.key === key);
}
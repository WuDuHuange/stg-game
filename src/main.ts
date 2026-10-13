/**
 * STG机娘游戏 - 主入口文件
 */

import './styles/main.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { BGMPlayer } from './systems/BGMPlayer';
import { SfxAccent } from './systems/SfxAccent';
import { audioManager } from './systems/AudioManager';

/**
 * 游戏配置
 */
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    }
};

class STGGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}

const bgm = BGMPlayer.getInstance();
const accent = SfxAccent.getInstance();
let bgmTrack = '';
let bgmBusy = false;
let bgmVol = -1;
let accentVol = -1;
let sfxPatched = false;

function readVolumes(): { master: number; music: number; sfx: number } {
    try {
        const raw = localStorage.getItem('stg_settings');
        if (raw) {
            const a = (JSON.parse(raw) || {}).audio || {};
            const norm = (x: any, d: number) => (typeof x === 'number' ? (x > 1 ? x / 100 : x) : d);
            return {
                master: norm(a.masterVolume, 0.8),
                music: norm(a.musicVolume, 0.7),
                sfx: norm(a.sfxVolume, 0.9)
            };
        }
    } catch { /* ignore */ }
    return { master: 0.8, music: 0.7, sfx: 0.9 };
}

function activeScene(game: Phaser.Game): Phaser.Scene | null {
    try {
        const scenes = game.scene.getScenes(true);
        for (let i = 0; i < scenes.length; i++) {
            if (scenes[i].scene.isActive()) return scenes[i];
        }
    } catch { /* ignore */ }
    return null;
}

/**
 * 包装 AudioManager.playProceduralSFX：保留程序化音效，叠加第三方音色强调音
 */
function patchSfx(): void {
    if (sfxPatched) return;
    sfxPatched = true;
    const orig = audioManager.playProceduralSFX.bind(audioManager);
    (audioManager as any).playProceduralSFX = (type: string) => {
        orig(type as any);
        accent.play(type);
    };
}

async function pollAudio(game: Phaser.Game): Promise<void> {
    const v = readVolumes();
    const musicVol = v.master * v.music;
    if (musicVol !== bgmVol) { bgm.setVolume(musicVol); bgmVol = musicVol; }
    const sfxVol = v.master * v.sfx;
    if (sfxVol !== accentVol) { accent.setVolume(sfxVol); accentVol = sfxVol; }

    const scene = activeScene(game);
    if (!scene) return;

    const sm = scene.sound as Phaser.Sound.WebAudioSoundManager;
    const ctx = sm && sm.context ? sm.context : null;
    if (!ctx) return;
    const dest = sm.destination || ctx.destination;

    accent.ensure(ctx, dest);

    const key = scene.scene.key;
    let target = '';
    if (key === 'MenuScene') target = 'menu';
    else if (key === 'GameScene') {
        const boss = (scene as any).currentBoss;
        target = boss && boss.active ? 'boss' : 'battle';
    }
    if (!target || target === bgmTrack || bgmBusy) return;

    bgmBusy = true;
    try {
        await bgm.init(ctx, dest);
        bgm.setVolume(musicVol);
        if (await bgm.play(target)) bgmTrack = target;
    } catch { /* ignore: 回退程序化音效 */ } finally { bgmBusy = false; }
}

/**
 * 初始化游戏
 */
function initGame(): void {
    const loadingBar = document.getElementById('loading-bar') as HTMLElement;
    if (loadingBar) loadingBar.style.width = '30%';

    const game = new STGGame(config);
    patchSfx();

    game.events.once('ready', () => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
            }
        }, 1000);
        window.setInterval(() => { void pollAudio(game); }, 700);
    });
}

window.addEventListener('load', initGame);

export { initGame };
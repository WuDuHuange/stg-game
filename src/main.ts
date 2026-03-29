/**
 * STG机娘游戏 - 主入口文件
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

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

/**
 * 游戏主类
 */
class STGGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}

/**
 * 初始化游戏
 */
function initGame(): void {
    // 更新加载进度
    const loadingBar = document.getElementById('loading-bar') as HTMLElement;
    if (loadingBar) {
        loadingBar.style.width = '30%';
    }

    // 创建游戏实例
    const game = new STGGame(config);

    // 游戏加载完成后隐藏加载界面
    game.events.once('ready', () => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1000);
    });
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);

// 导出游戏实例供其他模块使用
export { initGame };

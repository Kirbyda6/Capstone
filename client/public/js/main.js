import { Game } from './game.js';

class Main extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // UI elements
        this.load.image('playButton', '../assets/playButton.png')
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add.text(screenCenterX, screenCenterY - 200, 'Galactic Gauntlet', { fontFamily: 'Courier', fontSize: '64px' }).setOrigin(0.5);

        let button = this.add.image(screenCenterX, screenCenterY, 'playButton').setInteractive({ cursor: 'pointer' });
        button.on('pointerdown', () => { this.scene.start('GameScene') });
    }

    update() {

    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'main',
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [Main, Game]
};

const main = new Phaser.Game(config);
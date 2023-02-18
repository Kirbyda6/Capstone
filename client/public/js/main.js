import { Game } from './game.js';

class Main extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // UI elements
        this.load.image('playButton', '../assets/playButton.png');
        this.load.image('gameTitle', '../assets/gameTitle.png');
        this.load.image('login', '../assets/login.png');
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add.image(screenCenterX, screenCenterY - 200, 'gameTitle').setOrigin(0.5);

        this.playButton = this.add.image(screenCenterX, screenCenterY, 'playButton').setInteractive({ cursor: 'pointer' });
        this.loginButton = this.add.image(screenCenterX, screenCenterY + 100, 'login').setInteractive({ cursor: 'pointer' });
        this.loginButton.setTintFill(0xffffff);

        this.playButton.on('pointerdown', () => { this.scene.start('GameScene') });
        this.loginButton.on('pointerdown', () => {
            const url = new URL('http://localhost:9000/');
            window.open(url, '_self')
        });
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
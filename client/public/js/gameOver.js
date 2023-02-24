export class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('mainMenuButton', 'assets/mainMenuButton.png');
        this.load.audio('gameOverMusic', 'assets/audio/gameOver.ogg');
    }

    create() {
        this.gameOverMusic = this.sound.add('gameOverMusic', { volume: 0.25, loop: false });
        this.gameOverMusic.play();

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add.text(screenCenterX, screenCenterY - 200, 'Game Over', { fontFamily: 'SpaceFont', fontSize: '82px' }).setOrigin(0.5);
        this.add.text(screenCenterX, screenCenterY - 100, 'You were eliminated!', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);

        this.mainMenuButton = this.add.image(screenCenterX, screenCenterY, 'mainMenuButton').setInteractive({ cursor: 'pointer' });
        this.mainMenuButton.on('pointerdown', () => {
            this.gameOverMusic.stop();
            this.scene.stop();
            this.scene.start('MainScene', { music: false });
        });

    }

    update() {

    }
}

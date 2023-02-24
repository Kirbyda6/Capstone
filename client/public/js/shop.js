export class Shop extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    init(data) {
        this.username = data.username;
        this.musicPlaying = data.music;
    }

    preload() {
        this.load.image('mainMenuButton', 'assets/mainMenuButton.png');
        this.load.image('upgradeShop', 'assets/upgradeShop.png');
    }

    create() {
        const text = this.add.text(
            this.cameras.main.width - 5,
            5,
            '',
            { font: '32px Courier', fill: '#ffffff', rtl: 'true' }
        );
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add.image(screenCenterX, screenCenterY - 300, 'upgradeShop').setOrigin(0.5);

        this.mainMenuButton = this.add.image(screenCenterX, screenCenterY + 300, 'mainMenuButton').setInteractive({ cursor: 'pointer' });
        this.mainMenuButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MainScene', { music: this.musicPlaying });
        });
        text.setText(this.username);
    }

    update() {

    }
}
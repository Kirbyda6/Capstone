export class Shop extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    init(data) {
        this.username = data.username;
        this.musicPlaying = data.music;
        this.currShipSelection = data.currShipSelection;
    }

    preload() {
        this.load.image('mainMenuButton', 'assets/mainMenuButton.png');
        this.load.image('healthIcon', 'assets/healthIcon.png');
        this.load.image('shieldIcon', 'assets/shieldIcon.png');
        this.load.image('speedIcon', 'assets/speedIcon.png');
    }

    create() {
        const text = this.add.text(
            this.cameras.main.width - 5,
            5,
            '',
            { fontFamily: 'SpaceFont', fontSize: '32px', rtl: 'true' }
        );
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add.text(screenCenterX, screenCenterY - 300, 'Upgrade Shop', { fontFamily: 'SpaceFont', fontSize: '56px' }).setOrigin(0.5);

        // this.add.image(screenCenterX, screenCenterY - 300, 'upgradeShop').setOrigin(0.5);

        this.add.image(screenCenterX - 300, screenCenterY - 150, 'healthIcon').setOrigin(0.5).setScale(.5);
        this.add.text(screenCenterX - 160, screenCenterY - 150, ' Health', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);

        this.add.image(screenCenterX - 300, screenCenterY, 'shieldIcon').setOrigin(0.5).setScale(.5);
        this.add.text(screenCenterX - 160, screenCenterY, 'Shield', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);

        this.add.image(screenCenterX - 300, screenCenterY + 150, 'speedIcon').setOrigin(0.5).setScale(.5);
        this.add.text(screenCenterX - 160, screenCenterY + 150, 'Speed', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);

        this.mainMenuButton = this.add.image(screenCenterX, screenCenterY + 300, 'mainMenuButton').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
        this.mainMenuButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MainScene', { music: this.musicPlaying, currShipSelection: this.currShipSelection });
        });
        text.setText(this.username);
    }

    update() {

    }
}
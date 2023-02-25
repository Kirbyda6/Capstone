export class Shop extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    init(data) {
        this.username = data.username;
        this.musicPlaying = data.music;
        this.currShipSelection = data.currShipSelection;
        this.player = data.player;
    }

    preload() {
        this.load.image('mainMenuButton', 'assets/mainMenuButton.png');
        this.load.image('healthIcon', 'assets/healthIcon.png');
        this.load.image('shieldIcon', 'assets/shieldIcon.png');
        this.load.image('speedIcon', 'assets/speedIcon.png');
        this.load.image('bg', 'assets/bg.png');
        this.load.image('upgradeButton', 'assets/upgradeButton.png');
    }

    create() {
        const text = this.add.text(
            this.cameras.main.width - 5,
            5,
            this.username,
            { fontFamily: 'SpaceFont', fontSize: '32px', rtl: 'true' }
        ).setDepth(1);

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0);
        this.add.text(screenCenterX, screenCenterY - 300, 'Upgrade Shop', { fontFamily: 'SpaceFont', fontSize: '56px' }).setOrigin(0.5);

        this.player.getPlayer(this.player).then((playerInfo) => {
            this.add.text(screenCenterX, screenCenterY - 230, `Available Currency: ${playerInfo.currency}`, { fontFamily: 'SpaceFont', fontSize: '20px' }).setOrigin(0.5);

            this.add.image(screenCenterX - 300, screenCenterY - 130, 'healthIcon').setOrigin(0.5).setScale(.5);
            this.add.text(screenCenterX - 160, screenCenterY - 130, ' Health', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            this.healthLevel = this.add.text(screenCenterX + 75, screenCenterY - 130, `Level ${playerInfo.health}`, { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            if (playerInfo.health <= 10) {
                this.add.image(screenCenterX + 300, screenCenterY - 130, 'upgradeButton').setOrigin(0.5).setScale(.5).setInteractive({ cursor: 'pointer' })
                    .on('pointerdown', () => {
                        console.log('this will upgrade health')
                    });
            }
            else {
                this.add.text(screenCenterX + 300, screenCenterY - 130, 'Max', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            }

            this.add.image(screenCenterX - 300, screenCenterY, 'shieldIcon').setOrigin(0.5).setScale(.5);
            this.add.text(screenCenterX - 160, screenCenterY, 'Shield', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            this.shieldLevel = this.add.text(screenCenterX + 75, screenCenterY, `Level ${playerInfo.shields}`, { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            if (playerInfo.shields <= 10) {
                this.add.image(screenCenterX + 300, screenCenterY, 'upgradeButton').setOrigin(0.5).setScale(.5).setInteractive({ cursor: 'pointer' })
                    .on('pointerdown', () => {
                        console.log('this will upgrade shield')
                    });
            }
            else {
                this.add.text(screenCenterX + 300, screenCenterY, 'Max', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            }

            this.add.image(screenCenterX - 300, screenCenterY + 130, 'speedIcon').setOrigin(0.5).setScale(.5);
            this.add.text(screenCenterX - 160, screenCenterY + 130, 'Speed', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            this.speedLevel = this.add.text(screenCenterX + 75, screenCenterY + 130, `Level ${playerInfo.speed}`, { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            if (playerInfo.speed <= 10) {
                this.add.image(screenCenterX + 300, screenCenterY + 130, 'upgradeButton').setOrigin(0.5).setScale(.5).setInteractive({ cursor: 'pointer' })
                    .on('pointerdown', () => {
                        console.log('this will upgrade speed')
                    });
            }
            else {
                this.add.text(screenCenterX + 300, screenCenterY + 130, 'Max', { fontFamily: 'SpaceFont', fontSize: '32px' }).setOrigin(0.5);
            }
        })

        this.mainMenuButton = this.add.image(screenCenterX, screenCenterY + 300, 'mainMenuButton').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
        this.mainMenuButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MainScene', { music: this.musicPlaying, currShipSelection: this.currShipSelection });
        });
    }

    update() {

    }
}
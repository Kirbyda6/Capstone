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
        this.load.image('blankButton', 'assets/blankButton.png');
    }

    create() {
        const text = this.add.text(
            this.cameras.main.width - 5,
            5,
            this.username,
            { fontFamily: 'SpaceFont', fontSize: '28px', rtl: 'true' }
        ).setDepth(1);

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0);
        this.add.text(screenCenterX, screenCenterY - 300, 'Upgrade Shop', { fontFamily: 'SpaceFont', fontSize: '56px' }).setOrigin(0.5);

        this.add.image(screenCenterX - 300, screenCenterY - 130, 'healthIcon').setOrigin(0.5).setScale(.5);
        this.add.text(screenCenterX - 160, screenCenterY - 130, ' Health', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
        this.add.image(screenCenterX - 300, screenCenterY, 'shieldIcon').setOrigin(0.5).setScale(.5);
        this.add.text(screenCenterX - 160, screenCenterY, 'Shield', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
        this.add.image(screenCenterX - 300, screenCenterY + 130, 'speedIcon').setOrigin(0.5).setScale(.5);
        this.add.text(screenCenterX - 160, screenCenterY + 130, 'Speed', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);

        this.player.getPlayer(this.player).then((playerInfo) => {
            this.currency = this.add.text(screenCenterX, screenCenterY - 230, `Available Currency: $${playerInfo.currency}`, { fontFamily: 'SpaceFont', fontSize: '20px' }).setOrigin(0.5);

            this.healthLevel = this.add.text(screenCenterX + 60, screenCenterY - 130, `Level ${playerInfo.health}`, { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
            if (playerInfo.health < 10) {
                this.healthUpgrade = this.add.container();
                this.healthCost = this.add.text(screenCenterX + 275, screenCenterY - 130, `$${playerInfo.health * 25}`, { fontFamily: 'SpaceFont', fontSize: '20px' }).setOrigin(0.5);
                this.healthUpgradeButton = this.add.image(screenCenterX + 275, screenCenterY - 130, 'blankButton').setOrigin(0.5).setScale(.5).setInteractive({ cursor: 'pointer' })
                    .on('pointerdown', () => {
                        this.player.updateHealth(this.player).then((result) => {
                            this.currency.setText(`Available Currency: $${result.currency}`)
                            this.healthLevel.setText(`Level ${result.health}`);
                            this.healthCost.setText(`$${result.health * 25}`);
                            if (result.health === 10) {
                                this.healthUpgrade.remove(this.healthCost, true);
                                this.healthUpgrade.remove(this.healthUpgradeButton, true);
                                this.add.text(screenCenterX + 275, screenCenterY - 130, 'Max', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
                            }
                        });
                    });
                this.healthUpgrade.add(this.healthUpgradeButton);
                this.healthUpgrade.add(this.healthCost);
            } else {
                this.add.text(screenCenterX + 275, screenCenterY - 130, 'Max', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
            }

            this.shieldLevel = this.add.text(screenCenterX + 60, screenCenterY, `Level ${playerInfo.shields}`, { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
            if (playerInfo.shields < 10) {
                this.shieldsUpgrade = this.add.container();
                this.shieldsCost = this.add.text(screenCenterX + 275, screenCenterY, `$${playerInfo.shields * 25}`, { fontFamily: 'SpaceFont', fontSize: '20px' }).setOrigin(0.5);
                this.shieldsUpgradeButton = this.add.image(screenCenterX + 275, screenCenterY, 'blankButton').setOrigin(0.5).setScale(.5).setInteractive({ cursor: 'pointer' })
                    .on('pointerdown', () => {
                        this.player.updateShields(this.player).then((result) => {
                            this.currency.setText(`Available Currency: $${result.currency}`)
                            this.shieldLevel.setText(`Level ${result.shields}`);
                            this.shieldsCost.setText(`$${result.shields * 25}`);
                            if (result.shields === 10) {
                                this.shieldsUpgrade.remove(this.shieldsCost, true);
                                this.shieldsUpgrade.remove(this.shieldsUpgradeButton, true);
                                this.add.text(screenCenterX + 275, screenCenterY, 'Max', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
                            }
                        });
                    });
                this.shieldsUpgrade.add(this.shieldsUpgradeButton);
                this.shieldsUpgrade.add(this.shieldsCost);
            } else {
                this.add.text(screenCenterX + 275, screenCenterY, 'Max', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
            }

            this.speedLevel = this.add.text(screenCenterX + 60, screenCenterY + 130, `Level ${playerInfo.speed}`, { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
            if (playerInfo.speed < 10) {
                this.speedUpgrade = this.add.container();
                this.speedCost = this.add.text(screenCenterX + 275, screenCenterY + 130, `$${playerInfo.speed * 25}`, { fontFamily: 'SpaceFont', fontSize: '20px' }).setOrigin(0.5);
                this.speedUpgradeButton = this.add.image(screenCenterX + 275, screenCenterY + 130, 'blankButton').setOrigin(0.5).setScale(.5).setInteractive({ cursor: 'pointer' })
                    .on('pointerdown', () => {
                        this.player.updateSpeed(this.player).then((result) => {
                            this.currency.setText(`Available Currency: $${result.currency}`)
                            this.speedLevel.setText(`Level ${result.speed}`);
                            this.speedCost.setText(`$${result.speed * 25}`);
                            if (result.speed === 10) {
                                this.speedUpgrade.remove(this.speedCost, true);
                                this.speedUpgrade.remove(this.speedUpgradeButton, true);
                                this.add.text(screenCenterX + 275, screenCenterY + 130, 'Max', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
                            }
                        });
                    });
                this.speedUpgrade.add(this.speedUpgradeButton);
                this.speedUpgrade.add(this.speedCost);
            } else {
                this.add.text(screenCenterX + 275, screenCenterY + 130, 'Max', { fontFamily: 'SpaceFont', fontSize: '28px' }).setOrigin(0.5);
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
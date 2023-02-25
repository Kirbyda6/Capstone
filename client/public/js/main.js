import { Game } from './game.js';
import { GameOver } from './gameOver.js';
import { Shop } from './shop.js';
import { Player } from './player.js';

export function parseCookie() {
    const playerData = {};

    document.cookie.split('; ').forEach((cookie) => {
        let data = cookie.split('=');
        playerData[data[0]] = data[1];
    });

    return playerData;
}

class Main extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init(data) {
        this.musicPlaying = data.music;
        data.currShipSelection === undefined ? this.currShipSelection = 0 : this.currShipSelection = data.currShipSelection;
    }

    preload() {
        this.load.image('bg', 'assets/bg.png');
        // UI elements
        this.load.image('playButton', 'assets/playButton.png');
        this.load.image('upgradeButton', 'assets/upgradeButton.png');
        this.load.image('login', 'assets/loginButton.png');
        this.load.image('prevShip', 'assets/arrowLeft.png');
        this.load.image('nextShip', 'assets/arrowRight.png');
        // ship skins
        this.load.image('ship0', 'assets/ships/ship0.png');
        this.load.image('ship1', 'assets/ships/ship1.png');
        this.load.image('ship2', 'assets/ships/ship2.png');
        this.load.image('ship3', 'assets/ships/ship3.png');
        this.load.image('ship4', 'assets/ships/ship4.png');
        this.load.image('ship5', 'assets/ships/ship5.png');
        this.load.image('ship6', 'assets/ships/ship6.png');
        this.load.image('ship7', 'assets/ships/ship7.png');
        this.load.image('ship8', 'assets/ships/ship8.png');
        this.load.image('ship9', 'assets/ships/ship9.png');
        // audio
        this.load.audio('menuMusic', 'assets/audio/menuMusic.ogg');
        //html
        this.load.html('username', 'assets/html/username.html');
    }

    create() {
        this.player;
        this.menuMusic = this.sound.add('menuMusic', { volume: 0.25, loop: true });
        if (!this.musicPlaying) {
            this.menuMusic.play();
            this.musicPlaying = true;
        }

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0);

        this.add.text(screenCenterX, screenCenterY - 250, ['Galactic', 'Gauntlet'], { fontFamily: 'SpaceFont', fontSize: '82px', align: 'center' }).setOrigin(0.5);

        const playerData = parseCookie();
        if (playerData.playerID) {
            this.shipSkins = this.add.container();
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship0').setName('ship0').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship1').setName('ship1').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship2').setName('ship2').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship3').setName('ship3').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship4').setName('ship4').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship5').setName('ship5').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship6').setName('ship6').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship7').setName('ship7').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship8').setName('ship8').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.add(this.add.image(screenCenterX, screenCenterY, 'ship9').setName('ship9').setOrigin(0.5).setScale(1.5).setVisible(false));
            this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(true);

            this.prevShip = this.add.image(screenCenterX - 150, screenCenterY, 'prevShip').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
            this.nextShip = this.add.image(screenCenterX + 150, screenCenterY, 'nextShip').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);

            this.playButton = this.add.image(screenCenterX - 200, screenCenterY + 200, 'playButton').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
            this.upgradeButton = this.add.image(screenCenterX + 200, screenCenterY + 200, 'upgradeButton').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
            this.player = new Player(playerData.playerID, playerData.username, playerData.IDtoken);
            const text = this.add.text(
                this.cameras.main.width - 5,
                5,
                '',
                { fontFamily: 'SpaceFont', fontSize: '32px', rtl: 'true' }
            );

            if (!this.player.username) {
                const form = this.add.dom(screenCenterX, screenCenterY).createFromCache('username');
                form.setPerspective(800);

                form.addListener('click');

                form.on('click', (click) => {
                    if (click.target.name === 'submit') {
                        const username = form.getChildByName('username');
                        const confirm = form.getChildByName('confirm');
                        if (username.value && username.value === confirm.value) {
                            this.player.changeName(this.player, username.value)
                                .then((cookie) => {
                                    this.player.username = cookie.username;
                                    document.cookie = `username=${cookie.username}; max-age=3600; SameSite=Strict`;
                                    text.setText(username.value);
                                    form.removeListener('click');
                                    this.nextShip.on('pointerdown', () => {
                                        this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(false);
                                        if (this.currShipSelection < 9) {
                                            this.currShipSelection += 1;
                                        } else {
                                            this.currShipSelection = 0;
                                        }
                                        this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(true);
                                    });
                                    this.prevShip.on('pointerdown', () => {
                                        this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(false);
                                        if (this.currShipSelection > 0) {
                                            this.currShipSelection -= 1;
                                        } else {
                                            this.currShipSelection = 9;
                                        }
                                        this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(true);
                                    });
                                    this.playButton.on('pointerdown', () => {
                                        this.game.sound.stopAll();
                                        this.scene.stop();
                                        this.scene.start('GameScene', { shipSkin: this.currShipSelection });
                                    });
                                    this.upgradeButton.on('pointerdown', () => {
                                        this.scene.stop();
                                        this.scene.start('ShopScene', {
                                            username: this.player.username,
                                            music: this.musicPlaying,
                                            currShipSelection: this.currShipSelection,
                                            player: this.player,
                                        });
                                    });
                                    this.tweens.add({ targets: form.rotate3d, x: 1, w: 90, duration: 2000, ease: 'Power3' });
                                    this.tweens.add({
                                        targets: form, scaleX: 2, scaleY: 2, y: this.cameras.main.height * 2, duration: 3000, ease: 'Power3',
                                        onComplete: () => {
                                            form.setVisible(false);
                                        }
                                    });
                                });
                        } else {
                            alert('Fields must be filled and match');
                        }
                    }
                });

                this.tweens.add({
                    targets: form,
                    y: 500,
                    duration: 3000,
                    ease: 'Power3'
                });
            } else {
                this.nextShip.on('pointerdown', () => {
                    this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(false);
                    if (this.currShipSelection < 9) {
                        this.currShipSelection += 1;
                    } else {
                        this.currShipSelection = 0;
                    }
                    this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(true);
                });
                this.prevShip.on('pointerdown', () => {
                    this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(false);
                    if (this.currShipSelection > 0) {
                        this.currShipSelection -= 1;
                    } else {
                        this.currShipSelection = 9;
                    }
                    this.shipSkins.getByName('ship' + this.currShipSelection).setVisible(true);
                });
                this.playButton.on('pointerdown', () => {
                    this.game.sound.stopAll();
                    this.scene.stop();
                    this.scene.start('GameScene', { shipSkin: this.currShipSelection });
                });
                this.upgradeButton.on('pointerdown', () => {
                    this.scene.stop();
                    this.scene.start('ShopScene', {
                        username: this.player.username,
                        music: this.musicPlaying,
                        currShipSelection: this.currShipSelection,
                        player: this.player,
                    });
                });
                text.setText(this.player.username);
            }
        } else {
            this.loginButton = this.add.image(screenCenterX, screenCenterY, 'login').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
            this.loginButton.on('pointerdown', () => {
                const url = new URL('http://localhost:9000/');
                window.open(url, '_self');
            });
        }
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
    dom: { createContainer: true },
    scene: [Main, Game, GameOver, Shop]
};

const main = new Phaser.Game(config);
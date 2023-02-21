import { Game } from './game.js';

function parseCookie() {
    const playerData = {};

    document.cookie.split('; ').forEach((cookie) => {
        let data = cookie.split('=');
        playerData[data[0]] = data[1];
    });

    return playerData;
}

class Player {
    constructor(id, username, jwt) {
        this.id = id;
        this.username = username;
        this.jwt = jwt;
    }
}

class Main extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.player;
    }

    preload() {
        // UI elements
        this.load.image('playButton', '../assets/playButton.png');
        this.load.image('gameTitle', '../assets/gameTitle.png');
        this.load.image('login', '../assets/login.png');
        this.load.html('username', '../assets/html/username.html');
        // audio
        this.load.audio('menuMusic', 'assets/menuMusic.ogg');
    }

    create() {
        this.menuMusic = this.sound.add('menuMusic', { volume: 0.25, loop: true });
        this.menuMusic.play();

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add.image(screenCenterX, screenCenterY - 200, 'gameTitle').setOrigin(0.5);

        const playerData = parseCookie();
        if (playerData.playerID) {
            this.playButton = this.add.image(screenCenterX, screenCenterY, 'playButton').setInteractive({ cursor: 'pointer' });
            this.player = new Player(playerData.playerID, playerData.username, playerData.IDtoken);
            const text = this.add.text(
                this.cameras.main.width - 5,
                5,
                '',
                { font: '32px Courier', fill: '#ffffff', rtl: 'true' }
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
                            fetch(`http://localhost:9000/player/${this.player.id}`, {
                                method:'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + this.player.jwt
                                },
                                body: JSON.stringify({
                                    username: username.value
                                })
                            }).then((response) => {
                                return response.json()
                            }).then((cookie) => {
                                document.cookie = `username=${cookie.username}; max-age=3600; SameSite=Strict`;
                                text.setText(username.value);
                                form.removeListener('click');
                                this.playButton.on('pointerdown', () => {
                                    this.scene.start('GameScene');
                                    this.menuMusic.stop();
                                });
                                this.tweens.add({ targets: form.rotate3d, x: 1, w: 90, duration: 2000, ease: 'Power3' });
                                this.tweens.add({ targets: form, scaleX: 2, scaleY: 2, y: this.cameras.main.height * 2, duration: 3000, ease: 'Power3',
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
                text.setText(this.player.username);
            }
        } else {
            this.loginButton = this.add.image(screenCenterX, screenCenterY, 'login').setInteractive({ cursor: 'pointer' });
            this.loginButton.setTintFill(0xffffff);
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
    scene: [Main, Game]
};

const main = new Phaser.Game(config);
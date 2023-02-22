import { Bullet } from './bullet.js';
import { Bullets } from './bullets.js';
import { parseCookie } from './main.js';
import { Player } from './player.js';

function addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setScale(0.7);
    self.ship.setRotation(playerInfo.rotation);
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
    self.ship.setCollideWorldBounds(true);
    self.ship.body.immovable = true;
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setScale(0.7);
    otherPlayer.socketId = playerInfo.socketId;
    self.otherPlayers.add(otherPlayer);
}

function addEnemy(self, enemy) {
    const currEnemy = self.add.sprite(enemy.x, enemy.y, 'alien').setOrigin(0.5, 0.5).setScale(0.3);
    currEnemy.enemyId = enemy.enemyId;
    currEnemy.targetX = enemy.target.x;
    currEnemy.targetY = enemy.target.y;
    self.aiEnemies.add(currEnemy);
    return currEnemy;
}

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // UI elements
        this.load.image('bg', 'assets/bg.jpg');
        this.load.image('scoreIcon', 'assets/scoreIcon.png');
        this.load.image('healthIcon', 'assets/healthIcon.png');
        this.load.image('shieldIcon', 'assets/shieldIcon.png');
        this.load.image('healthNode', 'assets/healthNode.png');
        this.load.image('shieldNode', 'assets/shieldNode.png');
        // game elements
        this.load.image('ship', 'assets/spaceShips_001.png');
        this.load.image('otherPlayer', 'assets/enemyBlack5.png');
        this.load.image('playerBullet', 'assets/purple_ball.png');
        this.load.image('enemyBullet', 'assets/purple_ball.png');
        this.load.image('alien', 'assets/alien.png');
        // audio
        this.load.audio('gameMusic', 'assets/gameMusic.ogg');
        this.load.audio('shootSound', 'assets/shoot.ogg');
        this.load.audio('alienSound', 'assets/alien.ogg');
    }

    create() {
        this.playerBullets;
        this.enemyBullets;
        this.ship;
        this.player;

        // init audio
        this.gameMusic = this.sound.add('gameMusic', { volume: 0.25, loop: true });
        this.gameMusic.play();
        this.shootSound = this.sound.add('shootSound', { volume: 0.5, loop: false });
        this.alienSound = this.sound.add('alienSound', { volume: 0.5, loop: false });

        // set camera and background
        const cams = this.cameras.main;
        cams.setBounds(0, 0, 3200, 2400);
        this.physics.world.bounds.width = 3200;
        this.physics.world.bounds.height = 2400;
        let background = this.add.image(0, 0, 'bg').setOrigin(0);

        const self = this;
        this.socket = io('http://localhost:9000');
        let cookies = parseCookie();
        this.player = new Player(cookies.playerID, cookies.username, cookies.IDtoken);

        // initialize the player's upgrades with the server
        this.socket.emit('initialize', this.player);

        // initialize the UI with player starting stats
        this.ui = this.add.container();
        this.socket.on('initUi', player => {
            // placeholder score
            this.score = 0;
            this.ui.add(this.add.image(10, 10, 'scoreIcon').setOrigin(0).setScale(0.4).setScrollFactor(0));
            this.ui.add(this.add.text(50, 10, this.score.toLocaleString('en-US'), { fontFamily: 'arial', fontSize: '32px' }).setScrollFactor(0));

            this.ui.add(this.add.image(10, 50, 'healthIcon').setOrigin(0).setScale(0.4).setScrollFactor(0));
            let pos = 50;
            for (let i = 0; i < player.health; i++) {
                this.ui.add(this.add.image(pos, 52.5, 'healthNode').setOrigin(0).setScale(0.5).setScrollFactor(0));
                pos += 15;
            }

            this.ui.add(this.add.image(10, 90, 'shieldIcon').setOrigin(0).setScale(0.4).setScrollFactor(0));
            pos = 50;
            for (let i = 0; i < player.shield; i++) {
                this.ui.add(this.add.image(pos, 92.5, 'shieldNode').setOrigin(0).setScale(0.5).setScrollFactor(0));
                pos += 15;
            }
        });

        this.otherPlayers = this.physics.add.group();

        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (players[id].socketId === self.socket.id) {
                    addPlayer(self, players[id]);
                    cams.startFollow(self.ship);
                } else {
                    addOtherPlayer(self, players[id]);
                }
            });
            if (this.ship) {
                this.playerBullets = new Bullets(this, 'playerBullet');
            }
            if (self.otherPlayers.getChildren()) {
                this.enemyBullets = new Bullets(this, 'enemyBullet');
            }
        });

        this.socket.on('newPlayer', (playerInfo) => {
            addOtherPlayer(self, playerInfo);
            let temp = {};
            this.aiEnemies.getChildren().forEach((enemy) => {
                temp[enemy.enemyId] = {
                    x: enemy.x,
                    y: enemy.y,
                }
            })
            this.socket.emit('updateEnemies', temp);
        });

        this.socket.on('playerDisconnecting', (id) => {
            if (id === this.socket.id) {
                this.socket.disconnect();
                this.ship = undefined;
                this.scene.stop();
                this.scene.start('MainScene');
            }
            self.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (id === otherPlayer.socketId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on('playerMoved', (playerInfo) => {
            self.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerInfo.socketId === otherPlayer.socketId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        this.socket.on('fired', (ship) => {
            if (ship.socketId !== this.socket.id) {
                self.enemyBullets.fireBullet(ship);
                this.shootSound.play();
            } else {
                self.playerBullets.fireBullet(ship);
                this.shootSound.play();
            }
        });

        this.aiEnemies = this.physics.add.group();

        this.socket.on('newEnemy', (enemy) => {
            let newEnemy = addEnemy(self, enemy);
            let target = new Phaser.Math.Vector2(enemy.target.x, enemy.target.y)
            this.physics.moveToObject(newEnemy, target, 100);
        });

        this.socket.on('currentEnemies', (enemies) => {
            Object.keys(enemies).forEach((id) => {
                let currEnemy = addEnemy(self, enemies[id]);
                let target = new Phaser.Math.Vector2(enemies[id].target.x, enemies[id].target.y)
                this.physics.moveToObject(currEnemy, target, 100);
            });
        });

        this.socket.on('removeEnemy', (enemyId) => {
            this.aiEnemies.getChildren().forEach((enemy) => {
                if (enemyId === enemy.enemyId) {
                    enemy.destroy();
                }
            });
        });

        // keybinds
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.ship) {
            // handle ui overlap
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.ui.getBounds(), this.ship.getBounds())) {
                this.ui.setAlpha(0.2)
            }
            else {
                this.ui.setAlpha(1);
            }

            // emit player movement
            let x = this.ship.x;
            let y = this.ship.y;
            let r = this.ship.rotation;

            if (this.ship.oldPosition && (
                x !== this.ship.oldPosition.x ||
                y !== this.ship.oldPosition.y ||
                r !== this.ship.oldPosition.rotation)) {

                this.socket.emit('playerMovement', {
                    id: this.player.id,
                    x: this.ship.x,
                    y: this.ship.y,
                    rotation: this.ship.rotation
                });
            }

            // save old position data
            this.ship.oldPosition = {
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.rotation
            }

            if (this.cursors.left.isDown || this.keyA.isDown) {
                this.ship.setAngularVelocity(-150);
            } else if (this.cursors.right.isDown || this.keyD.isDown) {
                this.ship.setAngularVelocity(150);
            } else {
                this.ship.setAngularVelocity(0);
            }

            if (this.cursors.up.isDown || this.keyW.isDown) {
                this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
            } else {
                this.ship.setAcceleration(0);
            }

            if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.socket.emit('fire', this.ship);
            };

            this.physics.world.wrap(this.ship);
        }
    }
}

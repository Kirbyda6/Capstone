import { Bullet } from './bullet.js';
import { Bullets } from './bullets.js';
import { parseCookie } from './main.js';
import { Player } from './player.js';
import { GameOver } from './gameOver.js';

function addPlayer(self, playerInfo, shipSkin) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, shipSkin).setOrigin(0.5, 0.5).setScale(1);
    self.ship.setRotation(playerInfo.rotation);
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
    self.ship.setCollideWorldBounds(true);
    self.ship.setImmovable(true);
    self.ship.setDepth(1);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.shipSkin).setOrigin(0.5, 0.5).setScale(1).setDepth(1);
    otherPlayer.socketId = playerInfo.socketId;
    self.otherPlayers.add(otherPlayer);
}

function addEnemy(self, enemy) {
    const currEnemy = self.physics.add.image(enemy.x, enemy.y, 'alien').setOrigin(0.5, 0.5).setScale(0.3);
    currEnemy.enemyId = enemy.enemyId;
    currEnemy.targetX = enemy.target.x;
    currEnemy.targetY = enemy.target.y;
    self.aiEnemies.add(currEnemy);
    currEnemy.onWorldBounds = true;
    currEnemy.setCollideWorldBounds(true).setBounce(1);
    return currEnemy;
}

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.shipSkin = 'ship' + data.shipSkin;
    }

    preload() {
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
        // UI elements
        this.load.image('bg', 'assets/bg.jpg');
        this.load.image('scoreIcon', 'assets/scoreIcon.png');
        this.load.image('healthIcon', 'assets/healthIcon.png');
        this.load.image('shieldIcon', 'assets/shieldIcon.png');
        this.load.image('healthNode', 'assets/healthNode.png');
        this.load.image('shieldNode', 'assets/shieldNode.png');
        // game elements
        this.load.image('playerBullet', 'assets/bullet.png');
        this.load.image('enemyBullet', 'assets/bullet.png');
        this.load.image('alien', 'assets/alien.png');
        // audio
        this.load.audio('gameMusic', 'assets/audio/gameMusic.ogg');
        this.load.audio('shootSound', 'assets/audio/shoot.ogg');
        this.load.audio('alienSound', 'assets/audio/alien.ogg');
        this.load.audio('hit', 'assets/audio/hit.ogg');
        this.load.audio('explosion', 'assets/audio/explosion.ogg');
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
        this.hit = this.sound.add('hit', { volume: 0.5, loop: false });
        this.explosion = this.sound.add('explosion', { volume: 0.5, loop: false });

        // set camera and background
        const cams = this.cameras.main;
        cams.setBounds(0, 0, 3200, 2400);
        this.physics.world.setBounds(0, 0, 3200, 2400);
        let background = this.add.image(0, 0, 'bg').setOrigin(0);

        const self = this;
        this.socket = io('http://localhost:9000');
        let cookies = parseCookie();
        this.player = new Player(cookies.playerID, cookies.username, cookies.IDtoken);

        // initialize the player's upgrades with the server
        this.socket.emit('initialize', this.player, this.shipSkin);

        // initialize the UI with player starting stats
        this.uiZone = this.add.zone(cams.worldView.x, cams.worldView.y).setSize(300, 300);
        this.physics.world.enable(this.uiZone);
        this.uiZone.body.moves = true;
        this.ui = this.add.group();
        this.socket.on('initUi', player => {
            // placeholder score
            this.ui.add(this.add.image(10, 10, 'scoreIcon').setOrigin(0).setScale(0.2).setScrollFactor(0));
            this.ui.add(this.add.text(60, 10, player.score.toLocaleString('en-US'), { fontFamily: 'SpaceFont', fontSize: '38px' }).setName('score').setScrollFactor(0));

            this.ui.add(this.add.image(10, 50, 'shieldIcon').setOrigin(0).setScale(0.2).setScrollFactor(0));
            this.shieldNodes = this.add.group();
            let pos = 60;
            for (let i = 0; i < player.shield; i++) {
                this.shieldNodes.add(this.add.image(pos, 52.5, 'shieldNode').setOrigin(0).setScale(0.18).setScrollFactor(0));
                pos += 15;
            }
            this.ui.add(this.shieldNodes);

            this.ui.add(this.add.image(10, 90, 'healthIcon').setOrigin(0).setScale(0.2).setScrollFactor(0));
            this.healthNodes = this.add.group();
            pos = 60;
            for (let i = 0; i < player.health; i++) {
                this.healthNodes.add(this.add.image(pos, 92.5, 'healthNode').setOrigin(0).setScale(0.18).setScrollFactor(0));
                pos += 15;
            }
            this.ui.add(this.healthNodes);
        });

        this.otherPlayers = this.physics.add.group({
            immovable: true
        });
        this.physics.add.overlap(this.otherPlayers, this.uiZone);

        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (players[id].socketId === self.socket.id) {
                    addPlayer(self, players[id], this.shipSkin);
                    cams.startFollow(self.ship);
                } else {
                    addOtherPlayers(self, players[id]);
                }
            });
            if (this.ship) {
                this.playerBullets = new Bullets(this, 'playerBullet');
            }
            if (self.otherPlayers.getChildren()) {
                this.enemyBullets = new Bullets(this, 'enemyBullet');
            }
            this.physics.add.overlap(this.ship, this.uiZone);
            this.physics.add.collider(this.ship, this.aiEnemies, (ship, enemy) => {
                this.hit.play();
                this.socket.emit('damagePlayer', this.socket.id, 'enemy', enemy.enemyId);
            });
        });

        this.socket.on('newPlayer', (playerInfo) => {
            addOtherPlayers(self, playerInfo);
            let currentEnemies = {};
            this.aiEnemies.getChildren().forEach((enemy) => {
                currentEnemies[enemy.enemyId] = {
                    x: enemy.x,
                    y: enemy.y,
                }
            })
            this.socket.emit('updateEnemies', currentEnemies);
        });

        this.socket.on('playerDisconnecting', (id) => {
            if (id === this.socket.id) {
                this.explosion.play();
                this.socket.disconnect();
                this.ship = undefined;
                this.gameMusic.stop();
                this.scene.stop();
                this.scene.start('GameOverScene');
            }
            self.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (id === otherPlayer.socketId) {
                    this.explosion.play();
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
        this.physics.add.overlap(this.aiEnemies, this.uiZone);

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

        this.socket.on('adjustScore', (playerId, score) => {
            if (this.socket.id === playerId) {
                this.ui.getChildren().forEach((element) => {
                    if (element.name === 'score') {
                        element.text = score.toLocaleString('en-US');
                    }
                })
            }
        });

        this.socket.on('updateShield', (playerId, shield) => {
            if (this.socket.id === playerId) {
                this.shieldNodes.clear(true, true);
                let pos = 60;
                for (let i = 0; i < shield; i++) {
                    this.shieldNodes.add(this.add.image(pos, 52.5, 'shieldNode').setOrigin(0).setScale(0.18).setScrollFactor(0));
                    pos += 15;
                }
            }
        });

        this.socket.on('updateHealth', (playerId, health) => {
            if (this.socket.id === playerId) {
                this.healthNodes.clear(true, true);
                let pos = 60;
                for (let i = 0; i < health; i++) {
                    this.healthNodes.add(this.add.image(pos, 92.5, 'healthNode').setOrigin(0).setScale(0.18).setScrollFactor(0));
                    pos += 15;
                }
            }
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
            this.uiZone.setPosition(this.cameras.main.worldView.x, this.cameras.main.worldView.y);
            if (this.uiZone.body.touching.none) {
                this.ui.setAlpha(1);
                this.shieldNodes.setAlpha(1);
                this.healthNodes.setAlpha(1);
            }
            else {
                this.ui.setAlpha(0.3);
                this.shieldNodes.setAlpha(0.3);
                this.healthNodes.setAlpha(0.3);
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

import { Bullet } from './bullet.js';
import { Bullets } from './bullets.js';

function addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setScale(0.7);
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
    self.ship.setCollideWorldBounds(true);
    self.ship.body.immovable = true;
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setScale(0.7);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.playerBullets;
        this.enemyBullets;
        this.ship;
        this.player;
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
        // particles
        this.load.image('exhaust', 'assets/particles/exhaust.png');
    }

    create() {
        const cams = this.cameras.main;
        cams.setBounds(0, 0, 3200, 2400);

        this.physics.world.bounds.width = 3200;
        this.physics.world.bounds.height = 2400;

        let background = this.add.image(0, 0, 'bg').setOrigin(0);

        const self = this;
        this.socket = io('http://localhost:9000');

        // get player's upgrade level (will need to be replaced with a db query, from the player entity)
        // player upgrade level will be 0-5 for both health and shield
        this.player = {
            healthUpgrade: 3,
            shieldUpgrade: 1,
        }
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
                if (players[id].playerId === self.socket.id) {
                    addPlayer(self, players[id]);
                    cams.startFollow(self.ship);

                    // attach particle emitter to the ship
                    let exhaustParticles = this.add.particles('exhaust');
                    this.emitter = exhaustParticles.createEmitter({
                        quantity: 20,
                        speedX: { min: -50, max: 50 },
                        speedY: { min: -50, max: 50 },
                        accelerationX: 0,
                        accelerationY: 0,
                        lifespan: { min: 0, max: 250 },
                        alpha: { start: 0.5, end: 0, ease: 'Sine.easeIn' },
                        scale: { start: 0.05, end: 0.001 },
                        blendMode: 'ADD',
                        frequency: 15,
                        follow: this.ship,
                        tint: 0xF4511E,
                    });

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
        });

        this.socket.on('newPlayer', (playerInfo) => {
            addOtherPlayers(self, playerInfo);
        });

        this.socket.on('playerDisconnecting', (playerId) => {
            if (playerId === this.socket.id) {
                window.location.replace('http://localhost:8080');
            }
            self.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on('playerMoved', (playerInfo) => {
            self.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        this.socket.on('fired', (ship) => {
            if (ship.playerId !== this.socket.id) {
                self.enemyBullets.fireBullet(ship);
            } else {
                self.playerBullets.fireBullet(ship);
            }
        });

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

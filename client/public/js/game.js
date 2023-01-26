class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, game) {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        game.physics.velocityFromRotation(game.ship.rotation, 600, this.body.velocity);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= -32 || this.y >= window.innerHeight + 32 ||
            this.x <= -32 || this.x >= window.innerWidth + 32) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 50,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet(x, y, game) {
        let bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(x, y, game);
        }
    }
}

function addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(75, 60);
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

class Game extends Phaser.Scene {
    constructor () {
        super();

        this.bullets;
        this.ship;
    }

    preload() {
        this.load.image('ship', 'assets/spaceShips_001.png');
        this.load.image('otherPlayer', 'assets/enemyBlack5.png');
        this.load.image('bullet', 'assets/purple_ball.png');
    }

    create() {
        const self = this;
        this.socket = io();
        this.otherPlayers = this.physics.add.group();
        this.bullets = new Bullets(this);

        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (players[id].playerId === self.socket.id) {
                    addPlayer(self, players[id]);
                } else {
                    addOtherPlayers(self, players[id]);
                }
            });
        });

        this.socket.on('newPlayer', (playerInfo) => {
            addOtherPlayers(self, playerInfo);
        });

        this.socket.on('playerDisconnecting', (playerId) => {
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

        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.ship) {

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
            };

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
                this.bullets.fireBullet(this.ship.x, this.ship.y, this);
            };

            this.physics.world.wrap(this.ship);
        }
    }
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: window.innerWidth - 100,
    height: window.innerHeight - 100,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: Game
};

var game = new Phaser.Game(config);
export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        if (key === 'playerBullet') {
            this.scene.physics.add.collider(this.scene.otherPlayers, this, (bullet, otherPlayer) => {
                bullet.setActive(false).setVisible(false);
                this.scene.socket.emit('playerDied', otherPlayer.playerId);
            });
        } else if (key === 'enemyBullet') {
            this.scene.physics.add.collider(this.scene.ship, this, (ship, bullet) => {
                this.scene.socket.emit('playerDied', this.scene.socket.id);
                bullet.setActive(false).setVisible(false);
            });
        }
    }

    fire(ship) {
        this.body.reset(ship.x, ship.y);

        this.setActive(true);
        this.setVisible(true);

        this.scene.physics.velocityFromRotation(ship.rotation + 1.6, 600, this.body.velocity);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= -32 || this.y >= 2400 + 32 ||
            this.x <= -32 || this.x >= 3200 + 32) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}
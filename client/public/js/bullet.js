export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        if (key === 'playerBullet') {
            this.scene.physics.add.collider(this.scene.otherPlayers, this, (bullet, otherPlayer) => {
                this.scene.socket.emit('damagePlayer', otherPlayer.socketId, 'player', this.scene.socket.id);
                this.scene.hit.play();
                bullet.setActive(false).setVisible(false);
                bullet.body.enable = false;
            });
            this.scene.physics.add.collider(this.scene.aiEnemies, this, (bullet, enemy) => {
                this.scene.socket.emit('enemyDied', enemy.enemyId, this.scene.socket.id);
                this.scene.alienSound.play();
                enemy.destroy();
                bullet.setActive(false).setVisible(false);
                bullet.body.enable = false;
            });
        } else if (key === 'enemyBullet') {
            this.scene.physics.add.collider(this.scene.ship, this, (ship, bullet) => {
                this.scene.hit.play();
                bullet.setActive(false).setVisible(false);
                bullet.body.enable = false;
            });
            this.scene.physics.add.collider(this.scene.aiEnemies, this, (bullet, enemy) => {
                this.scene.alienSound.play();
                enemy.destroy();
                bullet.setActive(false).setVisible(false);
                bullet.body.enable = false;
            });
        }
    }

    fire(ship) {
        this.body.reset(ship.x, ship.y);
        this.body.enable = true;
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
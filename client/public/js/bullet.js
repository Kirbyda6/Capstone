class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y) {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.scene.physics.velocityFromRotation(this.scene.ship.rotation + 1.6, 600, this.body.velocity);

        this.scene.socket.emit('fire', {x: this.x, y: this.y, v: this.body.velocity})
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
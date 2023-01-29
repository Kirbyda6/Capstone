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
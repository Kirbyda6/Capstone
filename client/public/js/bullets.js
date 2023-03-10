import { Bullet } from './bullet.js';

export class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(scene, asset) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 200,
            key: asset,
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet(ship) {
        let bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(ship);
        }
    }
}
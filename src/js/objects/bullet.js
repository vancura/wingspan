/**
 * Bullet.
 */
(function () {
    "use strict";


    /**
     * Bullet constructor.
     * @param game Game reference
     * @param planeIdx Plane index
     * @constructor
     */
    Bullet = function (game, planeIdx) {
        Phaser.Sprite.call(this, game, 0, 0, "game", "bullet.png");

        this.isInited = false;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
        this.name = "bullet";
        this.planeIdx = planeIdx;
    };


    Bullet.prototype = Object.create(Phaser.Sprite.prototype);
    Bullet.prototype.constructor = Bullet;


    Bullet.prototype.init = function () {
        this.anchor.set(0.5);

        this.isInited = true;
    };


    /**
     * Fire the bullet.
     * @param x X position
     * @param y Y position
     * @param angle Angle in degrees
     * @param speed Speed
     */
    Bullet.prototype.fire = function (x, y, angle, speed) {
        if (this.isInited) {
            this.reset(x, y);
            this.scale.set(1);

            this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

            this.angle = angle;
            this.lifespan = Settings.PLANE_BULLET_LIFESPAN;

            this.body.gravity.set(0, 100);
        }
    };


}());

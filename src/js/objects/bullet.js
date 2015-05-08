/**
 * Bullet.
 */
(function () {
    "use strict";


    /**
     * Bullet constructor.
     * @param game Game reference
     * @constructor
     */
    Bullet = function (game) {
        Phaser.Sprite.call(this, game, 0, 0, "game", "bullet.png");

        this.anchor.set(0.5);

        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
        this.tracking = false;
        this.scaleSpeed = 0;
    };


    Bullet.prototype = Object.create(Phaser.Sprite.prototype);
    Bullet.prototype.constructor = Bullet;


    /**
     * Fire the bullet.
     * @param x X position
     * @param y Y position
     * @param angle Angle in degrees
     * @param speed Speed
     */
    Bullet.prototype.fire = function (x, y, angle, speed) {
        this.reset(x, y);
        this.scale.set(1);

        this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

        this.angle = angle;
        this.lifespan = 700;

        this.body.gravity.set(0, 100);
    };


    // PRIVATE
    // -------


    /**
     * Update.
     */
    Bullet.prototype.update = function () {
        if (this.tracking) {
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }

        if (this.scaleSpeed > 0) {
            this.scale.x += this.scaleSpeed;
            this.scale.y += this.scaleSpeed;
        }
    };


}());

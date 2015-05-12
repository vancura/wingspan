/**
 * Weapon.
 */
(function () {
    "use strict";


    /**
     * Weapon constructor.
     * @param game Game reference
     * @constructor
     */
    Weapon = function (game) {
        Phaser.Group.call(this, game, game.world, "weapon", false, true, Phaser.Physics.ARCADE);

        this.isInited = false;
        this.nextFire = 0;
        this.bulletSpeed = Settings.PLANE_BULLET_SPEED;
        this.fireRate = Settings.PLANE_BULLET_FIRE_RATE;
        this.flip = false;
    };


    Weapon.prototype = Object.create(Phaser.Group.prototype);
    Weapon.prototype.constructor = Weapon;


    Weapon.prototype.init = function () {
        // prepare bullets
        for (var i = 0; i < 64 * 4; i++) {
            var bullet = new Bullet(game);

            this.add(bullet, true);

            bullet.init();
        }

        // sound
        if (Settings.IS_SOUND_ENABLED) {
            this.fx = this.game.add.audio("gunshot");
        }

        this.isInited = true;
    };


    /**
     * Fire with the weapon.
     * @param source Sprite source
     */
    Weapon.prototype.fire = function (source) {
        if (this.isInited && this.game.time.time >= game.rnd.between(this.nextFire - 10, this.nextFire)) {
            var d = this.flip ? game.rnd.between(-7, -3) : game.rnd.between(3, 7);
            this.flip = !this.flip;

            var r = source.rotation;
            var x = Math.cos(r) * d;
            var y = Math.sin(r) * d;

            this.getFirstExists(false).fire(source.x + x, source.y + y, source.angle - 90, this.bulletSpeed, 0, 0);

            if (Settings.IS_SOUND_ENABLED) {
                this.fx.play("", 0, this.game.rnd.between(0.75, 1.0));
            }

            this.nextFire = this.game.time.time + this.game.rnd.between(this.fireRate * 0.99, this.fireRate * 1.01);
        }
    };


}());

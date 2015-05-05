/**
 * Shots.
 */
(function () {
    "use strict";


    Weapon = function (game) {
        Phaser.Group.call(this, game, game.world, "Shot", false, true, Phaser.Physics.ARCADE);

        this.nextFire = 0;
        this.bulletSpeed = 250;
        this.fireRate = 50;
        this.flip = false;

        for (var i = 0; i < 64 * 4; i++) {
            this.add(new Bullet(game), true);
        }

        return this;
    };


    Weapon.prototype = Object.create(Phaser.Group.prototype);
    Weapon.prototype.constructor = Weapon;


    Weapon.prototype.fire = function (source) {
        if (this.game.time.time >= game.rnd.between(this.nextFire - 10, this.nextFire)) {
            var d = this.flip ? game.rnd.between(-7, -3) : game.rnd.between(3, 7);
            this.flip = !this.flip;

            var r = source.rotation;
            var x = Math.cos(r) * d;
            var y = Math.sin(r) * d;

            this.getFirstExists(false).fire(source.x + x, source.y + y, source.angle - 90, this.bulletSpeed, 0, 0);

            this.nextFire = this.game.time.time + this.fireRate;
        }
    };


}());


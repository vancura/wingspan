/**
 * Ground Front.
 */
(function () {
    "use strict";


    /**
     * Ground front constructor.
     * @param game Game reference
     * @constructor
     */
    GroundFront = function (game) {
        Phaser.Group.call(this, game, game.world, "groundFront");

        this.isInited = false;
    };


    GroundFront.prototype = Object.create(Phaser.Group.prototype);
    GroundFront.prototype.constructor = GroundFront;


    GroundFront.prototype.init = function () {
        this.groundGroup1 = new Phaser.Group(this.game, 0, 0);

        this.groundGroup1.name = "groundGroup1";

        this.add(this.groundGroup1);

        var i = 0;
        while (i < Math.ceil(this.game.world.width / 254) + 3) {
            var l = this.groundGroup1.create(i * 254, 0, "game", "ground/g" + (this.game.rnd.integerInRange(1, 6)) + ".png");
            l.tint = 0x000000;
            i++;
        }

        this.groundGroup1.y = this.game.world.height - 100;

        this.isInited = true;
    };


    /**
     * Scroll to a position.
     * @param p New position in %
     */
    GroundFront.prototype.scroll = function (p) {
        this.groundGroup1.x = (this.game.world.width - this.groundGroup1.width) * p;
    };


}());

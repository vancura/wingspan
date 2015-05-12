/**
 * Ground Back.
 */
(function () {
    "use strict";


    /**
     * Ground back constructor.
     * @param game Game reference
     * @constructor
     */
    GroundBack = function (game) {
        Phaser.Group.call(this, game, game.world, "groundBack");

        this.isInited = false;
    };


    GroundBack.prototype = Object.create(Phaser.Group.prototype);
    GroundBack.prototype.constructor = GroundBack;


    GroundBack.prototype.init = function () {
        this.groundGroup4 = new Phaser.Group(this.game, 0, 0);
        this.groundGroup3 = new Phaser.Group(this.game, 0, 0);
        this.groundGroup2 = new Phaser.Group(this.game, 0, 0);

        this.groundGroup4.name = "groundGroup4";
        this.groundGroup3.name = "groundGroup3";
        this.groundGroup2.name = "groundGroup2";

        this.add(this.groundGroup4);
        this.add(this.groundGroup3);
        this.add(this.groundGroup2);

        // add level 1 layer
        var i = 0;
        while (i < Math.ceil(this.game.world.width / 256)) {
            var l = this.groundGroup4.create(i * 256, 0, "game", "ground/g" + (this.game.rnd.integerInRange(1, 6)) + ".png");
            l.tint = 0xf48f44;
            i++;
        }

        // add level 2 layer
        var j = 0;
        while (j < Math.ceil(this.game.world.width / 256) + 1) {
            var m = this.groundGroup3.create(j * 256, 0, "game", "ground/g" + (this.game.rnd.integerInRange(1, 6)) + ".png");
            m.tint = 0x882d25;
            j++;
        }

        // add level 3 layer
        var k = 0;
        while (k < Math.ceil(this.game.world.width / 256) + 2) {
            var n = this.groundGroup2.create(k * 256, 0, "game", "ground/g" + (this.game.rnd.integerInRange(1, 6)) + ".png");
            n.tint = 0x5f0028;
            k++;
        }

        var g2 = this.groundGroup2.create(0, 0, "game", "ground-grad.png");
        var g3 = this.groundGroup3.create(0, 0, "game", "ground-grad.png");
        var g4 = this.groundGroup4.create(0, 0, "game", "ground-grad.png");

        g2.width = g3.width = g4.width = this.game.world.width;

        g2.alpha = 0.3;
        g3.alpha = 0.5;
        g4.alpha = 0.7;

        this.groundGroup2.y = this.game.world.height - 100 - 30;
        this.groundGroup3.y = this.game.world.height - 100 - 50;
        this.groundGroup4.y = this.game.world.height - 100 - 65;

        this.isInited = true;
    };


    /**
     * Scroll to a position.
     * @param p New position in %
     */
    GroundBack.prototype.scroll = function (p) {
        this.groundGroup2.x = (this.game.world.width - this.groundGroup2.width) * p;
        this.groundGroup3.x = (this.game.world.width - this.groundGroup3.width) * p;
        this.groundGroup4.x = (this.game.world.width - this.groundGroup4.width) * p;
    };


}());

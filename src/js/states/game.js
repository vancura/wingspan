/**
 * Game State.
 */
(function () {
    "use strict";


    GameState = function () {
    };


    GameState.prototype = {


        init: function () {
            this.physics.startSystem(Phaser.Physics.BOX2D);
            this.physics.box2d.restitution = 0.1;
        },


        create: function () {
            this.plane = this.add.sprite(this.world.centerX, this.world.centerY, "game", "plane.png");
            this.plane.anchor.set(0.5, 0.5);

            this.physics.box2d.enable(this.plane);

            this.plane.body.setCircle(this.plane.width / 2.8);
        },


        update: function () {
        }


    };


}());


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
        },


        update: function () {
        }


    };


}());


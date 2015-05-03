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
            this.physics.box2d.setBoundsToWorld();
            this.physics.box2d.gravity.y = 200;
            this.physics.box2d.restitution = 0.4;
        },


        create: function () {
            this.plane = this.add.sprite(this.world.centerX, this.world.centerY, "game", "plane.png");
            this.plane.anchor.set(0.5, 0.5);

            this.physics.box2d.enable(this.plane);

            this.plane.body.setCircle(this.plane.width / 2.8);

            this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
            this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
        },


        render: function () {
            game.debug.box2dWorld();
        },


        update: function () {
            if (this.plane) {
                if (this.leftButton.isDown && !this.rightButton.isDown) {
                    this.plane.body.rotateLeft(50);
                }
                else if (!this.leftButton.isDown && this.rightButton.isDown) {
                    this.plane.body.rotateRight(50);
                }

                this.plane.body.thrust(200);
            }
        }


    };


}());


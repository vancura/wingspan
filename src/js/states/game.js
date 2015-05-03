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
            //this.physics.box2d.gravity.y = 200;
            this.physics.box2d.restitution = 0.4;
        },


        create: function () {
            this.trailGraphics1 = this.add.graphics(0, 0);
            this.trailGraphics2 = this.add.graphics(0, 0);

            this.plane = this.add.sprite(this.world.centerX, this.world.centerY, "game", "plane.png");
            this.plane.anchor.set(0.5, 0.5);
            this.plane.angle = 90;

            this.physics.box2d.enable(this.plane);

            this.plane.body.setCircle(this.plane.width / 2);

            var pos = this.getTrailsPosition();

            this.trailGraphics1.moveTo(pos[0], pos[1]);
            this.trailGraphics2.moveTo(pos[2], pos[3]);

            this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
            this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
        },


        render: function () {
            // game.debug.box2dWorld();
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

                var pos = this.getTrailsPosition();

                this.trailGraphics1.lineStyle(1, 0xFF0000, 0.5);
                this.trailGraphics1.lineTo(pos[0], pos[1]);

                this.trailGraphics2.lineStyle(1, 0xFF0000, 0.5);
                this.trailGraphics2.lineTo(pos[2], pos[3]);
            }
        },


        // PRIVATE


        getTrailsPosition: function () {
            var d = this.plane.rotation * -1 - 90 * (Math.PI / 180);

            var mx1 = Math.sin(d) * -20 + this.plane.x;
            var my1 = Math.cos(d) * -20 + this.plane.y;
            var mx2 = Math.sin(d) * 20 + this.plane.x;
            var my2 = Math.cos(d) * 20 + this.plane.y;

            return [mx1, my1, mx2, my2];
        }


    };


}());


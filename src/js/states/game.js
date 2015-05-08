/**
 * Game State.
 */
(function () {
    "use strict";


    GameState = function () {
    };


    GameState.WORLD_GRAVITY = 45;
    GameState.WORLD_OVERFLOW = -10;
    GameState.MAX_TRAIL_DISTANCE = 15;


    GameState.prototype = {


        /**
         * Init.
         */
        init: function () {
            this.physics.startSystem(Phaser.Physics.BOX2D);
            this.physics.box2d.setBoundsToWorld(true, true, false, true);
            this.physics.box2d.gravity.y = GameState.WORLD_GRAVITY;
            this.physics.box2d.restitution = 0.4;
        },


        /**
         * Create.
         */
        create: function () {
            this.createControls();
            this.createGroundBack();
            this.createPlanes();
            this.createTrails();
            this.createFire();
            this.createGroundFront();
        },


        /**
         * Render.
         */
        render: function () {
            this.game.debug.box2dWorld();
        },


        /**
         * Update.
         */
        update: function () {
            if (this.plane) {
                if (this.leftButton.isDown && !this.rightButton.isDown) {
                    this.plane.rotateLeft();
                } else if (!this.leftButton.isDown && this.rightButton.isDown) {
                    this.plane.rotateRight();
                }

                if (this.thrustButton.isDown) {
                    this.plane.thrust();
                } else if (this.backpedalButton.isDown) {
                    this.plane.backPedal();
                } else {
                    this.plane.leave();
                }

                // draw trails, calculate the distance multiplier
                this.drawTrails(1 - Math.abs(this.plane.degree / 70));
            }
        },


        // PRIVATE
        // -------


        /**
         * Get trail positions.
         * @param multiplier Distance multiplier (used when rotating)
         * @return Array of trail positions [x1, y1, x2, y2]
         */
        getTrailPositions: function (multiplier) {
            var d = this.plane.rotation * -1 - 90 * (Math.PI / 180);
            var m = (typeof multiplier === "undefined") ? 1 : multiplier;

            var x1 = Math.sin(d) * (GameState.MAX_TRAIL_DISTANCE * -m) + this.plane.x;
            var y1 = Math.cos(d) * (GameState.MAX_TRAIL_DISTANCE * -m) + this.plane.y;
            var x2 = Math.sin(d) * (GameState.MAX_TRAIL_DISTANCE * m) + this.plane.x;
            var y2 = Math.cos(d) * (GameState.MAX_TRAIL_DISTANCE * m) + this.plane.y;

            return [x1, y1, x2, y2];
        },


        /**
         * Create the plane.
         */
        createPlanes: function () {
            var startX = this.world.centerX;
            var startY = GameState.WORLD_OVERFLOW;

            this.plane = new Plane(this.game, startX, startY);

            this.add.existing(this.plane);
        },


        /**
         * Restart after crash.
         */
        restart: function () {
        },


        /**
         * Create trails.
         */
        createTrails: function () {
            var pos = this.getTrailPositions();

            this.trailGraphics1 = this.add.graphics(0, 0);
            this.trailGraphics2 = this.add.graphics(0, 0);

            this.trailGraphics1.name = "trail1";
            this.trailGraphics2.name = "trail2";

            this.trailGraphics1.moveTo(pos[0], pos[1]);
            this.trailGraphics2.moveTo(pos[2], pos[3]);
        },


        /**
         * Create fire.
         */
        createFire: function () {
            this.fire = this.add.sprite(0, this.world.height, "game", "fire.png");
            this.fire.anchor.set(0.5, 1);
            this.fire.alpha = 0;
        },


        /**
         * Create controls.
         */
        createControls: function () {
            this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
            this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
            this.thrustButton = this.input.keyboard.addKey(Phaser.Keyboard.W);
            this.backpedalButton = this.input.keyboard.addKey(Phaser.Keyboard.S);
        },


        /**
         * Create ground in back.
         */
        createGroundBack: function () {
            this.groundGroup4 = this.add.group();
            this.groundGroup4.name = "groundGroup4";

            this.groundGroup3 = this.add.group();
            this.groundGroup3.name = "groundGroup2";

            this.groundGroup2 = this.add.group();
            this.groundGroup2.name = "groundGroup2";

            var x = 0;
            while (x < this.world.width) {
                var l2 = this.groundGroup2.create(x, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");
                var l3 = this.groundGroup3.create(x, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");
                var l4 = this.groundGroup4.create(x, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");

                l2.tint = 0x252d33;
                l3.tint = 0x4b565f;
                l4.tint = 0x8d9499;

                x += 256;
            }

            var g2 = this.groundGroup2.create(0, 0, "game", "ground-grad.png");
            var g3 = this.groundGroup3.create(0, 0, "game", "ground-grad.png");
            var g4 = this.groundGroup4.create(0, 0, "game", "ground-grad.png");

            g2.width = g3.width = g4.width = this.world.width;

            g2.alpha = 0.3;
            g3.alpha = 0.5;
            g4.alpha = 0.7;

            this.groundGroup2.y = this.world.height - 100 - 30;
            this.groundGroup3.y = this.world.height - 100 - 50;
            this.groundGroup4.y = this.world.height - 100 - 65;
        },


        /**
         * Create ground in front.
         */
        createGroundFront: function () {
            this.groundGroup1 = this.add.group();
            this.groundGroup1.name = "groundGroup1";

            var x = 0;
            while (x < this.world.width) {
                var l1 = this.groundGroup1.create(x, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");

                l1.tint = 0x000000;

                x += 256;
            }

            this.groundGroup1.y = this.world.height - 100;
        },


        /**
         * Draw trails.
         * @param multiplier Distance multiplier (used when rotating)
         */
        drawTrails: function (multiplier) {
            var pos = this.getTrailPositions(multiplier);

            this.trailGraphics1.lineStyle(1, 0xFF0000, 0.5);
            this.trailGraphics1.lineTo(pos[0], pos[1]);

            this.trailGraphics2.lineStyle(1, 0xFF0000, 0.5);
            this.trailGraphics2.lineTo(pos[2], pos[3]);
        },


        /**
         * Plane crash event handler.
         */
        onPlaneCrashed: function (e) {
            this.fire.x = e.x;
            this.fire.alpha = 1;

            var tween = this.add.tween(this.fire);

            tween.to({alpha: 0}, 1000);
            tween.start();

            this.restart();
        }


    };


}());

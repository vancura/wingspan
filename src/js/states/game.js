/**
 * Game State.
 */
(function () {
    "use strict";


    GameState = function () {
    };


    GameState.IS_BOX2D_DEBUG_ENABLED = false;
    GameState.IS_TRAILS_RENDERING_ENABLED = false;

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

            this.planeList = [];
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
            if (GameState.IS_BOX2D_DEBUG_ENABLED) {
                this.game.debug.box2dWorld();
            }
        },


        /**
         * Update.
         */
        update: function () {
            for (var a = 0; a < this.planeList.length; a++) {
                var plane = this.planeList[a];

                // turn sideways
                if (this.leftButton.isDown && !this.rightButton.isDown) {
                    plane.rotateLeft();
                } else if (!this.leftButton.isDown && this.rightButton.isDown) {
                    plane.rotateRight();
                }

                // thrust or backpedal
                // after a while revert to original power
                if (this.thrustButton.isDown) {
                    plane.thrust();
                } else if (this.backpedalButton.isDown) {
                    plane.backPedal();
                } else {
                    plane.leave();
                }

                // draw trails, calculate the distance multiplier
                if (a === 0) {
                    // TODO: More trails
                    this.drawTrails(plane, 1 - Math.abs(plane.degree / 70), 0xFF0000);
                }
            }
        },


        // PRIVATE
        // -------


        /**
         * Get trail positions.
         * @param plane The plane
         * @param multiplier Distance multiplier (used when rotating)
         * @return Array of trail positions [x1, y1, x2, y2]
         */
        getTrailPositions: function (plane, multiplier) {
            var out = null;

            if (GameState.IS_TRAILS_RENDERING_ENABLED) {
                var d = plane.rotation * -1 - 90 * (Math.PI / 180);
                var m = (typeof multiplier === "undefined") ? 1 : multiplier;

                var x1 = Math.sin(d) * (GameState.MAX_TRAIL_DISTANCE * -m) + plane.x;
                var y1 = Math.cos(d) * (GameState.MAX_TRAIL_DISTANCE * -m) + plane.y;
                var x2 = Math.sin(d) * (GameState.MAX_TRAIL_DISTANCE * m) + plane.x;
                var y2 = Math.cos(d) * (GameState.MAX_TRAIL_DISTANCE * m) + plane.y;

                out = [x1, y1, x2, y2];
            }

            return out;
        },


        /**
         * Create the plane.
         */
        createPlanes: function () {
            var startX = this.world.centerX;
            var startY = GameState.WORLD_OVERFLOW + 100;

            for (var a = 0; a < 2; a++) {
                var x = startX + (a - 1) * 200;
                var plane = new Plane(this.game, x, startY);

                this.add.existing(plane);

                this.planeList.push(plane);

                plane.init();
            }
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
            if (GameState.IS_TRAILS_RENDERING_ENABLED) {
                var pos = this.getTrailPositions(this.planeList[0]); // TODO: More lines

                this.trailGraphicsLeft = this.add.graphics(0, 0);
                this.trailGraphicsRight = this.add.graphics(0, 0);

                this.trailGraphicsLeft.name = "trailLeft";
                this.trailGraphicsRight.name = "trailRight";

                this.trailGraphicsLeft.moveTo(pos[0], pos[1]);
                this.trailGraphicsRight.moveTo(pos[2], pos[3]);
            }
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
         * @param plane Plane to draw a trail for
         * @param multiplier Distance multiplier (used when rotating)
         * @param color Color of the trail
         */
        drawTrails: function (plane, multiplier, color) {
            if (GameState.IS_TRAILS_RENDERING_ENABLED) {
                var pos = this.getTrailPositions(plane, multiplier);

                this.trailGraphicsLeft.lineStyle(1, color, 0.5);
                this.trailGraphicsLeft.lineTo(pos[0], pos[1]);

                this.trailGraphicsRight.lineStyle(1, color, 0.5);
                this.trailGraphicsRight.lineTo(pos[2], pos[3]);
            }
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

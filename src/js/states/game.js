/**
 * Game State.
 */
(function () {
    "use strict";


    GameState = function () {
    };


    GameState.prototype = {


        /**
         * Init.
         */
        init: function () {
            this.physics.startSystem(Phaser.Physics.BOX2D);
            this.physics.box2d.setBoundsToWorld(true, true, false, true);
            this.physics.box2d.gravity.y = Settings.WORLD_GRAVITY;
            this.physics.box2d.restitution = 0.4;

            if (Settings.IS_DEBUG_ENABLED) {
                game.physics.box2d.debugDraw.shapes = true;
                game.physics.box2d.debugDraw.joints = true;
                game.physics.box2d.debugDraw.aabbs = true;
                game.physics.box2d.debugDraw.pairs = true;
                game.physics.box2d.debugDraw.centerOfMass = true;
            }

            GameState.planeList = [];

            // master plane is the plane user controls
            // it also gets destroyed and then another plane is set to be master
            // see this.restart()
            this.masterPlane = null;

            // when restart is needed this is true
            // handled in this.update()
            this.isRestartRequested = false;
        },


        /**
         * Create.
         */
        create: function () {
            this.createControls();
            this.createBackground();
            this.createGroundBack();
            this.createPlanes();
            this.createTrails();
            this.createFire();
            this.createGroundFront();
            this.createParallax();
            this.createSignals();
        },


        /**
         * Render.
         */
        render: function () {
            if (Settings.IS_DEBUG_ENABLED) {
                this.game.debug.box2dWorld();
                this.game.debug.cameraInfo(this.game.camera, 10, this.world.height - 82);
            }
        },


        /**
         * Update.
         */
        update: function () {
            for (var a = 0; a < GameState.planeList.length; a++) {
                var plane = GameState.planeList[a];

                // only control the master plane
                if (plane === this.masterPlane) {
                    // check for restart mode
                    if (this.isRestartRequested) {
                        this.restart();
                    }

                    // turn sideways
                    if (this.leftButton.isDown && !this.rightButton.isDown) {
                        plane.rotateLeft();
                    } else if (!this.leftButton.isDown && this.rightButton.isDown) {
                        plane.rotateRight();
                    } else {
                        plane.leaveRotation();
                    }

                    // thrust or backpedal
                    // after a while revert to original power
                    if (this.thrustButton.isDown) {
                        plane.thrust();
                    } else if (this.backpedalButton.isDown) {
                        plane.backPedal();
                    } else {
                        plane.leaveThrust();
                    }

                    // firing
                    if (Settings.IS_PLANE_WEAPON_ENABLED && this.fireButton.isDown) {
                        plane.weapon.fire(this.masterPlane);
                    }

                    // calculate parallax,
                    var p = 1 / (this.world.width / plane.body.x);

                    this.groundGroup1.x = (this.world.width - this.groundGroup1.width) * p;
                    this.groundGroup2.x = (this.world.width - this.groundGroup2.width) * p;
                    this.groundGroup3.x = (this.world.width - this.groundGroup3.width) * p;
                    this.groundGroup4.x = (this.world.width - this.groundGroup4.width) * p;

                    this.game.camera.x = (this.world.width - this.originalWidth) * p;
                }

                // draw trails, calculate the distance multiplier
                if (a === 0) {
                    // 1.15 to prevent merging lines
                    this.drawTrails(plane, 1 - Math.abs(plane.degree / (Settings.PLANE_KEYBOARD_ROTATION_STEP * 1.15)), 0xFF0000);
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

            if (Settings.IS_TRAILS_RENDERING_ENABLED) {
                var d = plane.rotation * -1 - 90 * (Math.PI / 180);
                var m = (typeof multiplier === "undefined") ? 0 : 1 - multiplier;

                var x1 = Math.sin(d) * (Settings.MAX_TRAIL_DISTANCE * -m) + plane.body.x;
                var y1 = Math.cos(d) * (Settings.MAX_TRAIL_DISTANCE * -m) + plane.body.y;
                var x2 = Math.sin(d) * (Settings.MAX_TRAIL_DISTANCE * m) + plane.body.x;
                var y2 = Math.cos(d) * (Settings.MAX_TRAIL_DISTANCE * m) + plane.body.y;

                out = [x1, y1, x2, y2];
            }

            return out;
        },


        /**
         * Create the plane.
         */
        createPlanes: function () {
            for (var a = 0; a < Settings.PLANE_COUNT; a++) {
                var framePrefix = (a === 0) ? "plane1" : "plane2"; // TODO: More planes
                var plane = new Plane(this.game, this.world.centerX + (a - 1) * 200, Settings.WORLD_OVERFLOW, framePrefix);

                this.add.existing(plane);

                GameState.planeList.push(plane);

                plane.init();

                // set the master plane
                if (a === 0) {
                    this.masterPlane = plane;
                }
            }

            // sound
            if (Settings.IS_SOUND_ENABLED) {
                this.engineLoop = this.game.add.audio("engineLoop");
                this.engineLoop.play("", 0, 0.5, true);

                this.musicLoop = this.game.add.audio("music-parapet");
                this.musicLoop.play("", 0, 0.8, true);
            }
        },


        /**
         * Restart after crash.
         */
        restart: function () {
            if (this.masterPlane) {
                this.isRestartRequested = false;

                // reset the plane position and rotation
                this.masterPlane.reset();

                // reset this plane trails
                var pos = this.getTrailPositions(this.masterPlane);
                this.trailGraphicsLeft.moveTo(pos[0], pos[1]);
                this.trailGraphicsRight.moveTo(pos[2], pos[3]);
            }
        },


        /**
         * Create trails.
         */
        createTrails: function () {
            if (Settings.IS_TRAILS_RENDERING_ENABLED) {
                if (this.masterPlane) {
                    var pos = this.getTrailPositions(this.masterPlane);

                    this.trailGraphicsLeft = this.add.graphics(0, 0);
                    this.trailGraphicsRight = this.add.graphics(0, 0);

                    this.trailGraphicsLeft.alpha = this.trailGraphicsRight.alpha = 0.2;

                    this.trailGraphicsLeft.name = "trailLeft";
                    this.trailGraphicsRight.name = "trailRight";

                    this.trailGraphicsLeft.moveTo(pos[0], pos[1]);
                    this.trailGraphicsRight.moveTo(pos[2], pos[3]);
                }
            }
        },


        /**
         * Create fire.
         */
        createFire: function () {
            this.fire = this.add.sprite(0, this.world.height, "game", "fire.png");
            this.fire.anchor.set(0.5, 1);
            this.fire.alpha = 0;
            this.fire.name = "fire";
        },


        /**
         * Create controls.
         */
        createControls: function () {
            this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
            this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
            this.thrustButton = this.input.keyboard.addKey(Phaser.Keyboard.W);
            this.backpedalButton = this.input.keyboard.addKey(Phaser.Keyboard.S);
            this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.F);
        },


        /**
         * Create the background.
         */
        createBackground: function () {
            this.background = this.add.sprite(0, 0, "forestBackground");
            this.background.width = this.world.width;
            this.background.height = this.world.height;
            this.background.fixedToCamera = true;
        },


        /**
         * Create ground in back.
         * It needs to be called separately to allow proper z-sorting.
         */
        createGroundBack: function () {
            this.groundGroup4 = this.add.group();
            this.groundGroup4.name = "groundGroup4";

            this.groundGroup3 = this.add.group();
            this.groundGroup3.name = "groundGroup3";

            this.groundGroup2 = this.add.group();
            this.groundGroup2.name = "groundGroup2";

            // add level 1 layer
            var i = 0;
            while (i < Math.ceil(this.world.width / 256)) {
                var l = this.groundGroup4.create(i * 256, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");
                l.tint = 0xf48f44;
                i++;
            }

            // add level 2 layer
            var j = 0;
            while (j < Math.ceil(this.world.width / 256) + 1) {
                var m = this.groundGroup3.create(j * 256, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");
                m.tint = 0x882d25;
                j++;
            }

            // add level 3 layer
            var k = 0;
            while (k < Math.ceil(this.world.width / 256) + 2) {
                var n = this.groundGroup2.create(k * 256, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");
                n.tint = 0x5f0028;
                k++;
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
         * It needs to be called separately to allow proper z-sorting.
         */
        createGroundFront: function () {
            this.groundGroup1 = this.add.group();
            this.groundGroup1.name = "groundGroup1";

            var i = 0;
            while (i < Math.ceil(this.world.width / 254) + 3) {
                var l = this.groundGroup1.create(i * 254, 0, "game", "ground/g" + (this.rnd.integerInRange(1, 6)) + ".png");
                l.tint = 0x000000;
                i++;
            }

            this.groundGroup1.y = this.world.height - 100;
        },


        /**
         * Create the parallax effect.
         */
        createParallax: function () {
            this.originalWidth = this.world.width;
            this.game.world.setBounds(0, 0, this.originalWidth * 2.2, this.world.height);
        },


        /**
         * Create signals.
         */
        createSignals: function () {
            signals.onCrashBottom.add(this.onPlaneCrashed, this);
        },


        /**
         * Draw trails.
         * @param plane Plane to draw a trail for
         * @param multiplier Distance multiplier (used when rotating)
         * @param color Color of the trail
         */
        drawTrails: function (plane, multiplier, color) {
            if (Settings.IS_TRAILS_RENDERING_ENABLED) {
                var pos = this.getTrailPositions(plane, multiplier);

                this.trailGraphicsLeft.lineStyle(1, color, 0.5);
                this.trailGraphicsLeft.lineTo(pos[0], pos[1]);

                this.trailGraphicsRight.lineStyle(1, color, 0.5);
                this.trailGraphicsRight.lineTo(pos[2], pos[3]);
            }
        },


        /**
         * Plane crash event handler.
         * @param e Plane reference
         */
        onPlaneCrashed: function (e) {
            // TODO: Multiple fires

            this.fire.x = e.body.x;
            this.fire.alpha = 1;

            var tween = this.add.tween(this.fire);

            tween.to({alpha: 0}, 1000);
            tween.start();

            if (e === this.masterPlane) {
                this.isRestartRequested = true;
            }
        }


    };


}());

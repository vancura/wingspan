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
            this.createParallax();
            this.createBackground();
            this.createGroundBack();
            this.createPlanes();
            this.createSounds();
            this.createTrails();
            this.createFire();
            this.createGroundFront();
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
                        plane.weapon.fire(plane);
                    }

                    // sounds
                    if (Settings.IS_SOUND_ENABLED) {
                        var v = plane.vel / 60;
                        this.engineLoop.volume = 1 - v / 2;
                        this.engineStress.volume = v / 4;
                    }

                    // handle parallax scrolling
                    var p = 1 / (this.world.width / plane.body.x);

                    this.groundBack.scroll(p);
                    this.groundFront.scroll(p);
                    this.game.camera.x = (this.world.width - this.originalWidth) * p;
                }

                // draw trails, calculate the distance multiplier
                // 0.1 to prevent merging lines
                this.trails.draw(plane, 1 - Math.abs(plane.degree / Settings.PLANE_KEYBOARD_ROTATION_STEP) - 0.1, plane.trailColor);
            }
        },


        // PRIVATE
        // -------


        /**
         * Create the plane.
         */
        createPlanes: function () {
            for (var a = 0; a < Settings.PLANE_COUNT; a++) {
                var framePrefix = (a === 0) ? "plane1" : "plane2"; // TODO: More planes
                var trailColor = Settings.PLANE_TRAIL_COLOR_LIST[a];
                var plane = new Plane(this.game, this.world.centerX + (a - 1) * 200, Settings.WORLD_OVERFLOW, framePrefix, trailColor);

                this.add.existing(plane);

                GameState.planeList.push(plane);

                plane.init();

                // set the master plane
                if (a === 0) {
                    this.masterPlane = plane;
                }
            }
        },


        /**
         * Create sounds. For the science!
         */
        createSounds: function () {
            if (Settings.IS_SOUND_ENABLED) {
                this.engineLoop = this.game.add.audio("engineLoop");
                this.engineLoop.play("", 0, 0, true);

                this.engineStress = this.game.add.audio("engineStress");
                this.engineStress.play("", 0, 0, true);

                this.musicLoop = this.game.add.audio("music-parapet");
                this.musicLoop.play("", 0, 0.8, true);

                this.explosion = this.game.add.audio("explosion");
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
            }
        },


        /**
         * Create trails.
         */
        createTrails: function () {
            if (Settings.IS_TRAILS_RENDERING_ENABLED) {
                this.trails = new Trails(this.game, this.masterPlane);
                this.trails.init();

                this.add.existing(this.trails);
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
            this.background.name = "background";
            this.background.width = this.world.width;
            this.background.height = this.world.height;
            this.background.fixedToCamera = true;
        },


        /**
         * Create ground in back.
         * It needs to be called separately to allow proper z-sorting.
         */
        createGroundBack: function () {
            this.groundBack = new GroundBack(this.game);
            this.groundBack.init();
        },


        /**
         * Create ground in front.
         * It needs to be called separately to allow proper z-sorting.
         */
        createGroundFront: function () {
            this.groundFront = new GroundFront(this.game);
            this.groundFront.init();
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

            if (Settings.IS_SOUND_ENABLED) {
                this.explosion.play();
            }

            if (e === this.masterPlane) {
                this.isRestartRequested = true;
            }
        }


    };


}());

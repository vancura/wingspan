/**
 * Game State.
 */
(function () {
    "use strict";


    GameState = function () {
    };


    GameState.WORLD_GRAVITY = 45;
    GameState.WORLD_OVERFLOW = -10;
    GameState.PLANE_MAX_THRUST = 110;
    GameState.PLANE_THRUST_MULTIPLIER_UP = 1.9; // thrust multiplier when thrust button down
    GameState.PLANE_THRUST_MULTIPLIER_DOWN = 0.5; // thrust multiplier when backpedal button down
    GameState.PLANE_THRUST_MULTIPLIER_NONE = 0.995; // thrust step when both thrust and backpedal buttons released
    GameState.PLANE_LINEAR_DAMPING = 1;
    GameState.PLANE_ANGULAR_DAMPING_FACTOR = 20;
    GameState.PLANE_KEYBOARD_ROTATION_STEP = 70;
    GameState.PLANE_MOUSE_ROTATION_STEP = 100;
    GameState.PLANE_MAX_TRAIL_DISTANCE = 15;
    GameState.PLANE_CONTROL_DEGREE_STEP = 0.02;


    GameState.prototype = {


        /**
         * Init.
         */
        init: function () {
            this.mouseStep = 0;

            // current rotation degree; 0 = absolutely controllable, abs(1) = lost control
            // could be -1 .. +1 depending on rotation direction
            this.currentPlaneControlDegree = 0;

            // current thrust
            // could be 0.1 .. PLANE_MAX_THRUST
            this.currentPlaneThrust = 0.1;

            this.physics.startSystem(Phaser.Physics.BOX2D);
            this.physics.box2d.setBoundsToWorld(true, true, false, true);
            this.physics.box2d.gravity.y = GameState.WORLD_GRAVITY;
            this.physics.box2d.restitution = 0.4;
        },


        /**
         * Create.
         */
        create: function () {
            this.createPlane();
            this.createTrails();
            this.createControls();
        },


        /**
         * Render.
         */
        render: function () {
            //this.game.debug.box2dWorld();

            //if (this.plane) {
            //this.debug.bodyInfo(this.plane, this.plane.x + 20, this.plane.y + 20);
            //this.debug.box2dBody(this.plane, "rgb(0, 255, 0)");
            //this.game.debug.body(this.plane, "rgb(0, 255, 0)");
            //}
        },


        /**
         * Update.
         */
        update: function () {
            if (this.plane) {
                if (this.leftButton.isDown && !this.rightButton.isDown) {
                    // rotating left, increase rotation degree until it's +1
                    this.currentPlaneControlDegree += GameState.PLANE_CONTROL_DEGREE_STEP;
                }
                else if (!this.leftButton.isDown && this.rightButton.isDown) {
                    // rotating right, decrease rotation degree until it's -1
                    this.currentPlaneControlDegree -= GameState.PLANE_CONTROL_DEGREE_STEP;
                }

                // clamp rotation degree to -1..+1
                this.currentPlaneControlDegree = Phaser.Math.clamp(this.currentPlaneControlDegree, -1, 1);

                // prevent division by zero below
                if (this.currentPlaneControlDegree === 0) {
                    this.currentPlaneControlDegree = 0.001;
                }

                // calculate new rotation
                var rot = GameState.PLANE_KEYBOARD_ROTATION_STEP * this.currentPlaneControlDegree;

                // tweak based on plane speed
                // the faster plane goes the more difficult is to control it
                // calculate current plane velocity
                var vel = Math.sqrt(this.plane.body.velocity.x * this.plane.body.velocity.x + this.plane.body.velocity.y * this.plane.body.velocity.y);

                // apply the angular damping from velocity calculated above
                this.plane.body.angularDamping = vel / GameState.PLANE_ANGULAR_DAMPING_FACTOR / this.currentPlaneControlDegree;

                // and finally rotate the plane
                this.plane.body.rotateLeft(rot);

                if (this.thrustButton.isDown) {
                    // thrust button down, thrust up
                    this.currentPlaneThrust *= GameState.PLANE_THRUST_MULTIPLIER_UP;
                }
                else if (this.backpedalButton.isDown) {
                    // backpedal button down, thrust down
                    this.currentPlaneThrust *= GameState.PLANE_THRUST_MULTIPLIER_DOWN;
                }
                else {
                    // thrust button released and no backpedal down,
                    // slowly decrease thrust
                    this.currentPlaneThrust *= GameState.PLANE_THRUST_MULTIPLIER_NONE;
                }

                // apply current thrust
                this.currentPlaneThrust = Phaser.Math.clamp(this.currentPlaneThrust, 0.1, GameState.PLANE_MAX_THRUST);
                //console.log(this.currentPlaneThrust);
                this.plane.body.thrust(this.currentPlaneThrust);

                // draw trails, calculate the distance multiplier
                this.drawTrails(1 - Math.abs(rot / 70));

                // switch the plane frame based on the rotation
                if (Math.abs(rot) > 0) {
                    var frameName = "plane1/p" + (Math.round(Math.abs(rot) / 8) + 1) + ".png";
                    //console.log(frameName);
                    this.plane.frameName = frameName;
                }
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

            var x1 = Math.sin(d) * (GameState.PLANE_MAX_TRAIL_DISTANCE * -m) + this.plane.x;
            var y1 = Math.cos(d) * (GameState.PLANE_MAX_TRAIL_DISTANCE * -m) + this.plane.y;
            var x2 = Math.sin(d) * (GameState.PLANE_MAX_TRAIL_DISTANCE * m) + this.plane.x;
            var y2 = Math.cos(d) * (GameState.PLANE_MAX_TRAIL_DISTANCE * m) + this.plane.y;

            return [x1, y1, x2, y2];
        },


        /**
         * Create the plane.
         */
        createPlane: function () {
            var startX = this.world.centerX;
            var startY = GameState.WORLD_OVERFLOW;

            this.plane = this.add.sprite(startX, startY, "game", "plane1/p1.png");
            this.plane.anchor.set(0.5, 0.5);
            this.plane.scale.set(0.5);

            this.physics.box2d.enable(this.plane);

            this.plane.body.setCircle(this.plane.width / 2);
            this.plane.body.angle = 180;

            this.plane.body.linearDamping = GameState.PLANE_LINEAR_DAMPING;
        },


        /**
         * Create trails.
         */
        createTrails: function () {
            var pos = this.getTrailPositions();

            this.trailGraphics1 = this.add.graphics(0, 0);
            this.trailGraphics2 = this.add.graphics(0, 0);

            this.trailGraphics1.moveTo(pos[0], pos[1]);
            this.trailGraphics2.moveTo(pos[2], pos[3]);
        },


        /**
         * Create controls.
         */
        createControls: function () {
            this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
            this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
            this.thrustButton = this.input.keyboard.addKey(Phaser.Keyboard.W);
            this.backpedalButton = this.input.keyboard.addKey(Phaser.Keyboard.S);

            this.input.onDown.add(this.onDown, this);
            this.input.onUp.add(this.onUp, this);
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
         * Mouse down event handler
         * @param e Event
         */
        onDown: function (e) {
            if (e.x < this.world.centerX) {
                this.mouseStep = GameState.PLANE_MOUSE_ROTATION_STEP;
            }
            else {
                this.mouseStep = -GameState.PLANE_MOUSE_ROTATION_STEP;
            }
        },


        /**
         * Mouse up event handler.
         */
        onUp: function () {
            this.mouseStep = 0;
        }


    };


}());


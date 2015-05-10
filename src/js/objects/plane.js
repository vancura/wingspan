/**
 * Plane.
 */
(function () {
    "use strict";


    /**
     * Plane constructor.
     * @param game Game reference
     * @param x Start X position
     * @param y Start Y position
     * @constructor
     */
    Plane = function (game, x, y) {
        Phaser.Sprite.call(this, game, x, y, "game", "plane1/p1.png");

        this.isInited = false;

        // enable physics for this sprite
        game.physics.box2d.enable(this);

        // current rotation degree; 0 = absolutely controllable, abs(1) = lost control
        // could be -1 .. +1 depending on rotation direction
        this.currentControlDegree = 0;

        // current thrust
        // could be 0.1 .. MAX_THRUST
        this.currentThrust = 0.1;

        // current degree
        this.degree = 0;

        // crashed flag preventing multiple crashes
        // reset from this.reset()
        this.isCrashed = false;
    };


    Plane.prototype = Object.create(Phaser.Sprite.prototype);
    Plane.prototype.constructor = Plane;


    Plane.prototype.init = function () {
        this.name = "plane";
        this.scale.set(0.5);

        this.body.angle = 180;
        this.body.linearDamping = 1;

        // create a weapon
        if (Settings.IS_PLANE_WEAPON_ENABLED) {
            this.weapon = new Weapon(game);
            this.weapon.init();
        }

        // sensors
        this.fireSensor = this.body.setCircle(this.width / 2);
        this.fireSensor.SetSensor(true);
        this.body.setFixtureContactCallback(this.fireSensor, this.onPlaneCrashed, this);

        // sound
        if (Settings.IS_SOUND_ENABLED) {
            this.fx = this.game.add.audio("engineLoop");
            this.fx.play("", 0, 0.5, true);
        }

        // done
        this.isInited = true;
    };


    /**
     * Reset position and rotation.
     * Used after a crash.
     */
    Plane.prototype.reset = function () {
        this.body.x = this.game.world.centerX;
        this.body.y = Settings.WORLD_OVERFLOW;
        this.body.angle = 180;

        this.body.setZeroDamping();
        this.body.setZeroRotation();
        this.body.setZeroVelocity();

        this.currentControlDegree = 0;
        this.currentThrust = 0.1;
        this.degree = 0;
        this.isCrashed = false;
    };


    /**
     * Update.
     */
    Plane.prototype.update = function () {
        if (this.isInited) {
            // clamp rotation degree to -1..+1
            this.currentControlDegree = Phaser.Math.clamp(this.currentControlDegree, -1, 1);

            // prevent division by zero below
            if (this.currentControlDegree === 0) {
                this.currentControlDegree = 0.001;
            }

            // calculate new rotation
            var rot = Settings.PLANE_KEYBOARD_ROTATION_STEP * this.currentControlDegree;

            // tweak based on plane speed
            // the faster plane goes the more difficult is to control it
            // calculate current plane velocity
            var vel = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);

            // apply the angular damping from velocity calculated above
            this.body.angularDamping = vel / Settings.PLANE_ANGULAR_DAMPING_FACTOR / this.currentControlDegree;

            // and finally rotate the plane
            this.body.rotateLeft(rot);

            // switch the plane frame based on the rotation
            if (Math.abs(rot) > 0) {
                this.frameName = "plane1/p" + (Math.round(Math.abs(rot) / 8) + 1) + ".png";
            }

            // store the degree
            this.degree = rot;

            // weapon
            if (Settings.IS_PLANE_WEAPON_ENABLED) {
                this.weapon.fire(this);
            }

            // console.log(this.body.velocity.y);
        }
    };


    /**
     * Rotating left, increase rotation degree until it's +1.
     */
    Plane.prototype.rotateLeft = function () {
        if (this.isInited) {
            this.currentControlDegree += Settings.PLANE_CONTROL_DEGREE_STEP;
        }
    };


    /**
     * Rotating right, decrease rotation degree until it's -1.
     */
    Plane.prototype.rotateRight = function () {
        if (this.isInited) {
            this.currentControlDegree -= Settings.PLANE_CONTROL_DEGREE_STEP;
        }
    };


    /**
     * Thrust button down, thrust up.
     */
    Plane.prototype.thrust = function () {
        if (this.isInited) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_UP;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    };


    /**
     * Backpedal button down, thrust down.
     */
    Plane.prototype.backPedal = function () {
        if (this.isInited) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_DOWN;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    };


    /**
     * Thrust button released and no backpedal down,
     * slowly decrease thrust.
     */
    Plane.prototype.leave = function () {
        if (this.isInited) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_NONE;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    };


    // EVENT LISTENERS
    // ---------------


    /**
     * Plane crash event handler.
     * @param e This body
     * @param f The body that was contacted
     * @param g The fixture in this body
     * @param h The fixture in the other body that was contacted
     * @param i A boolean to say whether it was a begin or end event
     * @param j The contact object itself
     */
    Plane.prototype.onPlaneCrashed = function (e, f, g, h, i, j) {
        if (!this.isCrashed && this.body.y > this.game.world.height - 100) {
            this.isCrashed = true;

            signals.onCrashBottom.dispatch();
        }
    };


}());

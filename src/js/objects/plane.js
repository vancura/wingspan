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
     * @param framePrefix Sprite prefix
     * @param trailColor Trail color
     * @param idx Plane index
     * @constructor
     */
    Plane = function (game, x, y, framePrefix, trailColor, idx) {
        Phaser.Sprite.call(this, game, x, y, "game", framePrefix + "/p1.png");

        this.isInited = false;
        this.framePrefix = framePrefix;
        this.trailColor = trailColor;
        this.idx = idx;

        // enable physics for this sprite
        game.physics.box2d.enable(this);

        // current rotation degree; 0 = absolutely controllable, abs(1) = lost control
        // could be -1 .. +1 depending on rotation direction
        this.currentControlDegree = 0;

        // current thrust
        // could be 0.1 .. MAX_THRUST
        this.currentThrust = 0.1;

        // current degree and vel
        this.degree = 0;
        this.vel = 0;

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
            this.weapon = new Weapon(game, this.idx);
            this.weapon.init();
        }

        // sensors
        this.fireSensor = this.body.setCircle(this.width / 2);
        this.fireSensor.SetSensor(true);
        this.body.setFixtureContactCallback(this.fireSensor, this.onPlaneCrashed, this);

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
            var f = 10 - (Math.round(Math.abs(rot) / 7) + 1);
            this.frameName = this.framePrefix + "/p" + f + ".png";

            // store the degree and vel
            this.degree = rot;
            this.vel = vel;
        }
    };


    /**
     * Rotating left, increase rotation degree until it's +1.
     * @param multiplier Multiplier (used when shooting)
     */
    Plane.prototype.rotateLeft = function (multiplier) {
        if (this.isInited) {
            this.currentControlDegree += Settings.PLANE_CONTROL_DEGREE_STEP * multiplier;
        }
    };


    /**
     * Rotating right, decrease rotation degree until it's -1.
     * @param multiplier Multiplier (used when shooting)
     */
    Plane.prototype.rotateRight = function (multiplier) {
        if (this.isInited) {
            this.currentControlDegree -= Settings.PLANE_CONTROL_DEGREE_STEP * multiplier;
        }
    };


    /**
     * Rotation button released,
     * slowly decrease rotation.
     * @author Adrian Cleave (@acleave)
     */
    Plane.prototype.leaveRotation = function () {
        if (Math.abs(this.currentControlDegree) >= 0.01) {
            this.currentControlDegree -= this.currentControlDegree / Math.abs(this.currentControlDegree) * Settings.PLANE_CONTROL_DEGREE_STEP;
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
    Plane.prototype.leaveThrust = function () {
        if (this.isInited) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_NONE;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    };


    /**
     * Shoot this plane.
     */
    Plane.prototype.shoot = function () {
        // first slow down
        this.backPedal();

        // then randomly rotate
        if ((game.rnd.frac() > 0.5)) {
            this.rotateLeft(game.rnd.frac() * 10);
        }
        else {
            this.rotateRight(game.rnd.frac() * 10);
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

            signals.onCrashBottom.dispatch(this);
        }
    };


}());

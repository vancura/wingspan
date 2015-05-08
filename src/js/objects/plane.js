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

        this.name = "plane";
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.5);

        this.body.angle = 180;
        this.body.linearDamping = 1;

        // create a weapon
        this.weapon = new Weapon(game);

        // sensors
        this.fireSensor = this.body.setCircle(this.width / 2);
        this.fireSensor.SetSensor(true);
        this.body.setFixtureContactCallback(this.fireSensor, this.onPlaneCrashed, this);
    };


    Plane.MAX_THRUST = 110;
    Plane.THRUST_MULTIPLIER_UP = 1.9; // thrust multiplier when thrust button down
    Plane.THRUST_MULTIPLIER_DOWN = 0.5; // thrust multiplier when backpedal button down
    Plane.THRUST_MULTIPLIER_NONE = 0.995; // thrust step when both thrust and backpedal buttons released
    Plane.ANGULAR_DAMPING_FACTOR = 20;
    Plane.KEYBOARD_ROTATION_STEP = 70;
    Plane.CONTROL_DEGREE_STEP = 0.02;


    Plane.prototype = Object.create(Phaser.Sprite.prototype);
    Plane.prototype.constructor = Plane;


    /**
     * Update.
     */
    Plane.prototype.update = function () {
        // clamp rotation degree to -1..+1
        this.currentControlDegree = Phaser.Math.clamp(this.currentControlDegree, -1, 1);

        // prevent division by zero below
        if (this.currentControlDegree === 0) {
            this.currentControlDegree = 0.001;
        }

        // calculate new rotation
        var rot = Plane.KEYBOARD_ROTATION_STEP * this.currentControlDegree;

        // tweak based on plane speed
        // the faster plane goes the more difficult is to control it
        // calculate current plane velocity
        var vel = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);

        // apply the angular damping from velocity calculated above
        this.body.angularDamping = vel / Plane.ANGULAR_DAMPING_FACTOR / this.currentControlDegree;

        // and finally rotate the plane
        this.body.rotateLeft(rot);

        // switch the plane frame based on the rotation
        if (Math.abs(rot) > 0) {
            this.frameName = "plane1/p" + (Math.round(Math.abs(rot) / 8) + 1) + ".png";
        }

        // store the degree
        this.degree = rot;

        // shoot
        this.weapon.fire(this);
    };


    /**
     * Rotating left, increase rotation degree until it's +1.
     */
    Plane.prototype.rotateLeft = function () {
        this.currentControlDegree += Plane.CONTROL_DEGREE_STEP;
    };


    /**
     * Rotating right, decrease rotation degree until it's -1.
     */
    Plane.prototype.rotateRight = function () {
        this.currentControlDegree -= Plane.CONTROL_DEGREE_STEP;
    };


    /**
     * Thrust button down, thrust up.
     */
    Plane.prototype.thrust = function () {
        this.currentThrust *= Plane.THRUST_MULTIPLIER_UP;
        this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Plane.MAX_THRUST);

        this.body.thrust(this.currentThrust);
    };


    /**
     * Backpedal button down, thrust down.
     */
    Plane.prototype.backPedal = function () {
        this.currentThrust *= Plane.THRUST_MULTIPLIER_DOWN;
        this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Plane.MAX_THRUST);

        this.body.thrust(this.currentThrust);
    };


    /**
     * Thrust button released and no backpedal down,
     * slowly decrease thrust.
     */
    Plane.prototype.leave = function () {
        this.currentThrust *= Plane.THRUST_MULTIPLIER_NONE;
        this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Plane.MAX_THRUST);

        this.body.thrust(this.currentThrust);
    };


    // EVENT LISTENERS
    // ---------------


    /**
     * Plane crash event handler.
     */
    Plane.prototype.onPlaneCrashed = function () {
        // TODO: Signal
    };


}());

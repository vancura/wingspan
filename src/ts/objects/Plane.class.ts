/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


/**
 * Plane.
 */
class Plane extends Phaser.Sprite {


    private isInited:boolean;
    private framePrefix:string;
    private idx:number;
    private currentControlDegree:number;
    private currentThrust:number;
    private isCrashed:boolean;
    private fireSensor:any; // TODO: Set type when Box2D has TS defs

    private _weapon:Weapon;
    private _vel:number; // TODO: Rename to velocity
    private _degree:number;
    private _trailColor:string;


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
    constructor(game:Phaser.Game, x:number, y:number, framePrefix:string, trailColor:string, idx:number) {
        super(game, x, y, "game", `${framePrefix}/p1.png`);

        this.isInited    = false;
        this.framePrefix = framePrefix;
        this.idx         = idx;
        this._trailColor = trailColor;

        // enable physics for this sprite
        game.physics["box2d"].enable(this);

        // current rotation degree; 0 = absolutely controllable, abs(1) = lost control
        // could be -1 .. +1 depending on rotation direction
        this.currentControlDegree = 0;

        // current thrust
        // could be 0.1 .. MAX_THRUST
        this.currentThrust = 0.1;

        // current degree and vel
        this._degree = 0;
        this._vel    = 0;

        // crashed flag preventing multiple crashes
        // reset from this.reset()
        this.isCrashed = false;
    }


    /**
     * Init.
     */
    init() {
        this.name = "plane";
        this.scale.set(0.5);

        this.body.angle         = 180;
        this.body.linearDamping = 1;

        // create a weapon
        if (Settings.IS_PLANE_WEAPON_ENABLED) {
            this._weapon = new Weapon(this.game, this.idx);
            this._weapon.init();
        }

        // sensors
        this.fireSensor = this.body.setCircle(this.width / 2);
        this.fireSensor.SetSensor(true);
        this.body.setFixtureContactCallback(this.fireSensor, this.onPlaneCrashed, this);

        // done
        this.isInited = true;
    }


    /**
     * Update.
     */
    update() {
        var rot:number, vel:number;

        if (this.isInited) {
            // clamp rotation degree to -1..+1
            this.currentControlDegree = Phaser.Math.clamp(this.currentControlDegree, -1, 1);

            // prevent division by zero below
            if (this.currentControlDegree === 0)
                this.currentControlDegree = 0.001;

            // calculate new rotation
            rot = Settings.PLANE_KEYBOARD_ROTATION_STEP * this.currentControlDegree;

            // tweak based on plane speed
            // the faster plane goes the more difficult is to control it
            // calculate current plane velocity
            vel = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);

            // apply the angular damping from velocity calculated above
            this.body.angularDamping = vel / Settings.PLANE_ANGULAR_DAMPING_FACTOR / this.currentControlDegree;

            // and finally rotate the plane
            this.body.rotateLeft(rot);

            // switch the plane frame based on the rotation
            this.frameName = this.framePrefix + `/p${(10 - Math.round(Math.abs(rot / 7)))}.png`;

            // store the degree and vel
            this._degree = rot;
            this._vel    = vel;
        }
    }


    /**
     * Reset position and rotation.
     * Used after a crash.
     */
    restart() {
        this.body.x = this.game.world.centerX;
        this.body.y = Settings.WORLD_OVERFLOW;

        this.body.setZeroRotation();
        this.body.setZeroVelocity();

        this.currentControlDegree = 0;
        this.currentThrust        = 0.1;
        this._degree              = 0;
        this.isCrashed            = false;
    }


    /**
     * Rotating left, increase rotation degree until it's +1.
     * @param multiplier Multiplier (used when shooting)
     */
    rotateLeft(multiplier:number) {
        if (this.isInited)
            this.currentControlDegree += Settings.PLANE_CONTROL_DEGREE_STEP * multiplier;
    }


    /**
     * Rotating right, decrease rotation degree until it's -1.
     * @param multiplier Multiplier (used when shooting)
     */
    rotateRight(multiplier:number) {
        if (this.isInited)
            this.currentControlDegree -= Settings.PLANE_CONTROL_DEGREE_STEP * multiplier;
    }


    /**
     * Rotation button released,
     * slowly decrease rotation.
     * @author Adrian Cleave (@acleave)
     */
    leaveRotation() {
        if (Math.abs(this.currentControlDegree) >= 0.01)
            this.currentControlDegree -= this.currentControlDegree / Math.abs(this.currentControlDegree) * Settings.PLANE_CONTROL_DEGREE_STEP;
    }


    /**
     * Thrust button down, thrust up.
     */
    thrust() {
        if (this.isInited) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_UP;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    }


    /**
     * Backpedal button down, thrust down.
     */
    backPedal() {
        if (this.isInited) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_DOWN;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    }


    /**
     * Thrust button released and no backpedal down,
     * slowly decrease thrust.
     */
    leaveThrust() {
        if (this.isInited) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_NONE;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, 0.1, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    }


    /**
     * Shoot this plane.
     */
    shoot() {
        // first slow down
        this.backPedal();

        // then randomly rotate
        if ((this.game.rnd.frac() > 0.5))
            this.rotateLeft(this.game.rnd.frac() * 10);
        else
            this.rotateRight(this.game.rnd.frac() * 10);
    }


    // GETTERS & SETTERS
    // -----------------


    /**
     * Get the plane weapon.
     * @return {Weapon} Plane weapon
     */
    public get weapon():Weapon {
        return this._weapon;
    }


    /**
     * Get the plane velocity.
     * @return {number} Plane velocity
     */
    public get vel():number {
        return this._vel;
    }


    /**
     * Get the plane degree.
     * @return {number} Plane degree
     */
    public get degree():number {
        return this._degree;
    }


    /**
     * Get the plane trail color.
     * @return {string} Plane trail color
     */
    public get trailColor():string {
        return this._trailColor;
    }


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
     * TODO: Set type when Box2D has TS defs
     */
    private onPlaneCrashed(e:any, f:any, g:any, h:any, i:boolean, j:any) {
        if (!this.isCrashed && this.body.y > this.game.world.height - 100) {
            this.isCrashed = true;

            Signals.onCrashBottom.dispatch(this);
        }
    }


}
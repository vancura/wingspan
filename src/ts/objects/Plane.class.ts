///<reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
///<reference path="../data/Enums.class.ts"/>
///<reference path="../data/Settings.class.ts" />
///<reference path="../data/Signals.class.ts" />
///<reference path="Weapon.class.ts" />


/**
 * Plane.
 */
class Plane extends Phaser.Sprite {


    private engineLoop: Phaser.Sound;
    private engineStress: Phaser.Sound;
    private explosion: Phaser.Sound;

    private restartTimeout: Phaser.Timer;
    private shotTimeout: Phaser.Timer;
    private crashSlideObj: Phaser.Point;
    private crashSlideTween: Phaser.Tween;

    private framePrefix: string;
    private currentControlDegree: number;
    private currentThrust: number;
    private fireSensor: any; // TODO: Set type when Box2D has TS defs
    private startRatio: number;
    private engineLevel: number = 1; // set to lower value when shot

    private _idx: number;
    private _weapon: Weapon;
    private _velocity: number;
    private _degree: number;
    private _tintColor: any;
    private _tintHex: number;
    private _tintStyle: string;
    private _state: PlaneState;
    private _shotState: PlaneShotState;
    private _direction: PlaneDirection;


    /**
     * Plane constructor.
     * @param game Game reference
     * @param sr Start ratio
     * @param framePrefix Sprite prefix
     * @param tintColor Tint color
     * @param idx Plane index
     * @constructor
     */
    constructor(game: Phaser.Game, sr: number, framePrefix: string, tintColor: string, idx: number) {
        super(game, game.world.width * sr, Settings.WORLD_OVERFLOW, "game", `${framePrefix}/p1.png`);

        this.startRatio = sr;
        this.framePrefix = framePrefix;
        this.name = "plane";
        this._idx = idx;
        this._state = PlaneState.Flying;
        this._shotState = PlaneShotState.Rocking;
        this._direction = PlaneDirection.Up; // starting above the top fold
        this.crashSlideObj = new Phaser.Point();

        // color caching
        this._tintHex = parseInt(`0x${tintColor.substr(1) }`);
        this._tintColor = Phaser.Color.hexToColor(tintColor);
        this._tintStyle = `rgba(${this._tintColor.r}, ${this._tintColor.g}, ${this._tintColor.b}, 1)`;

        // physics settings
        game.physics["box2d"].enable(this);

        this.body.angle = 180;
        this.body.linearDamping = 1;

        this.fireSensor = this.body.setCircle(this.width / 2);
        this.fireSensor.SetSensor(true);
        this.body.setFixtureContactCallback(this.fireSensor, this.onPlaneCrashed, this);

        // visual settings
        this.scale.set(0.5);

        // current rotation degree; 0 = absolutely controllable, abs(1) = lost control
        // could be -1 .. +1 depending on rotation direction
        this.currentControlDegree = 0;

        // current thrust
        this.currentThrust = Settings.MIN_PLANE_THRUST;

        // current degree and velocity
        this._degree = 0;
        this._velocity = 0;

        // create a weapon
        if (Settings.IS_PLANE_WEAPON_ENABLED)
            this._weapon = new Weapon(this.game, this.idx);

        // create sounds
        if (Settings.IS_SOUND_ENABLED) {
            this.engineLoop = this.game.add.audio("engineLoop");
            this.engineLoop.play("", 0, 0, true);

            this.engineStress = this.game.add.audio("engineStress");
            this.engineStress.play("", 0, 0, true);

            this.explosion = this.game.add.audio("explosion");
        }
    }


    /**
     * Update.
     */
    update() {
        var rot: number, vel: number, vol: number;

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
        this.frameName = this.framePrefix + `/p${(10 - Math.round(Math.abs(rot / 7))) }.png`;

        // store the degree and vel
        this._degree = rot;
        this._velocity = vel;

        // set direction
        // noinspection IfStatementWithTooManyBranchesJS
        if (this.body.y < 0)
            this._direction = PlaneDirection.Up;
        else if (this.screenRatio < 0)
            this._direction = PlaneDirection.Left;
        else if (this.screenRatio > 1)
            this._direction = PlaneDirection.Right;
        else
            this._direction = PlaneDirection.OnScreen;

        // play sounds
        if (Settings.IS_SOUND_ENABLED) {
            // calculate real thrust (0..1)
            // TODO: Does it make sense to export it?
            vol = 1 / ((Settings.MAX_PLANE_THRUST - Settings.MIN_PLANE_THRUST) / (this.currentThrust - Settings.MIN_PLANE_THRUST));

            this.engineLoop.volume = (vol / 2 + 0.25) * this.engineLevel;
            this.engineStress.volume = ((1 - vol) / 2) * this.engineLevel;
        }
    }


    /**
     * Post-update loop to fine tune plane rotation towards ground.
     */
    postUpdate() {
        super.postUpdate();

        // first calculate normalized rotation of the
        // plane rotation, coming directly from Box2D
        var a: number = Phaser.Math.normalizeAngle(this.body.sprite.rotation);

        // reduce the rotation so it's not so big
        // we'll use this flag to see if the direction is left or right
        var f: number = (a - Math.PI) / Math.PI;

        // we'll use only absolute angle, since we already know the direction
        // TODO: Does it make sense to export it?
        var x: number = Math.abs(f);

        // calculate sin, so the rotation is close to 0 on both poles
        // if you know how to do it better, I am one big ear
        var q: number = (Math.sin((x - 0.25) * Math.PI * 2) + 1) / Settings.PLANE_GRAVITY_STALL_RATIO;

        // the less velocity the more the gravity wins
        var s: number = q * (1 - (1 / (200 / this._velocity)));

        // rotate towards ground,
        // the less the velocity the more grounding
        this.body.rotation -= f * 0.005;

        // apply the rotation, following the direction flag
        this.body.sprite.rotation = f > 0 ? a - s : a + s;
    }


    /**
     * Rotating left, increase rotation degree until it's +1.
     * @param multiplier Multiplier (used when shooting)
     */
    rotateLeft(multiplier: number) {
        if (this.state == PlaneState.Flying && this._shotState == PlaneShotState.Rocking) {
            this.currentControlDegree += Settings.PLANE_CONTROL_DEGREE_STEP * multiplier;
        }
    }


    /**
     * Rotating right, decrease rotation degree until it's -1.
     * @param multiplier Multiplier (used when shooting)
     */
    rotateRight(multiplier: number) {
        if (this.state == PlaneState.Flying && this._shotState == PlaneShotState.Rocking) {
            this.currentControlDegree -= Settings.PLANE_CONTROL_DEGREE_STEP * multiplier;
        }
    }


    /**
     * Rotation button released,
     * slowly decrease rotation.
     * @author Adrian Cleave (@acleave)
     */
    leaveRotation() {
        if (this.state == PlaneState.Flying) {
            if (Math.abs(this.currentControlDegree) >= 0.01)
                this.currentControlDegree -= this.currentControlDegree / Math.abs(this.currentControlDegree) * Settings.PLANE_CONTROL_DEGREE_STEP;
        }
    }


    /**
     * Thrust button down, thrust up.
     */
    thrustUp() {
        if (this.state == PlaneState.Flying && this._shotState == PlaneShotState.Rocking) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_UP;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, Settings.MIN_PLANE_THRUST, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    }


    /**
     * Thrust button released, slowly decrease thrust.
     */
    thrustDown() {
        if (this.state == PlaneState.Flying && this._shotState == PlaneShotState.Rocking) {
            this.currentThrust *= Settings.PLANE_THRUST_MULTIPLIER_DOWN;
            this.currentThrust = Phaser.Math.clamp(this.currentThrust, Settings.MIN_PLANE_THRUST, Settings.MAX_PLANE_THRUST);

            this.body.thrust(this.currentThrust);
        }
    }


    /**
     * Shoot this plane.
     */
    shoot() {
        // only when the plane is flying
        if (this._state == PlaneState.Flying) {
            switch (this._shotState) {
                case PlaneShotState.Rocking:
                    // plane was flying, was not shot before
                    // now we stop the engine for one second and then we'll see
                    this.engineLevel = 0;
                    this._shotState = PlaneShotState.FirstHit;

                    this.currentThrust = Settings.MIN_PLANE_THRUST;
                    this.body.thrust(this.currentThrust);

                    // create the timeout
                    this.shotTimeout = this.game.time.create();
                    this.shotTimeout.add(1000, this.restartEngine, this);
                    this.shotTimeout.start();

                    break;

                case PlaneShotState.FirstHit:
                    // plane was hit for the second time
                    // now we stop the engine for three more seconds
                    this._shotState = PlaneShotState.SecondHit;

                    // change the timeout
                    this.shotTimeout.stop();
                    this.shotTimeout = this.game.time.create();
                    this.shotTimeout.add(3000, this.restartEngine, this);
                    this.shotTimeout.start();

                    break;

                case PlaneShotState.SecondHit:
                    // plane was hit for the third time
                    // plane is K. O.
                    this._shotState = PlaneShotState.KO;

                    // change the timeout
                    this.shotTimeout.stop();

                    break;
            }
        }
    }


    // PRIVATE
    // -------


    /**
     * Reset position and rotation.
     * Used after a crash.
     * Sets the state to PlaneState.Flying
     * @see PlaneState
     */
    private restart() {
        // reset physics
        this.body.x = this.game.world.width * this.startRatio;
        this.body.y = Settings.WORLD_OVERFLOW;
        this.body.angle = 180;

        this.body.setZeroRotation();
        this.body.setZeroVelocity();

        // reset properties
        this.currentControlDegree = 0;
        this.currentThrust = Settings.MIN_PLANE_THRUST;
        this._degree = 0;

        // plane is flying again
        this._state = PlaneState.Flying;

        // restart the engine
        this.restartEngine();
    }


    /**
     * Restart engine after being shot.
     * TODO: Restart sound
     */
    private restartEngine() {
        this.engineLevel = 1;
        this._shotState = PlaneShotState.Rocking;
    }


    // GETTERS & SETTERS
    // -----------------


    /**
     * Get the plane weapon.
     * @return {Weapon} Plane weapon
     */
    public get weapon(): Weapon {
        return this._weapon;
    }


    /**
     * Get the plane velocity.
     * @return {number} Plane velocity
     */
    public get velocity(): number {
        return this._velocity;
    }


    /**
     * Get the plane degree.
     * @return {number} Plane degree
     */
    public get degree(): number {
        return this._degree;
    }


    /**
     * Get the plane tint color in object format.
     * @return {number} Plane tint color in object format
     */
    public get tintColor(): Object {
        return this._tintColor;
    }


    /**
     * Get the plane tint color in hex format (0xRRGGBB).
     * @return {string} Plane tint color in hex format
     */
    public get tintHex(): number {
        return this._tintHex;
    }


    /**
     * Get the plane tint color in canvas style format.
     * @return {string} Plane tint color in canvas style format
     */
    public get tintStyle(): string {
        return this._tintStyle;
    }


    /**
     * Get current plane state.
     * @return {PlaneState} Current plane state
     * @see PlaneState
     */
    public get state(): PlaneState {
        return this._state;
    }


    /**
     * Get current plane direction.
     * @return {PlaneDirection} Current plane direction
     * @see PlaneDirection
     */
    public get direction(): PlaneDirection {
        return this._direction;
    }


    /**
     * Get plane index.
     * @return {number} Plane index
     */
    public get idx(): number {
        return this._idx;
    }


    /**
     * Get current slide position.
     * @return {number} Slide X position
     */
    public get crashSlidePos(): number {
        return this.crashSlideObj.x;
    }


    /**
     * Get screen X ratio
     * @return {number} Screen X ratio
     */
    public get screenRatio(): number {
        return 1 / (this.game.canvas.width / (this.body.x - this.game.camera.x));
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
    private onPlaneCrashed(e: any, f: any, g: any, h: any, i: boolean, j: any) {
        if (this._state == PlaneState.Flying && this.body.y > this.game.world.height - 100) {
            // crash the plane.
            // Crashed and RestartScheduled needed (in this order)
            // due to separation of frames in GameState.update()
            this._state = PlaneState.Crashed;

            // play sound if enabled
            if (Settings.IS_SOUND_ENABLED)
                this.explosion.play();

            // dispatch crash signal
            Signals.onCrashBottom.dispatch(this);

            // prepare the camera slide tween
            this.crashSlideObj.x = 1 / (this.game.world.width / this.body.x);
            this.crashSlideTween = this.game.add.tween(this.crashSlideObj);
            this.crashSlideTween.to({ x: this.startRatio }, Settings.GAME_RESTART_TIMEOUT, Phaser.Easing.Cubic.InOut);
            this.crashSlideTween.start();

            // prepare the restart timeout
            // used to wait until the camera slide is done
            this.restartTimeout = this.game.time.create();
            this.restartTimeout.add(Settings.GAME_RESTART_TIMEOUT, this.restart, this);
            this.restartTimeout.start();
        }
    }


}

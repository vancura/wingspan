/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


/**
 * Bullet.
 */
class Bullet extends Phaser.Sprite {


    private isInited:boolean;

    private _planeIdx:number;


    /**
     * Bullet constructor.
     * @param game Game reference
     * @param planeIdx Plane index
     * @constructor
     */
    constructor(game:Phaser.Game, planeIdx:number) {
        super(game, 0, 0, "game", "bullet.png");

        this.isInited         = false;
        this.checkWorldBounds = true;
        this.outOfBoundsKill  = true;
        this.exists           = false;
        this.name             = "bullet";
        this._planeIdx = planeIdx;
    }


    /**
     * Init.
     */
    init() {
        this.anchor.set(0.5);

        this.isInited = true;
    }


    /**
     * Fire the bullet.
     * @param x X position
     * @param y Y position
     * @param angle Angle in degrees
     * @param speed Speed
     */
    fire(x:number, y:number, angle:number, speed:number) {
        if (this.isInited) {
            this.reset(x, y);

            this.scale.set(1);

            this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

            this.angle    = angle;
            this.lifespan = Settings.PLANE_BULLET_LIFESPAN;

            this.body.gravity.set(0, 100);
        }
    }


    // GETTERS & SETTERS
    // -----------------


    /**
     * Get the index of plane which has fired this bullet.
     * @return {number} Plane index
     */
    public get planeIdx():number {
        return this._planeIdx;
    }


}

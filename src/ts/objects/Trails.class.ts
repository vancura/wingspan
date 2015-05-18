/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


/**
 * Trails.
 */
class Trails extends Phaser.Sprite {


    private bitmap:Phaser.BitmapData;
    private isInited:boolean;


    /**
     * Trails constructor.
     * @param game Game reference
     * @constructor
     */
    constructor(game:Phaser.Game) {
        this.bitmap = game.add.bitmapData(game.world.width, game.world.height);
        this.bitmap.fill(0, 0, 0, 1);

        super(game, 0, 0, this.bitmap);

        this.isInited  = false;
        this.blendMode = PIXI.blendModes.ADD;
    }


    /**
     * Init.
     * TODO: Kill this
     */
    init() {
        this.isInited = true;
    }


    /**
     * Draw trails.
     * @param plane Plane to draw a trail for
     * @param multiplier Distance multiplier (used when rotating)
     * @param color Color of the trail
     */
    draw(plane:Plane, multiplier:number, color:string) {
        var pos:number[];

        if (Settings.IS_TRAILS_RENDERING_ENABLED) {
            pos = Trails.getPositions(plane, multiplier);

            this.bitmap.fill(0, 0, 0, 0.05);
            this.bitmap.circle(pos[0], pos[1], Settings.PLANE_TRAIL_THICKNESS, color);
            this.bitmap.circle(pos[2], pos[3], Settings.PLANE_TRAIL_THICKNESS, color);
        }
    }


    // STATIC
    // ------


    /**
     * Get trail positions.
     * @param plane The plane
     * @param multiplier Distance multiplier (used when rotating)
     * @return Array of trail positions [x1, y1, x2, y2]
     */
    static getPositions(plane:Plane, multiplier:number):number[] {
        var x1:number, y1:number, x2:number, y2:number;
        var d:number, m:number;
        var out = null;

        if (Settings.IS_TRAILS_RENDERING_ENABLED) {
            d = plane.rotation * -1 - 90 * (Math.PI / 180);
            m = (typeof multiplier === "undefined") ? 0 : 1 - multiplier;

            x1 = Math.sin(d) * (Settings.MAX_TRAIL_DISTANCE * -m) + plane.body.x;
            y1 = Math.cos(d) * (Settings.MAX_TRAIL_DISTANCE * -m) + plane.body.y;
            x2 = Math.sin(d) * (Settings.MAX_TRAIL_DISTANCE * m) + plane.body.x;
            y2 = Math.cos(d) * (Settings.MAX_TRAIL_DISTANCE * m) + plane.body.y;

            out = [x1, y1, x2, y2];
        }

        return out;
    }


}

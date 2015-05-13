/**
 * Trails.
 */
(function () {
    "use strict";


    /**
     * Trails constructor.
     * @param game Game reference
     * @constructor
     */
    Trails = function (game) {
        this.bmpd = game.add.bitmapData(game.world.width, game.world.height);
        this.bmpd.fill(0, 0, 0, 1);

        Phaser.Sprite.call(this, game, 0, 0, this.bmpd);

        this.isInited = false;
        this.blendMode = PIXI.blendModes.ADD;
    };


    Trails.prototype = Object.create(Phaser.Sprite.prototype);
    Trails.prototype.constructor = Trails;


    Trails.prototype.init = function () {
        this.isInited = true;
    };


    /**
     * Get trail positions.
     * @param plane The plane
     * @param multiplier Distance multiplier (used when rotating)
     * @return Array of trail positions [x1, y1, x2, y2]
     */
    Trails.prototype.getPositions = function (plane, multiplier) {
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
    };


    /**
     * Draw trails.
     * @param plane Plane to draw a trail for
     * @param multiplier Distance multiplier (used when rotating)
     * @param color Color of the trail
     */
    Trails.prototype.draw = function (plane, multiplier, color) {
        if (Settings.IS_TRAILS_RENDERING_ENABLED) {
            var pos = this.getPositions(plane, multiplier);

            this.bmpd.fill(0, 0, 0, 0.05);
            this.bmpd.circle(pos[0], pos[1], Settings.PLANE_TRAIL_THICKNESS, color);
            this.bmpd.circle(pos[2], pos[3], Settings.PLANE_TRAIL_THICKNESS, color);
        }
    };


}());

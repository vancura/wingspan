/**
 * Trails.
 */
(function () {
    "use strict";


    /**
     * Trails constructor.
     * @param game Game reference
     * @param masterPlane Master plane reference
     * @constructor
     */
    Trails = function (game, masterPlane) {
        Phaser.Group.call(this, game, game.world, "trails");

        this.masterPlane = masterPlane;
        this.isInited = false;
    };


    Trails.prototype = Object.create(Phaser.Group.prototype);
    Trails.prototype.constructor = Trails;


    Trails.prototype.init = function () {
        var pos = this.getPositions(this.masterPlane);

        this.graphicsLeft = new Phaser.Graphics(this.game, 0, 0);
        this.graphicsRight = new Phaser.Graphics(this.game, 0, 0);

        this.add(this.graphicsLeft);
        this.add(this.graphicsRight);

        this.graphicsLeft.alpha = this.graphicsRight.alpha = 0.2;

        this.graphicsLeft.name = "trailLeft";
        this.graphicsRight.name = "trailRight";

        this.graphicsLeft.moveTo(pos[0], pos[1]);
        this.graphicsRight.moveTo(pos[2], pos[3]);

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
     * Reset trail positions.
     * Used after master plane crash.
     */
    Trails.prototype.reset = function () {
        var pos = this.getPositions(this.masterPlane);

        this.graphicsLeft.moveTo(pos[0], pos[1]);
        this.graphicsRight.moveTo(pos[2], pos[3]);
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

            this.graphicsLeft.lineStyle(1, color, 0.5);
            this.graphicsLeft.lineTo(pos[0], pos[1]);

            this.graphicsRight.lineStyle(1, color, 0.5);
            this.graphicsRight.lineTo(pos[2], pos[3]);
        }
    };


}());

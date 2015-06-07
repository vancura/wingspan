/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
/// <reference path="../data/Settings.class.ts" />
/// <reference path="Plane.class.ts"/>


/**
 * Plane offscreen marker.
 */
class PlaneOffscreenMarker extends Phaser.Group {


    private image:Phaser.Image;

    private plane:Plane;


    /**
     * Plane offscreen marker constructor.
     * @param game Game reference
     * @param plane Plane reference
     * @constructor
     */
    constructor(game:Phaser.Game, plane:Plane) {
        super(game, game.world, "marker");

        this.plane = plane;

        this.image = new Phaser.Image(this.game, 0, 0, "game", "gui/player-offscreen-up.png");
        this.image.fixedToCamera = true;
        this.image.anchor.set(0.5, 0);
        this.image.tint = plane.tintHex;

        this.add(this.image);
    }


    public update() {
        if (this.plane.state == PlaneState.Flying && this.plane.direction !== PlaneDirection.OnScreen) {
            this.image.visible = true;
            this.image.fixedToCamera = false;

            switch (this.plane.direction) {
                case PlaneDirection.Up:
                    this.image.frameName = "gui/player-offscreen-up.png"; // TODO: Caching last frame to optimize?
                    this.image.position.set(this.game.canvas.width * this.plane.screenRatio, 0);
                    this.image.anchor.set(0.5, 0);
                    break;

                case PlaneDirection.Left:
                    this.image.frameName = "gui/player-offscreen-left.png"; // TODO: Caching last frame to optimize?
                    this.image.position.set(0, this.plane.body.y);
                    this.image.anchor.set(0, 0.5);
                    break;

                case PlaneDirection.Right:
                    this.image.frameName = "gui/player-offscreen-right.png"; // TODO: Caching last frame to optimize?
                    this.image.position.set(this.game.canvas.width, this.plane.body.y);
                    this.image.anchor.set(1, 0.5);
                    break;
            }

            this.image.fixedToCamera = true;
        }

        else {
            // plane is crashed or on screen
            // no need to display markers
            this.image.visible = false;
        }
    }


}

///<reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
///<reference path="../data/Settings.class.ts" />
///<reference path="Plane.class.ts"/>


/**
 * Plane label.
 */
class PlaneLabel extends Phaser.Group {


    private label: Phaser.BitmapText;

    private plane: Plane;


    /**
     * Plane label constructor.
     * @param game Game reference
     * @param plane Plane reference
     * @constructor
     */
    constructor(game: Phaser.Game, plane: Plane) {
        super(game, game.world, "label");

        this.plane = plane;

        this.label = new Phaser.BitmapText(this.game, 0, 0, "futura-9", `PLANE ${this.plane.idx + 1}`, 9);
        this.label.tint = this.plane.tintHex;
        this.label.visible = false; // visible only when offscreen

        this.add(this.label);
    }


    public update() {
        var x: number, y: number;

        if (this.plane.state == PlaneState.Flying) {
            this.label.visible = true;

            x = Math.round(this.plane.position.x - this.label.width / 2);
            y = Math.round(this.plane.position.y) - 35;

            x = Phaser.Math.clamp(x, this.game.camera.x + 5, this.game.camera.x + this.game.canvas.width - 5 - this.label.width);
            y = Phaser.Math.clampBottom(y, 22);

            this.label.position.set(x, y);
            this.label.visible = !!(x < this.game.camera.x + 5 || x > this.game.camera.x + this.game.canvas.width - 5 - this.label.width || y < 22);
        }

        else {
            this.label.visible = false;
        }
    }


}

/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
/// <reference path="../data/Data.class.ts"/>
/// <reference path="../state/GameState.class.ts"/>
/// <reference path="PlaneLabel.class.ts"/>
/// <reference path="PlaneOffscreenMarker.class.ts"/>


/**
 * Ground Background.
 */
class GUI extends Phaser.Group {


    private planeOffscreenMarkerList: PlaneOffscreenMarker[] = [];
    private planeLabelList: PlaneLabel[] = [];
    private logo: Phaser.Image;
    private label: Phaser.BitmapText;


    constructor(game: Phaser.Game) {
        super(game, game.world, "gui");

        this.logo = new Phaser.Image(this.game, this.game.world.centerX, this.game.world.centerY - 20, "game", "gui/logo-1015.png");
        this.logo.anchor.set(0.5, 0.5);

        this.label = new Phaser.BitmapText(this.game, this.game.world.centerX, this.game.world.centerY - 150, "futura-16", "CREEPTOWN GAMES PRESENTS", 16);
        this.label.anchor.set(0.5, 0.5);
        this.label.tint = 0x010101;
        this.label.alpha = 0.5;

        this.addMultiple([this.logo, this.label]);
    }


    /**
     * Add a plane reference.
     * Used to display markers etc.
     * @param plane Plane reference
     */
    public addPlaneReference(plane: Plane) {
        var marker: PlaneOffscreenMarker = new PlaneOffscreenMarker(this.game, plane);
        var label: PlaneLabel = new PlaneLabel(this.game, plane);

        this.planeOffscreenMarkerList.push(marker);
        this.planeLabelList.push(label);

        this.add(marker);
        this.add(label);
    }


}

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


    constructor(game: Phaser.Game) {
        super(game, game.world, "gui");
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

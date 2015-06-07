/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
/// <reference path="../data/Data.class.ts"/>
/// <reference path="../state/GameState.class.ts"/>
/// <reference path="PlaneOffscreenMarker.class.ts"/>


/**
 * Ground Background.
 */
class GUI extends Phaser.Group {


    private scenicSingleModeButton:Phaser.Button;
    private scenicSingleModeLabel:Phaser.Image;
    private local2PlayersModeButton:Phaser.Button;
    private local2PlayersModeLabel:Phaser.Image;
    private remoteXPlayersModeButton:Phaser.Button;
    private remoteXPlayersModeLabel:Phaser.Image;
    private planeOffscreenMarkerList:PlaneOffscreenMarker[] = [];


    constructor(game:Phaser.Game) {
        super(game, game.world, "gui");

        // noinspection JSDeclarationsAtScopeStart
        var x:number = 0;

        x += this.createScenicSingleModeButton(x) + 5;
        x += this.createLocal2PlayersModeButton(x) + 5;
        this.createRemoteXPlayersModeButton(x);

        this.refresh();
    }


    /**
     * Refresh GUI.
     */
    public refresh() {
        this.scenicSingleModeButton.buttonMode = true;
        this.local2PlayersModeButton.buttonMode = true;
        this.remoteXPlayersModeButton.buttonMode = true;

        this.scenicSingleModeLabel.visible = false;
        this.local2PlayersModeLabel.visible = false;
        this.remoteXPlayersModeLabel.visible = false;

        switch (Data.gameMode) {
            case GameMode.ScenicSingle:
                this.scenicSingleModeButton.inputEnabled = false;
                this.scenicSingleModeLabel.visible = true;
                break;

            case GameMode.Local2Players:
                this.local2PlayersModeButton.inputEnabled = false;
                this.local2PlayersModeLabel.visible = true;
                break;

            case GameMode.RemoteXPlayers:
                this.remoteXPlayersModeButton.inputEnabled = false;
                this.remoteXPlayersModeLabel.visible = true;
                break;
        }
    }


    /**
     * Add a plane reference.
     * Used to display markers etc.
     * @param plane Plane reference
     */
    public addPlaneReference(plane:Plane) {
        // add a marker
        var marker:PlaneOffscreenMarker = new PlaneOffscreenMarker(this.game, plane);

        this.planeOffscreenMarkerList.push(marker);

        this.add(marker);
    }


    // PRIVATE
    // -------


    /**
     * Create the scenic single mode button
     * @param x Current x position
     * @return {number} Length
     */
    private createScenicSingleModeButton(x:number) {
        this.scenicSingleModeButton = new Phaser.Button(this.game, x, this.game.world.height, "game", this.switchGameModeState, this, "gui/scenic-single-over.png", "gui/scenic-single-out.png");
        this.scenicSingleModeButton.fixedToCamera = true;
        this.scenicSingleModeButton.anchor.y = 1;

        this.scenicSingleModeLabel = new Phaser.Image(this.game, x, this.game.world.height, "game", "gui/scenic-single-active.png");
        this.scenicSingleModeLabel.fixedToCamera = true;
        this.scenicSingleModeLabel.anchor.y = 1;
        this.scenicSingleModeLabel.visible = false;

        this.add(this.scenicSingleModeButton);
        this.add(this.scenicSingleModeLabel);

        return this.scenicSingleModeButton.width;
    }


    /**
     * Create the local two players mode button.
     * @param x Current x position
     * @return {number} Length
     */
    private createLocal2PlayersModeButton(x:number) {
        this.local2PlayersModeButton = new Phaser.Button(this.game, x, this.game.canvas.height, "game", this.switchGameModeState, this, "gui/local-2-players-over.png", "gui/local-2-players-out.png");
        this.local2PlayersModeButton.fixedToCamera = true;
        this.local2PlayersModeButton.anchor.y = 1;

        this.local2PlayersModeLabel = new Phaser.Image(this.game, x, this.game.canvas.height, "game", "gui/local-2-players-active.png");
        this.local2PlayersModeLabel.fixedToCamera = true;
        this.local2PlayersModeLabel.anchor.y = 1;
        this.local2PlayersModeLabel.visible = false;

        this.add(this.local2PlayersModeButton);
        this.add(this.local2PlayersModeLabel);

        return this.local2PlayersModeButton.width;
    }


    /**
     * Create the remote x players mode button.
     * @param x Current x position
     * @return {number} Length
     */
    private createRemoteXPlayersModeButton(x:number) {
        this.remoteXPlayersModeButton = new Phaser.Button(this.game, x, this.game.canvas.height, "game", this.switchGameModeState, this, "gui/remote-x-players-over.png", "gui/remote-x-players-out.png");
        this.remoteXPlayersModeButton.fixedToCamera = true;
        this.remoteXPlayersModeButton.anchor.y = 1;

        this.remoteXPlayersModeLabel = new Phaser.Image(this.game, x, this.game.canvas.height, "game", "gui/remote-x-players-active.png");
        this.remoteXPlayersModeLabel.fixedToCamera = true;
        this.remoteXPlayersModeLabel.anchor.y = 1;
        this.remoteXPlayersModeLabel.visible = false;

        this.add(this.remoteXPlayersModeButton);
        this.add(this.remoteXPlayersModeLabel);

        return this.remoteXPlayersModeButton.width;
    }


    /**
     * Switch game mode state.
     * @param e Button origin
     */
    private switchGameModeState(e:Phaser.Button) {
        switch (e) {
            case this.scenicSingleModeButton:
                Signals.onSwitchGameModeState.dispatch(GameMode.ScenicSingle);
                break;

            case this.local2PlayersModeButton:
                Signals.onSwitchGameModeState.dispatch(GameMode.Local2Players);
                break;

            case this.remoteXPlayersModeButton:
                Signals.onSwitchGameModeState.dispatch(GameMode.RemoteXPlayers);
                break;
        }

        this.refresh();
    }


}

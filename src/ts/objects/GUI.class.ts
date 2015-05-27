/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


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


    constructor(game:Phaser.Game) {
        var x = 0;

        super(game, game.world, "gui");

        this.scenicSingleModeButton               = new Phaser.Button(this.game, x, this.game.world.height, "game", this.switchGameModeState, this, "gui/scenic-single-over.png", "gui/scenic-single-out.png");
        this.scenicSingleModeButton.fixedToCamera = true;
        this.scenicSingleModeButton.anchor.y      = 1;

        this.scenicSingleModeLabel               = new Phaser.Image(this.game, x, this.game.world.height, "game", "gui/scenic-single-active.png");
        this.scenicSingleModeLabel.fixedToCamera = true;
        this.scenicSingleModeLabel.anchor.y      = 1;
        this.scenicSingleModeLabel.visible       = false;

        x += this.scenicSingleModeButton.width + 5;

        this.local2PlayersModeButton               = new Phaser.Button(this.game, x, this.game.world.height, "game", this.switchGameModeState, this, "gui/local-2-players-over.png", "gui/local-2-players-out.png");
        this.local2PlayersModeButton.fixedToCamera = true;
        this.local2PlayersModeButton.anchor.y      = 1;

        this.local2PlayersModeLabel               = new Phaser.Image(this.game, x, this.game.world.height, "game", "gui/local-2-players-active.png");
        this.local2PlayersModeLabel.fixedToCamera = true;
        this.local2PlayersModeLabel.anchor.y      = 1;
        this.local2PlayersModeLabel.visible       = false;

        x += this.local2PlayersModeButton.width + 5;

        this.remoteXPlayersModeButton               = new Phaser.Button(this.game, x, this.game.world.height, "game", this.switchGameModeState, this, "gui/remote-x-players-over.png", "gui/remote-x-players-out.png");
        this.remoteXPlayersModeButton.fixedToCamera = true;
        this.remoteXPlayersModeButton.anchor.y      = 1;

        this.remoteXPlayersModeLabel               = new Phaser.Image(this.game, x, this.game.world.height, "game", "gui/remote-x-players-active.png");
        this.remoteXPlayersModeLabel.fixedToCamera = true;
        this.remoteXPlayersModeLabel.anchor.y      = 1;
        this.remoteXPlayersModeLabel.visible       = false;

        this.add(this.scenicSingleModeButton);
        this.add(this.scenicSingleModeLabel);
        this.add(this.local2PlayersModeButton);
        this.add(this.local2PlayersModeLabel);
        this.add(this.remoteXPlayersModeButton);
        this.add(this.remoteXPlayersModeLabel);

        this.refresh();
    }


    public refresh() {
        this.scenicSingleModeButton.buttonMode   = true;
        this.local2PlayersModeButton.buttonMode  = true;
        this.remoteXPlayersModeButton.buttonMode = true;

        this.scenicSingleModeLabel.visible   = false;
        this.local2PlayersModeLabel.visible  = false;
        this.remoteXPlayersModeLabel.visible = false;

        switch (GameState.gameModeState) {
            case GameModeState.ScenicSingle:
                this.scenicSingleModeButton.inputEnabled = false;
                this.scenicSingleModeLabel.visible       = true;
                break;

            case GameModeState.Local2Players:
                this.local2PlayersModeButton.inputEnabled = false;
                this.local2PlayersModeLabel.visible       = true;
                break;

            case GameModeState.RemoteXPlayers:
                this.remoteXPlayersModeButton.inputEnabled = false;
                this.remoteXPlayersModeLabel.visible       = true;
                break;
        }
    }


    // PRIVATE
    // -------


    /**
     * Switch game mode state.
     * @param e Button origin
     */
    private switchGameModeState(e:Phaser.Button) {
        /*
         switch (e) {
         case this.scenicSingleModeButton:
         this._gameModeState = GameModeState.ScenicSingle;
         break;

         case this.local2PlayersModeButton:
         this._gameModeState = GameModeState.Local2Players;
         break;

         case this.remoteXPlayersModeButton:
         this._gameModeState = GameModeState.RemoteXPlayers;
         break;
         }

         this.refreshGUI();
         */
    }


}

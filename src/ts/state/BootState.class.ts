/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


class BootState extends Phaser.State {


    /**
     * Initialize the app.
     */
    init() {
        this.game.renderer["renderSession"].roundPixels = false;

        this.stage.backgroundColor = 0x000000;
        this.stage.smoothed = true;
        this.stage.disableVisibilityChange = false; // phaser will automatically pause if the browser tab the app is in loses focus

        this.input.maxPointers = 1; // unless you specifically know your app needs to support multi-touch

        this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;

        if (this.game.device.desktop)
            this.add.plugin(Phaser.Plugin["Debug"]);
    }


    /**
     * Preload (the preloader).
     */
    preload() {
        // this.load.image("preload-bar", "assets/preload-bar.png");
    }


    /**
     * Create.
     */
    create() {
        this.game.state.start("Preload");
    }


}

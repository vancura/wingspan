class BootState extends Phaser.State {


    private debug: any;


    /**
     * Initialize the app.
     */
    init(): void {
        this.game.renderer.renderSession.roundPixels = false;

        this.stage.backgroundColor = 0x000000;
        this.stage.smoothed = true;

        // phaser will automatically pause if the browser tab the app is in loses focus
        this.stage.disableVisibilityChange = false;

        // unless you specifically know your app needs to support multi-touch
        this.input.maxPointers = 1;

        this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;

        if (this.game.device.desktop) {
            /* tslint:disable no-string-literal */
            this.debug = this.add.plugin(Phaser.Plugin["Debug"]);
            /* tslint:enable no-string-literal */

            this.debug.panels.performance.toggle();
        }
    }


    /**
     * Preload (the preloader).
     */
    preload(): void {
        // this.load.image("preload-bar", "assets/preload-bar.png");
    }


    /**
     * Create.
     */
    create(): void {
        this.game.state.start("Preload");
    }


}

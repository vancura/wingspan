class App {


    private static game: Phaser.Game;


    /**
     * Master constructor.
     * @constructor
     */
    static init(): void {
        console.log("__________________________________________________________________________________________________________________________________________________________________________________");
        console.log("Wingspan version %VERSION%");

        this.game = new Phaser.Game(1280, 720, Phaser.AUTO, document.getElementById("app"), null, false, false);

        this.game.state.add("Boot", BootState);
        this.game.state.add("Preload", PreloadState);
        this.game.state.add("Game", GameState);

        this.game.state.start("Boot");
    }


}

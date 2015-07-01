///<reference path="../ts-vendor/phaser.comments.d.ts" />
///<reference path="state/BootState.class.ts" />
///<reference path='state/GameState.class.ts'/>
///<reference path='state/PreloadState.class.ts'/>


class App {


    private static game: Phaser.Game;


    /**
     * Master constructor.
     * @constructor
     */
    static init() {
        console.log("Wingspan version %VERSION%");

        this.game = new Phaser.Game(1280, 720, Phaser.AUTO, document.getElementById("app"), null, false, false);

        this.game.state.add("Boot", BootState);
        this.game.state.add("Preload", PreloadState);
        this.game.state.add("Game", GameState);

        this.game.state.start("Boot");
    }


}

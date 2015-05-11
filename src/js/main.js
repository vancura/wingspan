(function () {
    "use strict";


    signals = {
        onCrashBottom: new Phaser.Signal()
    };


    game = new Phaser.Game({
        width: 1280,
        height: 720,
        renderer: Phaser.AUTO,
        parent: document.getElementById("app"),
        transparent: false,
        antialias: false
    });


    game.state.add("Boot", BootState);
    game.state.add("Preload", PreloadState);
    game.state.add("Game", GameState);

    game.state.start("Boot");
}());

(function () {
    "use strict";


    // TODO: Move signals?
    signals = {
        onGoingLeft: new Phaser.Signal(),
        onGoingRight: new Phaser.Signal()
    };


    if (Cocoon.nativeAvailable) {
        Cocoon.Utils.setAntialias(false);
        Cocoon.Device.setOrientation(Cocoon.Device.Orientations.LANDSCAPE);
    }


    game = new Phaser.Game({
        width: "100%",
        height: 768,
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

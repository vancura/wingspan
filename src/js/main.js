(function () {
    "use strict";


    // TODO: Move signals?
    /*
    signals = {
        onGoingLeft: new Phaser.Signal(),
        onGoingRight: new Phaser.Signal()
    };
    */


    var w, h;

    if (Cocoon.nativeAvailable) {
        // Cocoon
        Cocoon.Utils.setAntialias(false);
        Cocoon.Device.setOrientation(Cocoon.Device.Orientations.LANDSCAPE);

        w = window.innerWidth * window.devicePixelRatio;
        h = window.innerHeight * window.devicePixelRatio;
    } else {
        // Everything else
        w = window.innerWidth;
        h = window.innerHeight / 1.2;
    }


    game = new Phaser.Game({
        width: w,
        height: h,
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

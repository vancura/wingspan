/**
 * Boot State.
 */
(function () {
    "use strict";


    BootState = function () {
    };


    BootState.prototype = {

        init: function () {
            this.game.renderer.renderSession.roundPixels = false;

            this.stage.backgroundColor = 0x000000;
            this.stage.smoothed = true;
            this.stage.disableVisibilityChange = false;

            this.input.maxPointers = 1;

            this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;

            if (!Cocoon.nativeAvailable) {
                this.add.plugin(Phaser.Plugin.Debug);
            }
        },


        create: function () {
            this.game.state.start("Preload");
        }


    };


}());


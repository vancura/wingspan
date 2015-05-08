/**
 * Boot State.
 */
(function () {
    "use strict";


    BootState = function () {
    };


    BootState.prototype = {


        /**
         * Init.
         */
        init: function () {
            this.game.renderer.renderSession.roundPixels = false;

            this.stage.backgroundColor = 0xf6f6f6;
            this.stage.smoothed = true;
            this.stage.disableVisibilityChange = false;

            this.input.maxPointers = 1;

            this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;

            if (!Cocoon.nativeAvailable) {
                this.add.plugin(Phaser.Plugin.Debug);
            }
        },


        /**
         * Create.
         * @return {[type]} [description]
         */
        create: function () {
            this.game.state.start("Preload");
        }


    };


}());

/**
 * Preload State.
 */
(function () {
    "use strict";


    PreloadState = function () {
    };


    PreloadState.prototype = {


        /**
         * Preload.
         */
        preload: function () {
            // CodePen
            // this.load.baseURL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1397/';
            // this.load.crossOrigin = 'anonymous';

            this.load.atlasJSONHash("game", "assets/game.png", "assets/game.json");
            this.load.audio("engineLoop", "assets/audio/PropEngineLoop1_02.wav");
        },


        /**
         * Create.
         */
        create: function () {
            this.game.state.start("Game");
        }


    };


}());

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
            this.load.audio("engineLoop", ["assets/audio/base-engine-loop.mp3", "assets/audio/base-engine-loop.ogg"]);
            this.load.audio("engineStress", ["assets/audio/base-engine-stress.mp3", "assets/audio/base-engine-stress.ogg"]);
            this.load.audio("gunshot", ["assets/audio/gunshot.mp3", "assets/audio/gunshot.ogg"]);
            this.load.audio("explosion", ["assets/audio/explosion.mp3", "assets/audio/explosion.ogg"]);
            this.load.audio("music-parapet", ["assets/audio/music-parapet.mp3", "assets/audio/music-parapet.ogg"]);
            this.load.image("forestBackground", "assets/forest-bg-1920x1080.jpg");
        },


        /**
         * Create.
         */
        create: function () {
            this.game.state.start("Game");
        }


    };


}());

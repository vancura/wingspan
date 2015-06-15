/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


class PreloadState extends Phaser.State {


    // private preloadBar:Phaser.Sprite;


    /**
     * Preload.
     */
    preload() {
        // CodePen
        // this.load.baseURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1397/";
        // this.load.crossOrigin = "anonymous";

        // this.preloadBar = this.add.sprite(0, 148, "preload-bar");
        // this.load.setPreloadSprite(this.preloadBar);
        // this.load.bitmapFont("stgotic", "assets/stgotic.png", "assets/stgotic.xml");

        this.load.atlasJSONHash("game", "assets/game.png", "assets/game.json");
        this.load.audio("engineLoop", ["assets/audio/base-engine-loop.mp3", "assets/audio/base-engine-loop.ogg"]);
        this.load.audio("engineStress", ["assets/audio/base-engine-stress.mp3", "assets/audio/base-engine-stress.ogg"]);
        this.load.audio("gunshot", ["assets/audio/gunshot.mp3", "assets/audio/gunshot.ogg"]);
        this.load.audio("explosion", ["assets/audio/explosion.mp3", "assets/audio/explosion.ogg"]);
        this.load.audio("music-parapet", ["assets/audio/music-parapet.mp3", "assets/audio/music-parapet.ogg"]);
        this.load.image("forestBackground", "assets/forest-bg-1920x1080.jpg");
        this.load.bitmapFont("standard-07_55", "assets/fonts/standard-07_55.png", "assets/fonts/standard-07_55.xml");
        this.load.bitmapFont("futura-9", "assets/fonts/futura-9.png", "assets/fonts/futura-9.xml");
        this.load.bitmapFont("futura-16", "assets/fonts/futura-16.png", "assets/fonts/futura-16.xml");
    }


    /**
     * Create.
     */
    create() {
        // var tween = this.add.tween(this.preloadBar).to({alpha: 0}, 300, Phaser.Easing.Linear.None, true);

        // tween.onComplete.add(function() {

        this.game.state.start("Game");

        // }, this);
    }


}

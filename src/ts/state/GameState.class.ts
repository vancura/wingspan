/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
/// <reference path="../data/Data.class.ts"/>
/// <reference path="../data/Enums.class.ts"/>
/// <reference path="../data/Settings.class.ts" />
/// <reference path="../objects/Bullet.class.ts" />
/// <reference path="../objects/GroundBack.class.ts" />
/// <reference path="../objects/GroundFront.class.ts" />
/// <reference path="../objects/GUI.class.ts"/>
/// <reference path="../objects/Plane.class.ts" />
/// <reference path="../objects/Trails.class.ts" />
/// <reference path="../objects/Weapon.class.ts" />


class GameState extends Phaser.State {


    private background:Phaser.Sprite;
    private fireGroup:Phaser.Group;
    private groundBack:GroundBack;
    private groundFront:GroundFront;
    private trails:Trails;
    private gui:GUI;

    private explosion:Phaser.Sound;
    private musicLoop:Phaser.Sound;

    private backpedalButtonP1:Phaser.Key;
    private backpedalButtonP2:Phaser.Key;
    private fireButtonP1:Phaser.Key;
    private fireButtonP2:Phaser.Key;
    private leftButtonP1:Phaser.Key;
    private leftButtonP2:Phaser.Key;
    private rightButtonP1:Phaser.Key;
    private rightButtonP2:Phaser.Key;
    private thrustButtonP1:Phaser.Key;
    private thrustButtonP2:Phaser.Key;

    private originalWidth:number;
    private restartTimeout:Phaser.Timer;
    private dieSlide:Phaser.Point;
    private planeList:Plane[] = [];


    /**
     * Init.
     */
    init():void {
        // setup physics
        this.physics.startSystem(Phaser.Physics.BOX2D);

        this.physics["box2d"].setBoundsToWorld(true, true, false, true);
        this.physics["box2d"].gravity.y = Settings.WORLD_GRAVITY;
        this.physics["box2d"].restitution = 0.4;

        if (Settings.IS_DEBUG_ENABLED) {
            this.game.physics["box2d"].debugDraw.shapes = true;
            this.game.physics["box2d"].debugDraw.joints = true;
            this.game.physics["box2d"].debugDraw.aabbs = true;
            this.game.physics["box2d"].debugDraw.pairs = true;
            this.game.physics["box2d"].debugDraw.centerOfMass = true;
        }

        // setup states
        Data.gameMode = GameMode.ScenicSingle;

        // setup other data
        this.dieSlide = new Phaser.Point();
    }


    /**
     * Create.
     */
    create() {
        this.createControls();
        this.createParallax();
        this.createBackground();
        this.createGroundBack();
        this.createPlanes();
        this.createSounds();
        this.createTrails();
        this.createFire();
        this.createGroundFront();
        this.createSignals();
        this.createGUI();
    }


    /**
     * Render.
     */
    render() {
        if (Settings.IS_DEBUG_ENABLED) {
            this.game.debug.box2dWorld();
            this.game.debug.cameraInfo(this.game.camera, 10, this.world.height - 82);
        }
    }


    /**
     * Update.
     */
    update() {
        switch (Data.gameMode) {
            case GameMode.ScenicSingle:
                this.updateScenicSingle();
                break;

            case GameMode.Local2Players:
                // FIXME: Implement
                break;

            case GameMode.RemoteXPlayers:
                // FIXME: Implement
                break;
        }
    }


    // PRIVATE
    // -------


    /**
     * Create the plane.
     * FIXME: More planes
     */
    private createPlanes() {
        var framePrefix:string;
        var trailColor:string;
        var plane:Plane;
        var a:number, count:number;

        if (Data.gameMode == GameMode.ScenicSingle)
            count = 1;

        for (a = 0; a < count; a++) {
            framePrefix = "plane1";
            trailColor = Settings.PLANE_TRAIL_COLOR_LIST[a];
            plane = new Plane(this.game, this.world.centerX + (a - 1) * 200, Settings.WORLD_OVERFLOW, framePrefix, trailColor, a);

            this.add.existing(plane);

            this.planeList.push(plane);
        }
    }


    /**
     * Create sounds. For the science!
     */
    private createSounds() {
        if (Settings.IS_MUSIC_ENABLED) {
            this.musicLoop = this.game.add.audio("music-parapet");
            this.musicLoop.play("", 0, 0.8, true);
        }

        if (Settings.IS_SOUND_ENABLED) {
            this.explosion = this.game.add.audio("explosion");
        }
    }


    /**
     * Start a crash slide.
     * FIXME: More planes
     */
    private startCrashSlide() {
        var slideTween;

        // prepare the restart timeout
        // used to wait until the camera slide is done
        this.restartTimeout = this.time.create();

        this.restartTimeout.add(Settings.GAME_RESTART_TIMEOUT, this.restart, this);
        this.restartTimeout.start();

        // prepare the camera slide tween
        this.dieSlide.x = 1 / (this.world.width / this.planeList[0].body.x);

        slideTween = this.add.tween(this.dieSlide);
        slideTween.to({x: 0.5}, Settings.GAME_RESTART_TIMEOUT, Phaser.Easing.Cubic.InOut);
        slideTween.start();
    }


    /**
     * Restart the game.
     */
    private restart() {
        // reset the plane position and rotation
        this.planeList[0].restart();
    }


    /**
     * Create trails.
     */
    private createTrails() {
        if (Settings.IS_TRAILS_RENDERING_ENABLED) {
            this.trails = new Trails(this.game);

            this.add.existing(this.trails);
        }
    }


    /**
     * Create fire.
     */
    private createFire() {
        this.fireGroup = new Phaser.Group(this.game, null, "fire", false, false);

        this.add.existing(this.fireGroup);
    }


    /**
     * Create controls.
     */
    private createControls() {
        switch (Data.gameMode) {
            case GameMode.ScenicSingle:
                this.leftButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
                this.rightButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
                this.thrustButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.UP);
                this.backpedalButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
                this.fireButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

                break;

            case GameMode.Local2Players:
                this.leftButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.A);
                this.rightButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.D);
                this.thrustButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.W);
                this.backpedalButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.S);
                this.fireButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.F);

                this.leftButtonP2 = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
                this.rightButtonP2 = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
                this.thrustButtonP2 = this.input.keyboard.addKey(Phaser.Keyboard.UP);
                this.backpedalButtonP2 = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
                this.fireButtonP2 = this.input.keyboard.addKey(Phaser.Keyboard.ALT);

                break;

            case GameMode.RemoteXPlayers:
                // FIXME: Implement

                break;
        }
    }


    /**
     * Create the background.
     */
    private createBackground() {
        this.background = this.add.sprite(0, 0, "forestBackground");
        this.background.name = "background";
        this.background.smoothed = true;

        this.background.scale.set(Math.min(1 / (this.world.width / this.background.width), 1 / (this.world.height / this.background.height)));

        this.background.fixedToCamera = true;
    }


    /**
     * Create ground in back.
     * It needs to be called separately to allow proper z-sorting.
     */
    private createGroundBack() {
        this.groundBack = new GroundBack(this.game);
    }


    /**
     * Create ground in front.
     * It needs to be called separately to allow proper z-sorting.
     */
    private createGroundFront() {
        this.groundFront = new GroundFront(this.game);
    }


    /**
     * Create the parallax effect.
     */
    private createParallax() {
        this.originalWidth = this.world.width;
        this.game.world.setBounds(0, 0, this.originalWidth * 2.2, this.world.height);
    }


    /**
     * Create signals.
     */
    private createSignals() {
        Signals.onCrashBottom.add(this.onPlaneCrashed, this);
        Signals.onSwitchGameModeState.add(this.onGameModeStateSwitched, this);
    }


    /**
     * Create GUI.
     */
    private createGUI() {
        this.gui = new GUI(this.game);
    }


    /**
     * Check bullet impacts.
     * @param e Bullet reference
     */
    private checkBullets(e:Bullet) {
        var i = 0;
        var plane;

        // check for all planes
        for (; i < this.planeList.length; i++) {
            plane = this.planeList[i];

            // but prevent this plane
            if (i !== e.planeIdx && e.overlap(plane)) {
                // the plane was shot
                plane.shoot();
            }
        }
    }


    /**
     * Update scenic single play mode.
     */
    private updateScenicSingle() {
        var plane:Plane = this.planeList[0];

        // check for crashed mode
        if (plane.state == PlaneState.Crashed) {
            // plane just crashed, but only in the last frame
            // since now the restart will be scheduled
            this.startCrashSlide();

            // state needs to be switched
            // currently it's PlayState.Crashed,
            // needs to reflect waiting for the restart
            // in another frame
            this.planeList[0].scheduleRestart();
        }

        // continue, but only if plane is not going to be restarted now
        else if (plane.state != PlaneState.RestartScheduled) {
            // turn sideways
            if (this.leftButtonP1.isDown && !this.rightButtonP1.isDown)
                plane.rotateLeft(1);
            else if (!this.leftButtonP1.isDown && this.rightButtonP1.isDown)
                plane.rotateRight(1);
            else
                plane.leaveRotation();

            // thrust or backpedal
            // after a while revert to original power
            if (this.thrustButtonP1.isDown)
                plane.thrust();
            else if (this.backpedalButtonP1.isDown)
                plane.backPedal();
            else
                plane.leaveThrust();

            // firing
            if (Settings.IS_PLANE_WEAPON_ENABLED && this.fireButtonP1.isDown)
                plane.weapon.fire(plane);

            // update offscreen arrows
            this.gui.updateOffscreenArrows(plane.y);

            // update trails
            this.trails.draw(plane);

            // check bullets
            plane.weapon.forEachAlive(this.checkBullets, this);
        }

        // update parallax
        this.updateParallax();
    }


    /**
     * Add a plane explosion.
     * @param x Plane X
     */
    private addPlaneExplosion(x:number) {
        var fire = new Phaser.Sprite(this.game, x, this.world.height, "game", "fire.png");
        var tween:Phaser.Tween;

        fire.anchor.set(0.5, 1);

        this.fireGroup.addChild(fire);

        // fadeout tween
        tween = this.add.tween(fire);

        tween.to({alpha: 0}, 1000);
        tween.onComplete.add(function () {
            fire.destroy();
        });

        tween.start();

        // play the explosion sound if enabled
        if (Settings.IS_SOUND_ENABLED)
            this.explosion.play();
    }


    /**
     * Handle parallax scrolling.
     * FIXME: More planes
     */
    private updateParallax() {
        var parallaxRatio;
        var plane:Plane = this.planeList[0];

        switch (plane.state) {
            case PlaneState.Flying:
                // playing mode
                parallaxRatio = 1 / (this.world.width / plane.body.x);
                break;

            case PlaneState.RestartScheduled:
                // sliding to start after the crash
                parallaxRatio = this.dieSlide.x;
                break;
        }

        // scroll now
        this.groundBack.scroll(parallaxRatio);
        this.groundFront.scroll(parallaxRatio);

        this.game.camera.x = (this.world.width - this.originalWidth) * parallaxRatio;
    }


    // EVENT LISTENERS
    // ---------------


    /**
     * Plane crash event handler.
     * @param e Plane reference
     */
    private onPlaneCrashed(e:Plane) {
        this.addPlaneExplosion(e.body.x);

        if (e === this.planeList[0]) {
            // sets the crashed state,
            // which is checked in future update()
            this.planeList[0].crash();
        }
    }


    /**
     * Game mode state switched from GUI.
     * @param {GameMode} e New game mode state
     * @see GameMode
     */
    private onGameModeStateSwitched(e:GameMode) {
        // FIXME: Game mode switch
    }


}

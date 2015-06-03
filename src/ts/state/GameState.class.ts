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

    private keyList:Phaser.Key[] = [];

    private originalWidth:number;
    private restartTimeout:Phaser.Timer;
    private crashSlide:Phaser.Point;
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
        Data.gameMode = GameMode.Local2Players;

        // setup other data
        this.crashSlide = new Phaser.Point();
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
                this.updateLocal2Players();
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
     */
    private createPlanes() {
        var framePrefix:string;
        var trailColor:string;
        var plane:Plane;
        var a:number, count:number, mx:number;

        switch (Data.gameMode) {
            case GameMode.ScenicSingle:
                // single player scenic mode has only one plane
                count = 1;
                break;

            case GameMode.Local2Players:
                // local two players mode has two planes
                count = 2;
                break;

            case GameMode.RemoteXPlayers:
                // FIXME: Implementation
                break;
        }

        for (a = 0; a < count; a++) {
            framePrefix = `plane${a + 1}`;
            trailColor = Settings.PLANE_TRAIL_COLOR_LIST[a];

            switch (Data.gameMode) {
                case GameMode.ScenicSingle:
                    // one plane starting in the middle of the screen
                    mx = this.world.centerX;
                    break;

                case GameMode.Local2Players:
                    // local two players starts with two planes
                    // in the middle of the screen,
                    // with a small distance between them
                    mx = this.world.centerX + (a === 0 ? -100 : 100);
                    break;

                case GameMode.RemoteXPlayers:
                    // FIXME: Implementation
                    break;
            }

            plane = new Plane(this.game, mx, Settings.WORLD_OVERFLOW, framePrefix, trailColor, a);

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
        this.crashSlide.x = 1 / (this.world.width / this.planeList[0].body.x);

        slideTween = this.add.tween(this.crashSlide);
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
        // this is awkward, but IMO it's the easiest method when
        // we need to share the logic across all game modes

        switch (Data.gameMode) {
            case GameMode.ScenicSingle:
            case GameMode.RemoteXPlayers:
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.LEFT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.RIGHT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.UP));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.DOWN));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR));

                break;

            case GameMode.Local2Players:
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.A));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.D));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.W));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.S));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.F));

                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.LEFT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.RIGHT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.UP));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.DOWN));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.ALT));

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

        // control the plane
        this.controlPlane(plane);

        // update parallax
        this.updateParallax();

        // update offscreen arrows
        this.gui.updateOffscreenArrows(plane);
    }


    /**
     * Update local two players play mode.
     */
    private updateLocal2Players() {
        var plane1:Plane = this.planeList[0];
        var plane2:Plane = this.planeList[1];

        /*
         // check for crashed mode
         if (plane1.state == PlaneState.Crashed) {
         // plane just crashed, but only in the last frame
         // since now the restart will be scheduled
         this.startCrashSlide();

         // state needs to be switched
         // currently it's PlayState.Crashed,
         // needs to reflect waiting for the restart
         // in another frame
         this.planeList[0].scheduleRestart();
         }
         */

        // continue, but only if plane is not going to be restarted now
        /*else*/

        // control planes
        this.controlPlane(plane1);
        this.controlPlane(plane2);

        // update parallax
        this.updateParallax();

        // update offscreen arrows
        this.gui.updateOffscreenArrows(plane1);
    }


    /**
     * Control a plane, but only if it's not going to be restarted now.
     * @param plane Plane to control
     */
    private controlPlane(plane:Plane) {
        // this is awkward, but IMO it's the easiest method when
        // we need to share the logic across all game modes
        // keyList[idx * 5 + 0] = left
        // keyList[idx * 5 + 1] = right
        // keyList[idx * 5 + 2] = thrust
        // keyList[idx * 5 + 3] = backpedal
        // keyList[idx * 5 + 4] = fire

        if (plane.state != PlaneState.RestartScheduled) {
            // turn sideways
            if (this.keyList[plane.idx * 5].isDown && !this.keyList[plane.idx * 5 + 1].isDown) plane.rotateLeft(1); // left && !right
            else if (!this.keyList[plane.idx * 5].isDown && this.keyList[plane.idx * 5 + 1].isDown) plane.rotateRight(1); // !left && right
            else plane.leaveRotation();

            // thrust or backpedal
            // after a while revert to original power
            if (this.keyList[plane.idx * 5 + 2].isDown) plane.thrust();
            else if (this.keyList[plane.idx * 5 + 3].isDown) plane.backPedal();
            else plane.leaveThrust();

            // firing
            if (Settings.IS_PLANE_WEAPON_ENABLED && this.keyList[plane.idx * 5 + 4].isDown) plane.weapon.fire(plane);

            // update trails
            this.trails.draw(plane);

            // check bullets
            plane.weapon.forEachAlive(this.checkBullets, this);
        }
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
        // if main plane is flying, set the parallax ratio to it's distance in world, 0..1
        // otherwise use the crash slide value (plane crashed)
        var parallaxRatio:number = this.planeList[0].state === PlaneState.Flying ? 1 / (this.world.width / this.planeList[0].body.x) : this.crashSlide.x;

        if (Data.gameMode == GameMode.Local2Players) {
            // in local two players mode we need
            // to calculate both positions
            // and find the middle
            // var parallaxRatio2 = this.planeList[1].state === PlaneState.Flying ? 1 / (this.world.width / this.planeList[1].body.x) : this.crashSlide.x;
            // FIXME: crash slide calculation
            parallaxRatio = (parallaxRatio + 1 / (this.world.width / this.planeList[1].body.x)) / 2;
        }

        // scroll now
        if (parallaxRatio >= 0 && parallaxRatio <= 1) {
            this.groundBack.scroll(parallaxRatio);
            this.groundFront.scroll(parallaxRatio);

            this.game.camera.x = (this.world.width - this.originalWidth) * parallaxRatio;
        }
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

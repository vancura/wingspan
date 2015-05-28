/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
/// <reference path="../data/Settings.class.ts" />
/// <reference path="../objects/Bullet.class.ts" />
/// <reference path="../objects/GroundBack.class.ts" />
/// <reference path="../objects/GroundFront.class.ts" />
/// <reference path="../objects/Plane.class.ts" />
/// <reference path="../objects/Trails.class.ts" />
/// <reference path="../objects/Weapon.class.ts" />


class GameState extends Phaser.State {


    private background:Phaser.Sprite;
    private fireGroup:Phaser.Group;
    private groundBack:GroundBack;
    private groundFront:GroundFront;
    private player1Plane:Plane;
    private player2Plane:Plane;
    private trails:Trails;
    private gui:GUI;

    private engineLoop:Phaser.Sound;
    private engineStress:Phaser.Sound;
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

    private static _gameModeState:GameModeState;
    private static _planeList:Plane[] = [];
    private static _player1State:PlayState;


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
        GameState._gameModeState = GameModeState.ScenicSingle;
        GameState._player1State = PlayState.Init;

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

        GameState._player1State = PlayState.Playing;
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
        switch (GameState.gameModeState) {
            case GameModeState.ScenicSingle:
                // single scenic mode

                this.updatePlane1();

                break;

            case GameModeState.Local2Players:
                // local two player mode

                this.updatePlane1();
                this.updatePlane2();

                break;

            case GameModeState.RemoteXPlayers:
                // remote x players mode

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
        var plane:Plane;
        var a:number;

        switch (GameState.gameModeState) {
            case GameModeState.ScenicSingle:
                // single scenic mode

                plane = this.createSinglePlane(0);
                this.add.existing(plane);
                GameState._planeList.push(plane);

                this.player1Plane = GameState._planeList[0];

                break;

            case GameModeState.Local2Players:
                // local two player mode

                for (a = 0; a < 2; a++) {
                    plane = this.createSinglePlane(a);
                    this.add.existing(plane);
                    GameState._planeList.push(plane);
                }

                this.player1Plane = GameState._planeList[0];
                this.player2Plane = GameState._planeList[1];

                break;

            case GameModeState.RemoteXPlayers:
                // remote x players mode

                // FIXME: Implement

                break;
        }
    }


    /**
     * Create a single plane.
     * @param idx Plane index
     * @return {Plane} Plane just created
     */
    private createSinglePlane(idx) {
        var framePrefix:string;
        var trailColor:string;
        var plane:Plane;

        framePrefix = (idx === 0) ? "plane1" : "plane2"; // TODO: More planes
        trailColor = Settings.PLANE_TRAIL_COLOR_LIST[idx];
        plane = new Plane(this.game, this.world.centerX + (idx - 1) * 200, Settings.WORLD_OVERFLOW, framePrefix, trailColor, idx);

        return plane;
    }


    /**
     * Create sounds. For the science!
     */
    private createSounds() {
        if (Settings.IS_SOUND_ENABLED) {
            this.engineLoop = this.game.add.audio("engineLoop");
            this.engineLoop.play("", 0, 0, true);

            this.engineStress = this.game.add.audio("engineStress");
            this.engineStress.play("", 0, 0, true);

            this.musicLoop = this.game.add.audio("music-parapet");
            this.musicLoop.play("", 0, 0.8, true);

            this.explosion = this.game.add.audio("explosion");
        }
    }


    /**
     * Time to die.
     */
    private die() {
        var slideTween;

        // prepare the restart timeout
        // used to wait until the camera slide is done
        this.restartTimeout = this.time.create();

        this.restartTimeout.add(Settings.GAME_RESTART_TIMEOUT, this.restart, this);
        this.restartTimeout.start();

        // prepare the camera slide tween
        this.dieSlide.x = 1 / (this.world.width / this.player1Plane.body.x);

        slideTween = this.add.tween(this.dieSlide);
        slideTween.to({x: 0.5}, Settings.GAME_RESTART_TIMEOUT, Phaser.Easing.Cubic.InOut);
        slideTween.start();

        // state needs to be switched
        // currently it's PlayState.Died, needs to reflect waiting for the restart
        GameState._player1State = PlayState.RestartScheduled;

        // TODO: Player 2
    }


    /**
     * Restart the game.
     */
    private restart() {
        // playing again
        GameState._player1State = PlayState.Playing;

        // reset the plane position and rotation
        this.player1Plane.restart();
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
        switch (GameState.gameModeState) {
            case GameModeState.ScenicSingle:
                // single scenic mode

                this.leftButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
                this.rightButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
                this.thrustButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.UP);
                this.backpedalButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
                this.fireButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

                break;

            case GameModeState.Local2Players:
                // local two player mode

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

            case GameModeState.RemoteXPlayers:
                // remote x players mode

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
        for (; i < GameState._planeList.length; i++) {
            plane = GameState._planeList[i];

            // but prevent this plane
            if (i !== e.planeIdx && e.overlap(plane)) {
                // the plane was shot
                plane.shoot();
            }
        }
    }


    /**
     * Update player 1 plane.
     */
    private updatePlane1() {
        var planeVelocity;

        // check for dying mode
        if (GameState._player1State == PlayState.Died)
            this.die();

        // turn sideways
        if (this.leftButtonP1.isDown && !this.rightButtonP1.isDown)
            this.player1Plane.rotateLeft(1);
        else if (!this.leftButtonP1.isDown && this.rightButtonP1.isDown)
            this.player1Plane.rotateRight(1);
        else
            this.player1Plane.leaveRotation();

        // thrust or backpedal
        // after a while revert to original power
        if (this.thrustButtonP1.isDown)
            this.player1Plane.thrust();
        else if (this.backpedalButtonP1.isDown)
            this.player1Plane.backPedal();
        else
            this.player1Plane.leaveThrust();

        // firing
        if (Settings.IS_PLANE_WEAPON_ENABLED && this.fireButtonP1.isDown)
            this.player1Plane.weapon.fire(this.player1Plane);

        // sounds
        if (Settings.IS_SOUND_ENABLED) {
            planeVelocity = this.player1Plane.velocity / 60;

            this.engineLoop.volume = 1 - planeVelocity / 2;
            this.engineStress.volume = planeVelocity / 4;
        }

        // update parallax
        this.updateParallax();

        // update offscreen arrows
        this.gui.updateOffscreenArrows(this.player1Plane.y);

        // update trails
        this.trails.draw(this.player1Plane);

        // check bullets
        this.player1Plane.weapon.forEachAlive(this.checkBullets, this);
    }


    /**
     * Update player 2 plane.
     */
    private updatePlane2() {
        // turn sideways
        if (this.leftButtonP2.isDown && !this.rightButtonP2.isDown)
            this.player2Plane.rotateLeft(1);
        else if (!this.leftButtonP2.isDown && this.rightButtonP2.isDown)
            this.player2Plane.rotateRight(1);
        else
            this.player2Plane.leaveRotation();

        // thrust or backpedal
        // after a while revert to original power
        if (this.thrustButtonP2.isDown)
            this.player2Plane.thrust();
        else if (this.backpedalButtonP2.isDown)
            this.player2Plane.backPedal();
        else
            this.player2Plane.leaveThrust();

        // firing
        if (Settings.IS_PLANE_WEAPON_ENABLED && this.fireButtonP2.isDown)
            this.player2Plane.weapon.fire(this.player2Plane);

        // update trails
        this.trails.draw(this.player2Plane);

        // check bullets
        this.player2Plane.weapon.forEachAlive(this.checkBullets, this);
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
     */
    private updateParallax() {
        var parallaxRatio;

        switch (GameState._player1State) {
            case PlayState.Playing:
                // playing mode
                parallaxRatio = 1 / (this.world.width / this.player1Plane.body.x);
                break;

            case PlayState.RestartScheduled:
                // sliding to start
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

        if (e === this.player1Plane)
            GameState._player1State = PlayState.Died;
    }


    /**
     * Game mode state switched from GUI.
     * @param {GameModeState} e New game mode state
     * @see GameModeState
     */
    private onGameModeStateSwitched(e:GameModeState) {
        // TODO: Game mode switch
    }


    // GETTERS & SETTERS
    // -----------------


    /**
     * Get the plane list.
     * @return {Plane[]} Plane list
     * @see Plane
     */
    public static get planeList():Plane[] {
        return this._planeList;
    }


    /**
     * Get current game mode state.
     * @return {GameModeState} Current game mode state
     * @see GameModeState
     */
    public static get gameModeState():GameModeState {
        return GameState._gameModeState;
    }


    /**
     * Get current player 1 state.
     * @return {PlayState} Current planer 1 state
     * @see PlayState
     */
    public static get player1State():PlayState {
        return this._player1State;
    }


}


const enum PlayState {
    Init = 0,
    Playing,
    Died,
    RestartScheduled
}


const enum GameModeState {
    ScenicSingle,
    Local2Players,
    RemoteXPlayers
}

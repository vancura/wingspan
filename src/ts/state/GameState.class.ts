/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


class GameState extends Phaser.State {


    private player1Plane:Plane;
    private player2Plane:Plane;
    private engineLoop:Phaser.Sound;
    private engineStress:Phaser.Sound;
    private musicLoop:Phaser.Sound;
    private explosion:Phaser.Sound;
    private trails:Trails;
    private fire:Phaser.Sprite;
    private leftButtonP1:Phaser.Key;
    private rightButtonP1:Phaser.Key;
    private thrustButtonP1:Phaser.Key;
    private backpedalButtonP1:Phaser.Key;
    private fireButtonP1:Phaser.Key;
    private leftButtonP2:Phaser.Key;
    private rightButtonP2:Phaser.Key;
    private thrustButtonP2:Phaser.Key;
    private backpedalButtonP2:Phaser.Key;
    private fireButtonP2:Phaser.Key;
    private background:Phaser.Sprite;
    private groundBack:GroundBack;
    private groundFront:GroundFront;
    private originalWidth:number;
    private isRestartRequested:boolean;

    private static _planeList:Plane[] = [];


    /**
     * Init.
     */
    init():void {
        this.physics.startSystem(Phaser.Physics.BOX2D);

        this.physics["box2d"].setBoundsToWorld(true, true, false, true);

        this.physics["box2d"].gravity.y   = Settings.WORLD_GRAVITY;
        this.physics["box2d"].restitution = 0.4;

        if (Settings.IS_DEBUG_ENABLED) {
            this.game.physics["box2d"].debugDraw.shapes       = true;
            this.game.physics["box2d"].debugDraw.joints       = true;
            this.game.physics["box2d"].debugDraw.aabbs        = true;
            this.game.physics["box2d"].debugDraw.pairs        = true;
            this.game.physics["box2d"].debugDraw.centerOfMass = true;
        }

        // when restart is needed this is true
        // handled in this.update()
        this.isRestartRequested = false;
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
        var plane:Plane;
        var a:number;

        this.updatePlane1();
        this.updatePlane2();

        for (a = 0; a < GameState.planeList.length; a++) {
            plane = GameState.planeList[a];

            // draw trails, calculate the distance multiplier
            // 0.1 to prevent merging lines
            this.trails.draw(plane, 1 - Math.abs(plane.degree / Settings.PLANE_KEYBOARD_ROTATION_STEP) - 0.1, plane.trailColor);

            // check bullets
            plane.weapon.forEachAlive(this.checkBullets, this);
        }
    }


    // GETTERS & SETTERS
    // -----------------


    /**
     * Get the plane list.
     * @return {any} Plane list
     */
    public static get planeList():Plane[] {
        return this._planeList;
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
        var a:number;

        for (a = 0; a < Settings.PLANE_COUNT; a++) {
            framePrefix = (a === 0) ? "plane1" : "plane2"; // TODO: More planes
            trailColor = Settings.PLANE_TRAIL_COLOR_LIST[a];
            plane      = new Plane(this.game, this.world.centerX + (a - 1) * 200, Settings.WORLD_OVERFLOW, framePrefix, trailColor, a);

            this.add.existing(plane);

            GameState.planeList.push(plane);

            plane.init();

            // set the player 1 plane
            if (a === 0)
                this.player1Plane = plane;

            // set the player 2 plane
            if (a === 1)
                this.player2Plane = plane;
        }
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
     * Restart after crash.
     */
    private restart() {
        if (this.player1Plane) {
            this.isRestartRequested = false;

            // reset the plane position and rotation
            this.player1Plane.restart();

            // TODO: Player 2
        }
    }


    /**
     * Create trails.
     */
    private createTrails() {
        if (Settings.IS_TRAILS_RENDERING_ENABLED) {
            this.trails = new Trails(this.game);
            this.trails.init();

            this.add.existing(this.trails);
        }
    }


    /**
     * Create fire.
     */
    private createFire() {
        this.fire       = this.add.sprite(0, this.world.height, "game", "fire.png");
        this.fire.alpha = 0;
        this.fire.name  = "fire";

        this.fire.anchor.set(0.5, 1);
    }


    /**
     * Create controls.
     */
    private createControls() {
        this.leftButtonP1      = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.rightButtonP1     = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.thrustButtonP1    = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.backpedalButtonP1 = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.fireButtonP1      = this.input.keyboard.addKey(Phaser.Keyboard.F);

        this.leftButtonP2      = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightButtonP2     = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.thrustButtonP2    = this.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.backpedalButtonP2 = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.fireButtonP2      = this.input.keyboard.addKey(Phaser.Keyboard.ALT);
    }


    /**
     * Create the background.
     */
    private createBackground() {
        this.background          = this.add.sprite(0, 0, "forestBackground");
        this.background.name     = "background";
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
        this.groundBack.init();
    }


    /**
     * Create ground in front.
     * It needs to be called separately to allow proper z-sorting.
     */
    private createGroundFront() {
        this.groundFront = new GroundFront(this.game);
        this.groundFront.init();
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
    }


    /**
     * Check bullet impacts.
     * @param e Bullet reference
     */
    private checkBullets(e:Bullet) {
        var i = 0;
        var plane;

        // check for all planes
        for (; i < GameState.planeList.length; i++) {
            plane = GameState.planeList[i];

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
        var parallaxRatio;

        // check for restart mode
        if (this.isRestartRequested)
            this.restart();

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
            planeVelocity = this.player1Plane.vel / 60;

            this.engineLoop.volume   = 1 - planeVelocity / 2;
            this.engineStress.volume = planeVelocity / 4;
        }

        // handle parallax scrolling
        parallaxRatio = 1 / (this.world.width / this.player1Plane.body.x);

        this.groundBack.scroll(parallaxRatio);
        this.groundFront.scroll(parallaxRatio);

        this.game.camera.x = (this.world.width - this.originalWidth) * parallaxRatio;
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
    }


    // EVENT LISTENERS
    // ---------------


    /**
     * Plane crash event handler.
     * @param e Plane reference
     */
    private onPlaneCrashed(e) {
        // TODO: Multiple fires

        var tween:Phaser.Tween;

        this.fire.x     = e.body.x;
        this.fire.alpha = 1;

        tween = this.add.tween(this.fire);

        tween.to({alpha: 0}, 1000);
        tween.start();

        if (Settings.IS_SOUND_ENABLED)
            this.explosion.play();

        if (e === this.player1Plane)
            this.isRestartRequested = true;

        // TODO: Player 2
    }


}

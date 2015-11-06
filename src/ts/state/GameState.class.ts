///<reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
///<reference path="../data/Data.class.ts"/>
///<reference path="../data/Enums.class.ts"/>
///<reference path="../data/Settings.class.ts" />
///<reference path="../objects/Bullet.class.ts" />
///<reference path="../objects/GroundBack.class.ts" />
///<reference path="../objects/GroundFront.class.ts" />
///<reference path="../objects/GUI.class.ts"/>
///<reference path="../objects/Plane.class.ts" />
///<reference path="../objects/Trails.class.ts" />
///<reference path="../objects/Weapon.class.ts" />


class GameState extends Phaser.State {


    private background: Phaser.Sprite;
    private fireGroup: Phaser.Group;
    private groundBack: GroundBack;
    private groundFront: GroundFront;
    private trails: Trails;
    private gui: GUI;

    private musicLoop: Phaser.Sound;

    private keyList: Phaser.Key[] = [];
    private hackKey: Phaser.Key;

    private originalWidth: number;
    private planeList: Plane[] = [];
    private hackKeyTimeout: Phaser.Timer;
    private isHackKeyEnabled: boolean = true;
    private emitter: Phaser.Particles.Arcade.Emitter;


    /**
     * Init.
     */
    init(): void {
        // setup physics
        this.physics.startSystem(Phaser.Physics.BOX2D);

        this.physics.box2d.setBoundsToWorld(true, true, false, true);
        this.physics.box2d.gravity.y = Settings.WORLD_GRAVITY;
        this.physics.box2d.restitution = 0.4;

        if (Settings.IS_DEBUG_ENABLED) {
            this.game.physics.box2d.debugDraw.shapes = true;
            this.game.physics.box2d.debugDraw.joints = true;
            this.game.physics.box2d.debugDraw.aabbs = true;
            this.game.physics.box2d.debugDraw.pairs = true;
            this.game.physics.box2d.debugDraw.centerOfMass = true;
        }

        // setup states
        Data.gameMode = GameMode.Local2Players;
    }


    /**
     * Create.
     */
    create(): void {
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
    render(): void {
        if (Settings.IS_DEBUG_ENABLED) {
            this.game.debug.box2dWorld();
            this.game.debug.cameraInfo(this.game.camera, 10, this.world.height - 82);
        }
    }


    /**
     * Update.
     */
    update(): void {
        var i: number = 0;
        var plane: Plane;

        // check for all planes
        for (; i < this.planeList.length; i++) {
            plane = this.planeList[i];

            // control the plane
            this.controlPlane(plane);

            // update parallax
            this.updateParallax();
        }

        // check the hack key
        if (this.isHackKeyEnabled && this.hackKey.isDown) {
            console.log("Hackityhack");

            // handle the timeout to prevent another immediate hack
            this.isHackKeyEnabled = false;

            var fn: Function = function(): void {
                this.isHackKeyEnabled = true;
            };

            this.hackKeyTimeout = this.game.time.create(false);
            this.hackKeyTimeout.add(100, fn, this);

            this.hackKeyTimeout.start();

            // process the hack now
            this.planeList[0].shoot();
        }
    }


    /**
     * Create controls.
     */
    private createControls(): void {
        // this is awkward, but IMO it's the easiest method when
        // we need to share the logic across all game modes

        switch (Data.gameMode) {
            case GameMode.ScenicSingle:
            case GameMode.RemoteXPlayers:
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.LEFT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.RIGHT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.UP));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.DOWN));

                break;

            case GameMode.Local2Players:
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.A));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.D));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.W));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.S));

                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.LEFT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.RIGHT));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.UP));
                this.keyList.push(this.input.keyboard.addKey(Phaser.Keyboard.DOWN));

                break;
        }

        // prepare the hackkey
        this.hackKey = this.input.keyboard.addKey(Phaser.Keyboard.F15);
    }


    /**
     * Create the parallax effect.
     */
    private createParallax(): void {
        this.originalWidth = this.world.width;
        this.game.world.setBounds(0, 0, this.originalWidth * 2.2, this.world.height);
    }


    /**
     * Create the background.
     */
    private createBackground(): void {
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
    private createGroundBack(): void {
        this.groundBack = new GroundBack(this.game);
    }


    /**
     * Create the plane.
     */
    private createPlanes(): void {
        var framePrefix: string;
        var tintColor: string;
        var plane: Plane;
        var a: number, count: number, sr: number;

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
            tintColor = Settings.PLANE_TINT_COLOR_LIST[a];

            switch (Data.gameMode) {
                case GameMode.ScenicSingle:
                    // one plane starting in the middle of the screen
                    sr = 0.5;
                    break;

                case GameMode.Local2Players:
                    // local two players starts with two planes
                    // in the middle of the screen,
                    // with a small distance between them
                    sr = 0.5 + (a === 0 ? -0.1 : 0.1);
                    break;

                case GameMode.RemoteXPlayers:
                    // FIXME: Implementation
                    break;
            }

            plane = new Plane(this.game, sr, framePrefix, tintColor, a);

            // add to stage
            this.add.existing(plane);

            // add to list
            this.planeList.push(plane);
        }
    }


    /**
     * Create sounds. For the science!
     */
    private createSounds(): void {
        if (Settings.IS_MUSIC_ENABLED) {
            this.musicLoop = this.game.add.audio("music-parapet");
            this.musicLoop.play("", 0, 0.8, true);
        }
    }


    /**
     * Create trails.
     */
    private createTrails(): void {
        if (Settings.IS_TRAILS_RENDERING_ENABLED) {
            this.trails = new Trails(this.game);

            this.add.existing(this.trails);
        }
    }


    /**
     * Create fire.
     */
    private createFire(): void {
        // create fire sprite
        this.fireGroup = new Phaser.Group(this.game, null, "fire", false, false);

        this.add.existing(this.fireGroup);

        // create splosion emitter
        this.emitter = this.game.add.emitter(this.game.world.centerX, this.game.world.centerY + 330);

        this.emitter.makeParticles("game", [
            "shrapnel/s1.png",
            "shrapnel/s2.png",
            "shrapnel/s3.png",
            "shrapnel/s4.png",
            "shrapnel/s5.png",
            "shrapnel/s6.png",
            "shrapnel/s7.png",
            "shrapnel/s8.png",
            "shrapnel/s9.png",
            "shrapnel/s10.png"
        ]);

        this.emitter.gravity = 150;
        this.emitter.minParticleScale = 0.5;
        this.emitter.maxParticleScale = 1.2;
        this.emitter.maxParticleSpeed.setTo(120, -210);
    }


    /**
     * Create ground in front.
     * It needs to be called separately to allow proper z-sorting.
     */
    private createGroundFront(): void {
        this.groundFront = new GroundFront(this.game);
    }


    /**
     * Create signals.
     */
    private createSignals(): void {
        Signals.onCrashBottom.add(this.onPlaneCrashed, this);
    }


    /**
     * Create GUI.
     */
    private createGUI(): void {
        var i: number = 0;
        var plane: Plane;

        this.gui = new GUI(this.game);

        // check for all planes
        for (; i < this.planeList.length; i++) {
            plane = this.planeList[i];

            // add offscreen markers and other gui elements
            this.gui.addPlaneReference(plane);
        }
    }


    /**
     * Check bullet impacts.
     * @param e Bullet reference
     */
    private checkBullets(e: Bullet): void {
        var i: number = 0;
        var plane: Plane;

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
     * Control a plane, but only if it's not going to be restarted now.
     * @param plane Plane to control
     */
    private controlPlane(plane: Plane): void {
        // this is awkward, but IMO it's the easiest method when
        // we need to share the logic across all game modes
        // keyList[idx * 4 + 0] = left
        // keyList[idx * 4 + 1] = right
        // keyList[idx * 4 + 2] = thrust
        // keyList[idx * 4 + 3] = fire

        if (plane.state === PlaneState.Flying) {
            // turn sideways
            if (this.keyList[plane.idx * 4].isDown && !this.keyList[plane.idx * 4 + 1].isDown) plane.rotateLeft(1); // left && !right
            else if (!this.keyList[plane.idx * 4].isDown && this.keyList[plane.idx * 4 + 1].isDown) plane.rotateRight(1); // !left && right
            else plane.leaveRotation();

            // thrust or backpedal
            // after a while revert to original power
            if (this.keyList[plane.idx * 4 + 2].isDown) plane.thrustUp();
            else plane.thrustDown();

            // firing
            if (Settings.IS_PLANE_WEAPON_ENABLED && this.keyList[plane.idx * 4 + 3].isDown) plane.weapon.fire(plane);

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
    private addPlaneExplosion(x: number): void {
        // add fire
        var fire: Phaser.Sprite = new Phaser.Sprite(this.game, x, this.world.height, "game", "fire.png");
        var tween: Phaser.Tween;

        fire.anchor.set(0.5, 1);
        fire.blendMode = PIXI.blendModes.ADD;

        this.fireGroup.addChild(fire);

        // fadeout tween
        tween = this.add.tween(fire);

        tween.to({ alpha: 0 }, 1500);
        tween.onComplete.add(function(): void {
            fire.destroy();
        });

        tween.start();

        // start the splosion
        this.emitter.x = x;
        this.emitter.start(true, 3000, 5, 1000);
    }


    /**
     * Handle parallax scrolling.
     */
    private updateParallax(): void {
        var r: number, rp1: number, rp2: number;

        // if main plane is flying, set the parallax ratio to it's distance in world, 0..1
        // otherwise use the crash slide value (plane crashed)
        rp1 = this.planeList[0].state === PlaneState.Flying ? 1 / (this.world.width / this.planeList[0].body.x) : this.planeList[0].crashSlidePos;

        switch (Data.gameMode) {
            case GameMode.ScenicSingle:
                // in single scenic mode we have only one plane
                r = rp1;
                break;

            case GameMode.Local2Players:
                // in local two players mode we need to calculate both positions and find the middle
                rp2 = this.planeList[1].state === PlaneState.Flying ? 1 / (this.world.width / this.planeList[1].body.x) : this.planeList[1].crashSlidePos;
                r = (rp1 + rp2) / 2;
                break;

            case GameMode.RemoteXPlayers:
                // FIXME: Implementation
                break;
        }

        if (Data.gameMode === GameMode.Local2Players) {
            // TODO: Implementation
        }

        // scroll now
        if (r >= 0 && r <= 1) {
            this.groundBack.scroll(r);
            this.groundFront.scroll(r);

            this.game.camera.x = (this.world.width - this.originalWidth) * r;
        }
    }


    // EVENT LISTENERS
    // ---------------


    /**
     * Plane crash event handler.
     * @param e Plane reference
     */
    private onPlaneCrashed(e: Plane): void {
        this.addPlaneExplosion(e.body.x);
    }


}

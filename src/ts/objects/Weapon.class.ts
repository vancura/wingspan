/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />
/// <reference path="Bullet.class.ts" />


/**
 * Weapon.
 */
class Weapon extends Phaser.Group {


    private nextFire:number;
    private bulletSpeed:number;
    private flip:boolean;
    private planeIdx:number;
    private fx:Phaser.Sound;


    /**
     * Weapon constructor.
     * @param game Game reference
     * @param planeIdx Plane index
     * @constructor
     */
    constructor(game:Phaser.Game, planeIdx:number) {
        var bullet:Bullet;
        var i:number;

        super(game, game.world, "weapon", false, true, Phaser.Physics.ARCADE);

        this.nextFire = 0;
        this.bulletSpeed = Settings.PLANE_BULLET_SPEED;
        this.flip = false;
        this.planeIdx = planeIdx;

        // prepare bullets
        for (i = 0; i < 64 * 4; i++) {
            bullet = new Bullet(this.game, this.planeIdx);

            this.add(bullet, true);
        }

        // sound
        if (Settings.IS_SOUND_ENABLED)
            this.fx = this.game.add.audio("gunshot");
    }


    /**
     * Fire with the weapon.
     * @param source Sprite source
     */
    fire(source:Phaser.Sprite) {
        var x:number, y:number;
        var d:number;

        if (this.game.time.time >= this.game.rnd.between(this.nextFire - 10, this.nextFire)) {
            d = this.flip ? this.game.rnd.between(-7, -3) : this.game.rnd.between(3, 7);

            this.flip = !this.flip;

            x = Math.cos(source.rotation) * d;
            y = Math.sin(source.rotation) * d;

            this.getFirstExists(false).fire(source.x + x, source.y + y, source.angle - 90, this.bulletSpeed, 0, 0);

            if (Settings.IS_SOUND_ENABLED)
                this.fx.play("", 0, this.game.rnd.between(0.75, 1.0));

            this.nextFire = this.game.time.time + this.game.rnd.between(Settings.PLANE_BULLET_FIRE_RATE * 0.99, Settings.PLANE_BULLET_FIRE_RATE * 1.01);
        }
    }


}

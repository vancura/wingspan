/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


/**
 * Ground Foreground.
 */
class GroundFront extends Phaser.Group {


    private groundGroup1:Phaser.Group;
    private isInited:boolean;


    /**
     * Ground foreground constructor.
     * @param game Game reference
     * @constructor
     */
    constructor(game:Phaser.Game) {
        super(game, game.world, "groundFront");

        this.isInited = false;
    }


    /**
     * Init.
     * TODO: Optimize
     */
    init() {
        var l:Phaser.Sprite;
        var i:number = 0;

        this.groundGroup1 = new Phaser.Group(this.game);

        this.groundGroup1.name = "groundGroup1";

        this.add(this.groundGroup1);

        while (i < Math.ceil(this.game.world.width / 254) + 3) {
            l      = this.groundGroup1.create(i * 254, 0, "game", `ground/g${this.game.rnd.integerInRange(1, 6)}.png`);
            l.tint = 0x000000;

            i++;
        }

        this.groundGroup1.y = this.game.world.height - 100;

        this.isInited = true;
    }


    /**
     * Scroll to a position.
     * @param p New position in %
     */
    scroll(p:number) {
        this.groundGroup1.x = (this.game.world.width - this.groundGroup1.width) * p;
    }


}

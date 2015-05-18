/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


/**
 * Ground Background.
 */
class GroundBack extends Phaser.Group {


    private groundGroup2:Phaser.Group;
    private groundGroup3:Phaser.Group;
    private groundGroup4:Phaser.Group;
    private isInited:boolean;


    /**
     * Ground background constructor.
     * @param game Game reference
     * @constructor
     */
    constructor(game:Phaser.Game) {
        super(game, game.world, "groundBack");

        this.isInited = false;
    }


    /**
     * Init.
     * TODO: Optimize
     */
    init() {
        var l:Phaser.Sprite, m:Phaser.Sprite, n:Phaser.Sprite;
        var i:number = 0, j:number = 0, k:number = 0;
        var g2:Phaser.Sprite, g3:Phaser.Sprite, g4:Phaser.Sprite;

        this.groundGroup4 = new Phaser.Group(this.game);
        this.groundGroup3 = new Phaser.Group(this.game);
        this.groundGroup2 = new Phaser.Group(this.game);

        this.groundGroup4.name = "groundGroup4";
        this.groundGroup3.name = "groundGroup3";
        this.groundGroup2.name = "groundGroup2";

        this.add(this.groundGroup4);
        this.add(this.groundGroup3);
        this.add(this.groundGroup2);

        // add level 1 layer
        while (i < Math.ceil(this.game.world.width / 256)) {
            l      = this.groundGroup4.create(i * 256, 0, "game", `ground/g${this.game.rnd.integerInRange(1, 6)}.png`);
            l.tint = 0xf48f44;

            i++;
        }

        // add level 2 layer
        while (j < Math.ceil(this.game.world.width / 256) + 1) {
            m      = this.groundGroup3.create(j * 256, 0, "game", `ground/g${this.game.rnd.integerInRange(1, 6)}.png`);
            m.tint = 0x882d25;

            j++;
        }

        // add level 3 layer
        while (k < Math.ceil(this.game.world.width / 256) + 2) {
            n      = this.groundGroup2.create(k * 256, 0, "game", `ground/g${this.game.rnd.integerInRange(1, 6)}.png`);
            n.tint = 0x5f0028;

            k++;
        }

        g2 = this.groundGroup2.create(0, 0, "game", "ground-grad.png");
        g3 = this.groundGroup3.create(0, 0, "game", "ground-grad.png");
        g4 = this.groundGroup4.create(0, 0, "game", "ground-grad.png");

        g2.width = g3.width = g4.width = this.game.world.width;

        g2.alpha = 0.3;
        g3.alpha = 0.5;
        g4.alpha = 0.7;

        this.groundGroup2.y = this.game.world.height - 100 - 30;
        this.groundGroup3.y = this.game.world.height - 100 - 50;
        this.groundGroup4.y = this.game.world.height - 100 - 65;

        this.isInited = true;
    }


    /**
     * Scroll to a position.
     * @param p New position in %
     */
    scroll(p:number) {
        this.groundGroup2.x = (this.game.world.width - this.groundGroup2.width) * p;
        this.groundGroup3.x = (this.game.world.width - this.groundGroup3.width) * p;
        this.groundGroup4.x = (this.game.world.width - this.groundGroup4.width) * p;
    }


}

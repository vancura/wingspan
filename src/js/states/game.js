/**
 * Game State.
 */
(function () {
    "use strict";


    GameState = function () {
    };


    GameState.prototype = {


        init: function () {
            this.physics.startSystem(Phaser.Physics.BOX2D);
            this.physics.box2d.restitution = 0.1;
        },


        create: function () {
            this.background = this.add.sprite(0, 0, "background");
            this.background.anchor.set(0.5, 0.5);

            this.initMasterCell();
            this.initBabyCells();

            this.petriBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0, 0);

            this.input.onDown.add(this.mouseDragStart, this);

            this.game.debug.reset();

            var s = 1 / (2000 / this.world.width);
            var t = 1 / (1200 / this.world.height);

            this.background.position.set(this.world.width / 2, this.world.height / 2);
            this.background.scale.set(Math.max(s, t));
            this.recalculatePetriBody(Math.max(s, t) * 430);
        },


        update: function () {
            this.cellBabyGroup.forEachAlive(this.moveFollowers, this);
            this.cellMaster.body.setZeroVelocity();

            if (this.rnd.normal() > 0.95) {
                this.cellMaster.body.angularVelocity += this.rnd.normal() / 5;
            }
            if (this.rnd.normal() > 0.8) {
                //noinspection JSCheckFunctionSignatures
                var babyCell = Phaser.ArrayUtils.getRandomItem(this.babyCellList);

                if (babyCell) {
                    babyCell.frameName = "cell-baby-" + this.rnd.integerInRange(1, 2) + ".png";
                }
            }
        },


        initMasterCell: function () {
            this.cellMaster = this.add.sprite(this.world.centerX, this.world.centerY, "game", "cell-master.png");
            this.cellMaster.anchor.set(0.5, 0.5);
            this.cellMaster.scale.set(0.2, 0.2);

            this.physics.box2d.enable(this.cellMaster);

            this.cellMaster.body.setCircle(this.cellMaster.width / 2.8);
        },


        initBabyCells: function () {
            this.babyCellList = [];

            this.cellBabyGroup = this.add.group();
            this.cellBabyGroup.enableBody = true;
            this.cellBabyGroup.physicsBodyType = Phaser.Physics.BOX2D;
        },


        mouseDragStart: function () {
            var px = this.input.mousePointer.x;
            var py = this.input.mousePointer.y;
            var r = Phaser.Math.distance(this.world.centerX, this.world.centerY, px, py);

            // check if the point's in the allowed radius
            if (r < 281) {
                this.addBabyCell(px, py);
            }
        },


        recalculatePetriBody: function (radius) {
            var radiusOffset = 50;
            var step = 5; // step in degrees

            var j = 0;
            var inner = [];
            var outer = [];

            // calculate outer and inner circles
            while (j < 360) {
                var rad = Phaser.Math.degToRad(j);

                // calculate inner circle
                var ix = Math.sin(rad) * radius;
                var iy = Math.cos(rad) * radius;

                // calculate outer circles
                // it needs to be in reversed order
                var ox = Math.sin(Math.PI * 2 - rad) * (radius + radiusOffset);
                var oy = Math.cos(Math.PI * 2 - rad) * (radius + radiusOffset);

                inner.push(ix, iy);
                outer.push(ox, oy);

                j += step;
            }

            var p = inner.concat(outer);

            //noinspection JSCheckFunctionSignatures
            this.petriBody.setPolygon(p, 0, undefined);
            this.petriBody.x = this.world.width / 2;
            this.petriBody.y = this.world.height / 2;
        },


        moveFollowers: function (follower) {
            // find direction to target
            var dx = this.cellMaster.x - follower.x;
            var dy = this.cellMaster.y - follower.y;

            // set angle from direction
            var angle = Math.atan2(dy, dx);

            follower.body.rotation = angle + Phaser.Math.degToRad(90);

            // apply a force toward target
            dx *= 0.01 * 15;
            dy *= 0.01 * 15;

            follower.body.applyForce(dx, dy);
        },


        addBabyCell: function (x, y) {
            var babyCell = this.cellBabyGroup.create(x, y, "game", "cell-baby-1.png");

            babyCell.scale.set(0.85, 0.85);
            babyCell.body.linearDamping = 0.5;
            babyCell.body.angularDamping = 0.1;
            babyCell.body.setCircle(babyCell.width / 3.8);

            this.babyCellList.push(babyCell);

            // increase master cell size
            this.cellMaster.scale.set(this.cellMaster.scale.x * 1.03);
            this.cellMaster.body.setCircle(this.cellMaster.width / 2.8);
        }


    };


}());


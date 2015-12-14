/**
 * Ground Background.
 */
class GUI extends Phaser.Group {


    private planeOffscreenMarkerList: PlaneOffscreenMarker[] = [];
    private planeLabelList: PlaneLabel[] = [];
    private logo: Phaser.Image;
    private label: Phaser.BitmapText;
    private version: Phaser.BitmapText;
    private logoFadeOutTween: Phaser.Tween;
    private labelFadeOutTween: Phaser.Tween;


    constructor(game: Phaser.Game) {
        super(game, game.world, "gui");

        this.logo = new Phaser.Image(this.game, this.game.world.centerX, this.game.world.centerY - 90, "game", "gui/logo-1015.png");
        this.logo.anchor.set(0.5, 0.5);

        this.label = new Phaser.BitmapText(this.game, this.game.world.centerX, this.game.world.centerY - 180, "futura-16", "CREEPTOWN GAMES PRESENTS", 16);
        this.label.anchor.set(0.5, 0.5);
        this.label.tint = 0x010101;
        this.label.alpha = 0.5;

        this.version = new Phaser.BitmapText(this.game, 10, this.game.world.height - 10, "standard-07_55", "Version %VERSION%", 8);
        this.version.anchor.set(0, 1);
        this.version.fixedToCamera = true;

        // fadeout tweens
        this.logoFadeOutTween = this.game.add.tween(this.logo);
        this.logoFadeOutTween.to({ alpha: 0 }, 7000, Phaser.Easing.Cubic.InOut, true, 1000);

        this.labelFadeOutTween = this.game.add.tween(this.label);
        this.labelFadeOutTween.to({ alpha: 0 }, 7000, Phaser.Easing.Cubic.InOut, true);

        this.addMultiple([this.logo, this.label, this.version]);
    }


    /**
     * Add a plane reference.
     * Used to display markers etc.
     * @param plane Plane reference
     */
    public addPlaneReference(plane: Plane): void {
        var marker: PlaneOffscreenMarker = new PlaneOffscreenMarker(this.game, plane);
        var label: PlaneLabel = new PlaneLabel(this.game, plane);

        this.planeOffscreenMarkerList.push(marker);
        this.planeLabelList.push(label);

        this.add(marker);
        this.add(label);
    }


}

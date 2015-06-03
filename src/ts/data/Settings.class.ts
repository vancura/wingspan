/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


class Settings {


    static IS_DEBUG_ENABLED:boolean = false;
    static IS_TRAILS_RENDERING_ENABLED:boolean = true;
    static IS_PLANE_WEAPON_ENABLED:boolean = true;
    static IS_SOUND_ENABLED:boolean = true;
    static IS_MUSIC_ENABLED:boolean = false;

    static WORLD_GRAVITY:number = 75;
    static WORLD_OVERFLOW:number = -30;
    static MAX_TRAIL_DISTANCE:number = 15;

    // delay between dying and restarting (also speed of the camera slide after dying)
    static GAME_RESTART_TIMEOUT:number = 2000;

    static MAX_PLANE_THRUST:number = 210;

    // thrust multiplier when thrust button down
    static PLANE_THRUST_MULTIPLIER_UP:number = 1.9;

    // thrust multiplier when backpedal button down
    static PLANE_THRUST_MULTIPLIER_DOWN:number = 0.96;

    // thrust step when both thrust and backpedal buttons released
    static PLANE_THRUST_MULTIPLIER_NONE:number = 0.995;

    static PLANE_ANGULAR_DAMPING_FACTOR:number = 20;
    static PLANE_KEYBOARD_ROTATION_STEP:number = 60;
    static PLANE_CONTROL_DEGREE_STEP:number = 0.05;
    static PLANE_BULLET_SPEED:number = 350;
    static PLANE_BULLET_FIRE_RATE:number = 70;
    static PLANE_BULLET_LIFESPAN:number = 1000;
    static PLANE_TRAIL_THICKNESS:number = 0.8;

    static PLANE_TRAIL_COLOR_LIST:string[] = [
        "rgba(255,255,0,1)",
        "rgba(255,0,255,1)"
    ];


}

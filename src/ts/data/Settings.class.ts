///<reference path="../../ts-vendor/phaser.comments.d.ts" />


class Settings {


    static IS_DEBUG_ENABLED: boolean = false;
    static IS_TRAILS_RENDERING_ENABLED: boolean = true;
    static IS_PLANE_WEAPON_ENABLED: boolean = true;
    static IS_SOUND_ENABLED: boolean = false;
    static IS_MUSIC_ENABLED: boolean = false;

    static WORLD_GRAVITY: number = 75;
    static WORLD_OVERFLOW: number = -30;
    static MAX_TRAIL_DISTANCE: number = 15;

    // delay between dying and restarting (also speed of the camera slide after dying)
    static GAME_RESTART_TIMEOUT: number = 2000;

    // min and max plane thrust
    static MIN_PLANE_THRUST: number = 40;
    static MAX_PLANE_THRUST: number = 240;

    // thrust multiplier when thrust button down
    static PLANE_THRUST_MULTIPLIER_UP: number = 1.9;

    // thrust step when no direction or thrust keys down
    static PLANE_THRUST_MULTIPLIER_DOWN: number = 0.96;

    static PLANE_ANGULAR_DAMPING_FACTOR: number = 10;
    static PLANE_KEYBOARD_ROTATION_STEP: number = 60;
    static PLANE_CONTROL_DEGREE_STEP: number = 0.05;
    static PLANE_BULLET_SPEED: number = 350;
    static PLANE_BULLET_FIRE_RATE: number = 70;
    static PLANE_BULLET_LIFESPAN: number = 1000;
    static PLANE_TRAIL_THICKNESS: number = 0.8;

    // gravity makes the plane go down faster
    static PLANE_GRAVITY_STALL_RATIO: number = 0.9;

    static PLANE_TINT_COLOR_LIST: string[] = [
        "#ffff00",
        "#00d8ff",
        "#96ff00",
        "#b958fd"
    ];


}

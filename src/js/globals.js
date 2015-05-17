var game;
var signals;
var BootState, PreloadState, GameState;
var Bullet, Weapon, Plane, Trails, GroundBack, GroundFront;


var Settings = {
    IS_DEBUG_ENABLED: false,
    IS_TRAILS_RENDERING_ENABLED: true,
    IS_PLANE_WEAPON_ENABLED: true,
    IS_SOUND_ENABLED: true,

    WORLD_GRAVITY: 75,
    WORLD_OVERFLOW: -30,
    MAX_TRAIL_DISTANCE: 15,

    PLANE_COUNT: 2,
    MAX_PLANE_THRUST: 210,
    PLANE_THRUST_MULTIPLIER_UP: 1.9, // thrust multiplier when thrust button down
    PLANE_THRUST_MULTIPLIER_DOWN: 0.5, // thrust multiplier when backpedal button down
    PLANE_THRUST_MULTIPLIER_NONE: 0.995, // thrust step when both thrust and backpedal buttons released
    PLANE_ANGULAR_DAMPING_FACTOR: 20,
    PLANE_KEYBOARD_ROTATION_STEP: 60,
    PLANE_CONTROL_DEGREE_STEP: 0.05,
    PLANE_BULLET_SPEED: 350,
    PLANE_BULLET_FIRE_RATE: 70,
    PLANE_BULLET_LIFESPAN: 1000,
    PLANE_TRAIL_THICKNESS: 0.9,

    PLANE_TRAIL_COLOR_LIST: [
        "rgba(255,255,0,1)",
        "rgba(255,0,255,1)"
    ]
};

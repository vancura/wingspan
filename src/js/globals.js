var game;
var signals;
var BootState, PreloadState, GameState;
var Bullet, Weapon, Plane;


var Settings = {
    IS_BOX2D_DEBUG_ENABLED: false,
    IS_TRAILS_RENDERING_ENABLED: false,
    IS_PLANE_WEAPON_ENABLED: false,

    WORLD_GRAVITY: 45,
    WORLD_OVERFLOW: -10,
    MAX_TRAIL_DISTANCE: 15,

    MAX_PLANE_THRUST: 110,
    PLANE_THRUST_MULTIPLIER_UP: 1.9, // thrust multiplier when thrust button down
    PLANE_THRUST_MULTIPLIER_DOWN: 0.5, // thrust multiplier when backpedal button down
    PLANE_THRUST_MULTIPLIER_NONE: 0.995, // thrust step when both thrust and backpedal buttons released
    PLANE_ANGULAR_DAMPING_FACTOR: 20,
    PLANE_KEYBOARD_ROTATION_STEP: 70,
    PLANE_CONTROL_DEGREE_STEP: 0.02
};

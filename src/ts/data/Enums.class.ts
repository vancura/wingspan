/**
 * Game mode.
 */
const enum GameMode {
    ScenicSingle,
    Local2Players,
    TestFlyBy
}


/**
 * Plane state.
 */
const enum PlaneState {
    Flying,
    Crashed
}


/**
 * Plane shot state.
 */
const enum PlaneShotState {
    Rocking, // plane is flying, was not shot before
    FirstHit, // plane was shot once, after a second it gets to Kicking state, otherwise if shot before one second is over gets to SecondHit
    SecondHit, // plane shot for the second time, next three seconds engine is off; easy target now
    KO // game over.
}


/**
 * Plane direction.
 * TODO: Diagonal positions for offscreen arrows?
 */
const enum PlaneDirection {
    Up,
    Left,
    Right,
    OnScreen
}

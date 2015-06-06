/// <reference path="../../../components/phaser/typescript/phaser.comments.d.ts" />


/**
 * Game mode.
 */
const enum GameMode {
    ScenicSingle,
    Local2Players,
    RemoteXPlayers
}


/**
 * Plane state.
 */
const enum PlaneState {
    Flying,
    Crashed
}


/**
 * Plane direction.
 * TODO: Diagonal positions?
 */
const enum PlaneDirection {
    Up,
    Left,
    Right,
    OnScreen
}

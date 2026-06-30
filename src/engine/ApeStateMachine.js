// engine/ApeStateMachine.js — converts a waypoint sample into an ApeFrame (the contract).
//
// Within each hop, scroll-progress t drives the state sequence:
//   crouch (anticipation) -> launch (push-off) -> airborne -> land (settle).
// Squash peaks at launch and landing; eases to 0 mid-air.

import { makeIdleFrame } from '../render/ApeRenderer.js';

const T = { crouch: 0.12, launch: 0.22, land: 0.86 }; // thresholds within a hop

/** @param {number} t @returns {{state:import('../render/ApeRenderer.js').ApeState, squash:number}} */
function phase(t) {
  if (t < T.crouch) return { state: 'crouch', squash: t / T.crouch };                       // 0->1
  if (t < T.launch) return { state: 'launch', squash: 1 - (t - T.crouch) / (T.launch - T.crouch) }; // 1->0
  if (t < T.land) return { state: 'airborne', squash: 0 };
  return { state: 'land', squash: (t - T.land) / (1 - T.land) };                              // 0->1 settle
}

export class ApeStateMachine {
  /** @param {import('./WaypointController.js').WaypointController} waypoints */
  constructor(waypoints) {
    this.waypoints = waypoints;
  }

  /**
   * @param {number} progress global scroll progress 0..1
   * @returns {import('../render/ApeRenderer.js').ApeFrame}
   */
  frameAt(progress) {
    const s = this.waypoints.positionAt(progress);
    const f = makeIdleFrame(s.x, s.y);

    // At the very start, sit idle on the moon.
    if (progress <= 0.0005) return f;

    const ph = phase(s.t);
    f.screenPos = { x: s.x, y: s.y };
    f.facing = s.facing;
    f.vy = s.vy;
    f.progress = s.t;

    if (s.exitT > 0) {
      // Final segment: launch then dissolve as it clears the top of the screen.
      f.state = s.exitT < T.launch ? 'launch' : 'exit';
      f.squash = s.exitT < T.launch ? 1 - s.exitT / T.launch : 0;
      f.exit = s.exitT < 0.5 ? 0 : (s.exitT - 0.5) / 0.5; // dissolve over the back half
    } else {
      f.state = ph.state;
      f.squash = ph.squash;
      f.exit = 0;
    }
    return f;
  }
}

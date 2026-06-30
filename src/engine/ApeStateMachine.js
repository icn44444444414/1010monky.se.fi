// engine/ApeStateMachine.js — converts a waypoint sample into an ApeFrame (the contract).
//
// Within each hop, scroll-progress t drives the state sequence:
//   crouch (anticipation) -> launch (push-off) -> airborne -> land (settle).
// Squash peaks at launch and landing; eases to 0 mid-air.

import { makeIdleFrame } from '../render/ApeRenderer.js';

const T = { crouch: 0.10, launch: 0.20, land: 0.82 }; // thresholds within a hop

/** @param {number} t @returns {{state:import('../render/ApeRenderer.js').ApeState, squash:number}} */
function phase(t) {
  if (t < T.crouch) {                                  // anticipation: compress down
    const tt = t / T.crouch;
    return { state: 'crouch', squash: (1 - Math.pow(1 - tt, 3)) * 0.9 };
  }
  if (t < T.launch) {                                  // push-off: release the compression
    const tt = (t - T.crouch) / (T.launch - T.crouch);
    return { state: 'launch', squash: (1 - tt) * 0.9 };
  }
  if (t < T.land) return { state: 'airborne', squash: 0 };
  const tt = (t - T.land) / (1 - T.land);              // landing pop that settles
  return { state: 'land', squash: 0.85 * Math.pow(1 - tt, 2) };
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
      // Final segment: anticipation (crouch/launch) then dissolve into 1010 off the top.
      if (s.exitT < T.launch) {
        const ph2 = phase(s.exitT);
        f.state = ph2.state;
        f.squash = ph2.squash;
        f.exit = 0;
      } else {
        f.state = 'exit';
        f.squash = 0;
        f.exit = (s.exitT - T.launch) / (1 - T.launch); // ramp the dissolve 0->1
      }
    } else {
      f.state = ph.state;
      f.squash = ph.squash;
      f.exit = 0;
    }
    return f;
  }
}

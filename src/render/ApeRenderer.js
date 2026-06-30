// render/ApeRenderer.js — THE INTEGRATION CONTRACT (frozen v1).
//
// The engine (Claude's lane) produces an ApeFrame each tick and hands it to a renderer.
// A renderer (Codex's lane) draws the monkey for that frame. The engine NEVER imports a
// concrete renderer or PixiJS; renderers NEVER read scroll/DOM. This file is the only seam.
//
// Changing this interface requires a `contract:` PR that both agents approve (see COLLABORATION.md §4).

/**
 * @typedef {'perch'|'crouch'|'launch'|'airborne'|'land'|'exit'} ApeState
 * @typedef {'left'|'right'} Facing
 *
 * @typedef {Object} ApeFrame
 * @property {ApeState} state
 * @property {Facing}   facing      // which way the monkey faces / sprite-flips
 * @property {number}   progress    // 0..1 within the current state/segment
 * @property {{x:number, y:number}} screenPos  // viewport-pixel position of the monkey's feet
 * @property {number}   squash      // 0..1 squash&stretch hint (1 = full squash on launch/land)
 * @property {number}   vy          // vertical velocity sign: <0 rising, >0 falling
 * @property {number}   exit        // 0..1 progress of the off-screen dissolve (0 until 'exit')
 */

/**
 * The renderer interface. Implementations: PixiApeRenderer (real), and the DOM Fallback.
 * @typedef {Object} ApeRenderer
 * @property {(container: HTMLElement) => Promise<void>} mount       // load assets, set up canvas/pixel scaling
 * @property {(frame: ApeFrame) => void}                 setFrame    // draw one frame (called every rAF tick)
 * @property {(w: number, h: number) => void}            resize
 * @property {(tier: 'high'|'medium'|'low') => void}     setQuality  // toggle FX cost
 * @property {() => void}                                dispose
 */

// A neutral starting frame (monkey perched, idle).
/** @returns {ApeFrame} */
export function makeIdleFrame(x = 0, y = 0) {
  return { state: 'perch', facing: 'right', progress: 0, screenPos: { x, y }, squash: 0, vy: 0, exit: 0 };
}

// main.js — bootstraps the prototype. Wires: capability gates → renderer (via factory) →
// waypoints → scroll choreographer → state machine → renderer.setFrame each tick. Cursor + dust
// are independent. Everything degrades gracefully (reduced-motion / no-WebGL / touch).

import './styles/stage.css';
import { resolveCapabilities } from './a11y/capability.js';
import { mountFallback } from './a11y/Fallback.js';
import { createRenderer } from './render/ApeRendererFactory.js';
import { WaypointController } from './engine/WaypointController.js';
import { ApeStateMachine } from './engine/ApeStateMachine.js';
import { ScrollChoreographer } from './engine/ScrollChoreographer.js';
import { BinaryDustField } from './cursor/BinaryDustField.js';

function boot() {
  const caps = resolveCapabilities();
  const apeLayer = document.getElementById('ape-layer');

  // Banana cursor = the native OS cursor (CSS image). Perfectly smooth, no JS follower.
  if (caps.cursor) {
    document.body.classList.add('cursor-banana');
  }

  // No jump engine under reduced-motion / no-WebGL — show the static perched monkey.
  if (!caps.motion) {
    mountFallback();
    return;
  }

  const { renderer } = createRenderer();
  if (!renderer) {
    mountFallback();
    return;
  }

  const waypoints = new WaypointController('.panel');
  const stateMachine = new ApeStateMachine(waypoints);

  renderer.mount(apeLayer).then(() => {
    waypoints.measure();

    // Binary dust bursts at each landing (tied to the jump, not the cursor).
    const dust = new BinaryDustField();
    dust.start();

    let progress = 0;
    const choreo = new ScrollChoreographer((p) => { progress = p; });
    choreo.start();

    let lastState = 'perch';
    function loop() {
      const frame = stateMachine.frameAt(progress);
      renderer.setFrame(frame);
      // 1010 dust burst on each fresh landing on a section
      if ((frame.state === 'land' || frame.state === 'exit') && lastState !== frame.state) {
        dust.emitBurst(frame.screenPos.x, frame.screenPos.y);
      }
      lastState = frame.state;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    let resizeRAF = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(() => {
        waypoints.measure();
        renderer.resize(window.innerWidth, window.innerHeight);
        choreo.refresh();
      });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

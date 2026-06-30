// render/PixiApeRenderer.js — PLACEHOLDER implementation of the ApeRenderer contract.
//
// Draws a simple, deliberately-clean procedural pixel monkey from rects and transforms it per
// ApeFrame. This is the stand-in Codex replaces with a real sprite-atlas renderer (same interface,
// zero engine changes). Pixel-crisp via no-antialias + integer-ish scaling.

import { Application, Container, Graphics } from 'pixi.js';

const COL = {
  fur: 0x7a4a2b,
  furDark: 0x5d3720,
  face: 0xe8c79a,
  belly: 0xc99a6b,
  eye: 0x121319,
  banana: 0xffd23f,
};

/** Build the monkey once, in a ~16x18 "pixel" grid, pivot at the feet (bottom-center). */
function buildMonkey() {
  const m = new Container();
  const g = new Graphics();
  const p = (x, y, w, h, c) => g.rect(x, y, w, h).fill(c); // 1 unit = 1 art-pixel

  // tail
  p(13, 9, 3, 2, COL.furDark);
  p(14, 6, 2, 4, COL.furDark);
  // legs
  p(4, 15, 3, 3, COL.furDark);
  p(9, 15, 3, 3, COL.furDark);
  // body
  p(3, 8, 10, 8, COL.fur);
  p(5, 10, 6, 5, COL.belly);
  // arms
  p(1, 8, 2, 6, COL.furDark);
  p(13, 8, 2, 6, COL.furDark);
  // head
  p(3, 1, 10, 8, COL.fur);
  // ears
  p(2, 2, 2, 3, COL.fur);
  p(12, 2, 2, 3, COL.fur);
  // face
  p(5, 3, 6, 5, COL.face);
  // eyes
  p(6, 4, 1, 2, COL.eye);
  p(9, 4, 1, 2, COL.eye);
  // nostrils
  p(7, 6, 1, 1, COL.furDark);
  p(8, 6, 1, 1, COL.furDark);

  m.addChild(g);
  m.pivot.set(8, 18); // feet center
  return m;
}

export class PixiApeRenderer {
  constructor() {
    /** @type {Application|null} */ this.app = null;
    this.monkey = null;
    this.scale = 6;
    this.quality = 'high';
  }

  /** @param {HTMLElement} container */
  async mount(container) {
    const app = new Application();
    await app.init({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: false,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });
    container.appendChild(app.canvas);
    this.app = app;

    this.monkey = buildMonkey();
    app.stage.addChild(this.monkey);
    this._recalcScale();
  }

  _recalcScale() {
    // Monkey ~ 9% of viewport height, snapped to whole pixels for crispness.
    const target = Math.max(48, Math.round(window.innerHeight * 0.09));
    this.scale = Math.max(3, Math.round(target / 18));
  }

  /** @param {import('./ApeRenderer.js').ApeFrame} frame */
  setFrame(frame) {
    const m = this.monkey;
    if (!m) return;
    m.x = frame.screenPos.x;
    m.y = frame.screenPos.y;

    const dir = frame.facing === 'left' ? -1 : 1;
    // squash & stretch: squash on launch/land, slight stretch while airborne (vy != 0)
    const stretch = frame.state === 'airborne' ? 0.12 * Math.min(1, Math.abs(frame.vy)) : 0;
    const sx = this.scale * (1 + 0.25 * frame.squash - stretch);
    const sy = this.scale * (1 - 0.3 * frame.squash + stretch);
    m.scale.set(dir * sx, sy);

    // subtle airborne lean toward travel direction
    m.rotation = frame.state === 'airborne' ? dir * 0.12 * Math.sign(frame.vy || -1) : 0;

    // exit: fade out as it dissolves off-screen (Codex will replace with a real 1010 scatter)
    m.alpha = 1 - frame.exit;
    m.visible = frame.exit < 0.999;
  }

  resize() {
    this._recalcScale();
  }

  /** @param {'high'|'medium'|'low'} tier */
  setQuality(tier) {
    this.quality = tier;
  }

  dispose() {
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
      this.monkey = null;
    }
  }
}

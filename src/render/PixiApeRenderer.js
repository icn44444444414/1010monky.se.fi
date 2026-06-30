// render/PixiApeRenderer.js — PLACEHOLDER implementation of the ApeRenderer contract.
//
// A richer, shaded procedural pixel monkey (fur tones, expressive face, a banana in hand, a
// soft contact shadow) + idle bob. Still a stand-in: Codex replaces this with a real sprite-atlas
// renderer behind the same interface, zero engine changes. Pixel-crisp (no antialias).

import { Application, Container, Graphics } from 'pixi.js';

const C = {
  furL: 0x9a6038, fur: 0x7a4a2b, furD: 0x5d3720, line: 0x35200f,
  belly: 0xe8c79a, bellyL: 0xf3dcc0, face: 0xecc89a, faceL: 0xf6dcc0, cheek: 0xd98f5e,
  eyeW: 0xffffff, eye: 0x1b1a22, mouth: 0x6b3b2a,
  ban: 0xffd23f, banS: 0xe0a92a, banTip: 0x5a3a1a,
};

/** Paint the monkey on a ~24x28 art-pixel grid; pivot at the feet (bottom-center). */
function buildMonkey() {
  const root = new Container();
  const g = new Graphics();
  const p = (x, y, w, h, c) => g.rect(x, y, w, h).fill(c); // 1 unit = 1 art-pixel

  // tail (curls up on the right)
  p(18, 17, 2, 2, C.furD); p(19, 15, 2, 2, C.furD); p(20, 13, 2, 2, C.furD);
  p(20, 11, 2, 2, C.fur); p(19, 10, 2, 2, C.fur);
  // legs + feet
  p(7, 22, 3, 4, C.fur); p(6, 25, 4, 2, C.furD);
  p(14, 22, 3, 4, C.fur); p(14, 25, 4, 2, C.furD);
  // back arm (right)
  p(18, 13, 3, 7, C.furD); p(18, 19, 3, 3, C.furD);
  // torso
  p(6, 13, 12, 10, C.fur);
  p(6, 13, 2, 10, C.furL);      // left highlight
  p(16, 13, 2, 10, C.furD);     // right shadow
  // belly
  p(8, 15, 8, 7, C.belly); p(9, 16, 3, 3, C.bellyL);
  // head
  p(5, 2, 14, 12, C.fur);
  p(5, 2, 2, 12, C.furL); p(17, 2, 2, 12, C.furD); p(7, 2, 10, 2, C.furL);
  // ears
  p(3, 4, 3, 4, C.fur); p(4, 5, 1, 2, C.cheek);
  p(18, 4, 3, 4, C.fur); p(19, 5, 1, 2, C.cheek);
  // face
  p(7, 5, 10, 8, C.face); p(7, 5, 4, 8, C.faceL);
  p(7, 10, 2, 2, C.cheek); p(15, 10, 2, 2, C.cheek);
  p(7, 5, 10, 1, C.fur);        // brow
  // eyes (whites, pupils, shine)
  p(8, 6, 3, 3, C.eyeW); p(13, 6, 3, 3, C.eyeW);
  p(9, 7, 2, 2, C.eye); p(14, 7, 2, 2, C.eye);
  p(9, 7, 1, 1, C.eyeW); p(14, 7, 1, 1, C.eyeW);
  // muzzle + nose + smile
  p(10, 9, 4, 3, C.cheek);
  p(10, 10, 1, 1, C.furD); p(13, 10, 1, 1, C.furD);
  p(10, 12, 4, 1, C.mouth); p(9, 11, 1, 1, C.mouth); p(14, 11, 1, 1, C.mouth);

  // front arm (left) — raised, holding a banana
  p(3, 12, 3, 7, C.fur); p(2, 17, 3, 3, C.furD);
  // banana
  const ban = new Graphics();
  const b = (x, y, w, h, c) => ban.rect(x, y, w, h).fill(c);
  b(0, 13, 2, 5, C.ban); b(1, 12, 2, 2, C.ban); b(0, 17, 2, 2, C.ban);
  b(2, 14, 1, 4, C.banS); b(1, 11, 1, 1, C.banTip); b(0, 18, 1, 1, C.banTip);

  root.addChild(g);
  root.addChild(ban);
  root.pivot.set(12, 28);
  return root;
}

export class PixiApeRenderer {
  constructor() {
    /** @type {Application|null} */ this.app = null;
    this.monkey = null;
    this.shadow = null;
    this.scale = 6;
    this.quality = 'high';
    this._t = 0;
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

    // soft contact shadow (under the monkey)
    this.shadow = new Graphics().ellipse(0, 0, 22, 6).fill({ color: 0x000000, alpha: 0.32 });
    app.stage.addChild(this.shadow);

    this.monkey = buildMonkey();
    app.stage.addChild(this.monkey);
    this._recalcScale();
  }

  _recalcScale() {
    const target = Math.max(64, Math.round(window.innerHeight * 0.12));
    this.scale = Math.max(3, Math.round(target / 28));
  }

  /** @param {import('./ApeRenderer.js').ApeFrame} frame */
  setFrame(frame) {
    const m = this.monkey;
    if (!m) return;
    this._t += 1;

    const idle = frame.state === 'perch';
    const bob = idle ? Math.sin(this._t * 0.06) * this.scale * 0.6 : 0;
    const falling = Math.max(0, frame.vy);
    const rising = Math.max(0, -frame.vy);
    const landingSink = frame.state === 'land' ? this.scale * 1.1 * frame.squash : 0;

    m.x = frame.screenPos.x;
    m.y = frame.screenPos.y + bob + landingSink;

    const dir = frame.facing === 'left' ? -1 : 1;
    // vy is normalized [-1,1]: stretch when moving fast vertically, round at the apex.
    const stretch = frame.state === 'airborne' ? 0.1 * rising + 0.18 * falling : 0;
    const sx = this.scale * (1 + 0.3 * frame.squash - stretch * 0.75);
    const sy = this.scale * (1 - 0.34 * frame.squash + stretch);
    m.scale.set(dir * sx, sy);
    if (frame.state === 'airborne') {
      m.rotation = dir * (0.12 * falling - 0.08 * rising);
    } else if (frame.state === 'launch') {
      m.rotation = -dir * 0.08 * (1 - frame.squash);
    } else if (frame.state === 'land') {
      m.rotation = dir * 0.05 * frame.squash;
    } else {
      m.rotation = 0;
    }
    m.alpha = 1 - frame.exit;
    m.visible = frame.exit < 0.999;

    // shadow tracks the feet; widens on squash (landing), fades on exit
    const sh = this.shadow;
    sh.x = frame.screenPos.x;
    sh.y = frame.screenPos.y + this.scale * 0.5;
    const airShadow = frame.state === 'airborne' ? 0.34 + 0.34 * falling : 1;
    sh.scale.set((this.scale / 6) * (1 + 0.7 * frame.squash + 0.15 * falling), this.scale / 6);
    sh.alpha = 0.32 * (1 - frame.exit) * airShadow;
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
      this.shadow = null;
    }
  }
}

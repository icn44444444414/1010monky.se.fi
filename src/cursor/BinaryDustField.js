// cursor/BinaryDustField.js — landing FX (Codex's lane; lightweight own-canvas stand-in).
//
// NOT tied to the cursor anymore: it emits a burst of yellow dust + 1010 binary glyphs at the
// monkey's feet each time a jump LANDS on a section. Codex will reimplement on a Pixi
// ParticleContainer with the real sprite look.

const MAX = 400;
const DUST = '#ffd23f';
const BIT = '#58e08a';

export class BinaryDustField {
  constructor() {
    this.canvas = null; this.ctx = null;
    this.parts = [];
    this.raf = 0;
    this._tick = this._tick.bind(this);
    this._resize = this._resize.bind(this);
  }

  start() {
    const c = document.createElement('canvas');
    c.id = 'dust-canvas';
    c.setAttribute('aria-hidden', 'true');
    Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: '45', pointerEvents: 'none' });
    document.body.appendChild(c);
    this.canvas = c; this.ctx = c.getContext('2d');
    this._resize();
    window.addEventListener('resize', this._resize);
    this.raf = requestAnimationFrame(this._tick);
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Burst of yellow dust + 1010 glyphs at a landing point. */
  emitBurst(x, y, n = 22) {
    for (let i = 0; i < n; i++) {
      if (this.parts.length >= MAX) this.parts.shift();
      const bit = Math.random() < 0.55;                  // mostly binary glyphs
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1; // fan upward/outward
      const spd = 1.4 + Math.random() * 3.4;
      this.parts.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.6,
        life: 1, decay: 0.012 + Math.random() * 0.018,
        size: bit ? 11 + Math.random() * 4 : 2 + Math.random() * 2.5,
        bit, glyph: Math.random() < 0.5 ? '0' : '1',
      });
    }
  }

  _tick() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= p.decay; // gravity
      if (p.life <= 0) { this.parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.bit) {
        ctx.fillStyle = BIT;
        ctx.font = `${p.size}px ui-monospace, monospace`;
        ctx.fillText(p.glyph, p.x, p.y);
      } else {
        ctx.fillStyle = DUST;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this._tick);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._resize);
    if (this.canvas) this.canvas.remove();
  }
}

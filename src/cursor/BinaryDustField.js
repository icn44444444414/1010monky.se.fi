// cursor/BinaryDustField.js — PLACEHOLDER yellow-dust + falling 0/1 emitter (Codex's lane).
// Lightweight own-canvas particle system; Codex will reimplement on a Pixi ParticleContainer.

const MAX = 300;
const DUST = '#ffd23f';
const BIT = '#58e08a';

export class BinaryDustField {
  constructor() {
    this.canvas = null; this.ctx = null;
    this.parts = [];
    this.raf = 0;
    this.lastSpawn = 0;
    this._move = this._move.bind(this);
    this._tick = this._tick.bind(this);
    this._resize = this._resize.bind(this);
  }

  start() {
    const c = document.createElement('canvas');
    c.id = 'dust-canvas';
    c.setAttribute('aria-hidden', 'true');
    Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: '50', pointerEvents: 'none' });
    document.body.appendChild(c);
    this.canvas = c; this.ctx = c.getContext('2d');
    this._resize();
    window.addEventListener('resize', this._resize);
    window.addEventListener('pointermove', this._move, { passive: true });
    this.raf = requestAnimationFrame(this._tick);
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _move(e) {
    const now = performance.now();
    if (now - this.lastSpawn < 16) return;
    this.lastSpawn = now;
    this._spawn(e.clientX, e.clientY, 2);
  }

  /** Burst at a point — used for landings. */
  emitBurst(x, y, n = 14) { this._spawn(x, y, n, true); }

  _spawn(x, y, n, burst = false) {
    for (let i = 0; i < n; i++) {
      if (this.parts.length >= MAX) this.parts.shift();
      const bit = Math.random() < (burst ? 0.4 : 0.18);
      const ang = burst ? Math.random() * Math.PI * 2 : Math.PI / 2 + (Math.random() - 0.5);
      const spd = burst ? 1 + Math.random() * 3 : 0.3 + Math.random() * 0.8;
      this.parts.push({
        x, y,
        vx: Math.cos(ang) * spd + (burst ? 0 : (Math.random() - 0.5)),
        vy: Math.sin(ang) * spd - (burst ? 1 : 0),
        life: 1, decay: 0.012 + Math.random() * 0.02,
        size: bit ? 11 : 2 + Math.random() * 2,
        bit, glyph: Math.random() < 0.5 ? '0' : '1',
      });
    }
  }

  _tick() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= p.decay;
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
    window.removeEventListener('pointermove', this._move);
    if (this.canvas) this.canvas.remove();
  }
}

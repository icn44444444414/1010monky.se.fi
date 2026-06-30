// cursor/BananaCursor.js — PLACEHOLDER pixel-banana cursor (Codex's lane; simple DOM stand-in).
// Hides the native cursor on the stage, follows the pointer with spring lag, restores native
// cursor over interactive elements. Codex will upgrade visuals/dust integration.

export class BananaCursor {
  constructor() {
    this.el = null;
    this.x = 0; this.y = 0; this.tx = 0; this.ty = 0;
    this.raf = 0;
    this._move = this._move.bind(this);
    this._tick = this._tick.bind(this);
    this._over = this._over.bind(this);
  }

  start() {
    const el = document.createElement('div');
    el.id = 'banana-cursor';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = '🍌';
    Object.assign(el.style, {
      position: 'fixed', left: '0', top: '0', zIndex: '60', pointerEvents: 'none',
      fontSize: '22px', transform: 'translate(-50%,-50%)', willChange: 'transform',
    });
    document.body.appendChild(el);
    this.el = el;
    document.body.classList.add('cursor-custom');
    window.addEventListener('pointermove', this._move, { passive: true });
    document.addEventListener('pointerover', this._over, { passive: true });
    this.raf = requestAnimationFrame(this._tick);
  }

  _move(e) { this.tx = e.clientX; this.ty = e.clientY; }

  _over(e) {
    const interactive = e.target instanceof Element && e.target.closest('a, button, input, textarea, select, [role=button]');
    document.body.classList.toggle('cursor-custom', !interactive);
    if (this.el) this.el.style.opacity = interactive ? '0' : '1';
  }

  _tick() {
    // spring toward target + slight tilt by horizontal velocity
    const dx = this.tx - this.x, dy = this.ty - this.y;
    this.x += dx * 0.25; this.y += dy * 0.25;
    if (this.el) {
      const tilt = Math.max(-25, Math.min(25, dx * 1.2));
      this.el.style.transform = `translate(${this.x}px, ${this.y}px) translate(-50%,-50%) rotate(${tilt}deg)`;
    }
    this.raf = requestAnimationFrame(this._tick);
  }

  /** @returns {{x:number,y:number}} current cursor position (for the dust emitter) */
  get position() { return { x: this.x, y: this.y }; }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this._move);
    document.removeEventListener('pointerover', this._over);
    document.body.classList.remove('cursor-custom');
    if (this.el) this.el.remove();
  }
}

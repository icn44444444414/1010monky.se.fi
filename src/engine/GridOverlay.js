// engine/GridOverlay.js — dev aid: press 'g' to toggle a visible grid + the authored landing
// cells, so the jump layout (layout.js) is tunable by eye instead of guessed.

import { GRID, LANDINGS, EXIT_CELL } from './layout.js';

export class GridOverlay {
  constructor() {
    this.canvas = null;
    this.on = false;
    this._key = this._key.bind(this);
    this._resize = this._resize.bind(this);
  }

  start() {
    window.addEventListener('keydown', this._key);
  }

  _key(e) {
    if (e.key === 'g' || e.key === 'G') {
      this.on ? this._hide() : this._show();
    }
  }

  _show() {
    const c = document.createElement('canvas');
    c.id = 'grid-overlay';
    Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: '70', pointerEvents: 'none' });
    document.body.appendChild(c);
    this.canvas = c;
    this.on = true;
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _hide() {
    if (this.canvas) this.canvas.remove();
    this.canvas = null;
    this.on = false;
    window.removeEventListener('resize', this._resize);
  }

  _resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    this._draw();
  }

  _draw() {
    const ctx = this.canvas.getContext('2d');
    const W = window.innerWidth, H = window.innerHeight;
    const cw = W / GRID.cols, ch = H / GRID.rows;
    ctx.clearRect(0, 0, W, H);

    // grid lines
    ctx.strokeStyle = 'rgba(88,224,138,0.22)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= GRID.cols; c++) { ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke(); }
    for (let r = 0; r <= GRID.rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke(); }

    // col/row labels
    ctx.font = '11px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(88,224,138,0.65)';
    for (let c = 1; c <= GRID.cols; c++) ctx.fillText(String(c), (c - 0.5) * cw - 3, 13);
    for (let r = 1; r <= GRID.rows; r++) ctx.fillText(String(r), 4, (r - 0.5) * ch + 4);

    // authored landing cells
    [...LANDINGS, EXIT_CELL].forEach((cell, i) => {
      const x = (cell.col - 1) * cw, y = (cell.row - 1) * ch;
      ctx.fillStyle = 'rgba(255,210,63,0.16)';
      ctx.fillRect(x, y, cw, ch);
      ctx.strokeStyle = 'rgba(255,210,63,0.9)';
      ctx.strokeRect(x, y, cw, ch);
      ctx.fillStyle = 'rgba(255,210,63,1)';
      ctx.fillText(i < LANDINGS.length ? 'P' + i : 'EXIT', x + 6, y + 16);
    });
  }
}

// engine/GridOverlay.js — dev aid: press 'g' to toggle a SQUARE GRID NET over the whole page,
// with column numbers along the top (sticky) and row numbers down the left edge (scroll with the
// page). Use it to place jump-point <div> elements: read the cell as (column, row).
// Cell size = viewport width / 12 (square).

const COLS = 12;

export class GridOverlay {
  constructor() {
    this.net = null;
    this.topRuler = null;
    this.leftRuler = null;
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
    // full-page square net (scrolls with the document)
    const net = document.createElement('div');
    net.id = 'page-grid';
    Object.assign(net.style, { position: 'absolute', left: '0', top: '0', width: '100%', pointerEvents: 'none', zIndex: '65' });
    document.body.appendChild(net);
    this.net = net;

    // sticky COLUMN ruler across the top
    const top = document.createElement('div');
    top.id = 'page-grid-cols';
    Object.assign(top.style, {
      position: 'fixed', left: '0', top: '0', width: '100%', height: '18px', display: 'flex',
      pointerEvents: 'none', zIndex: '67', font: '11px ui-monospace, monospace',
      color: 'rgba(88,224,138,0.95)', background: 'rgba(10,11,16,0.65)',
    });
    for (let c = 1; c <= COLS; c++) {
      const s = document.createElement('div');
      s.textContent = String(c);
      Object.assign(s.style, { flex: '1', textAlign: 'center', borderRight: '1px solid rgba(88,224,138,0.25)' });
      top.appendChild(s);
    }
    document.body.appendChild(top);
    this.topRuler = top;

    // ROW ruler down the left edge (scrolls with the page)
    const left = document.createElement('div');
    left.id = 'page-grid-rows';
    Object.assign(left.style, {
      position: 'absolute', left: '0', top: '0', width: '22px', pointerEvents: 'none', zIndex: '66',
      font: '10px ui-monospace, monospace', color: 'rgba(88,224,138,0.9)',
    });
    document.body.appendChild(left);
    this.leftRuler = left;

    this.on = true;
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _hide() {
    [this.net, this.topRuler, this.leftRuler].forEach((el) => el && el.remove());
    this.net = this.topRuler = this.leftRuler = null;
    this.on = false;
    window.removeEventListener('resize', this._resize);
  }

  _resize() {
    if (!this.net) return;
    const cell = Math.max(28, Math.round(window.innerWidth / COLS));
    const docH = document.documentElement.scrollHeight;

    this.net.style.height = docH + 'px';
    this.net.style.backgroundImage =
      `repeating-linear-gradient(90deg, rgba(88,224,138,0.22) 0 1px, transparent 1px ${cell}px),` +
      `repeating-linear-gradient(0deg, rgba(88,224,138,0.16) 0 1px, transparent 1px ${cell}px)`;

    // (re)build row numbers
    const left = this.leftRuler;
    left.innerHTML = '';
    left.style.height = docH + 'px';
    left.style.background = 'rgba(10,11,16,0.45)';
    const rows = Math.ceil(docH / cell);
    for (let r = 1; r <= rows; r++) {
      const s = document.createElement('div');
      s.textContent = String(r);
      Object.assign(s.style, { position: 'absolute', left: '2px', top: (r - 1) * cell + 2 + 'px' });
      left.appendChild(s);
    }
  }
}

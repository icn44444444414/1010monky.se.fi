// engine/WaypointController.js — turns the page's sections into jump waypoints + arcs.
//
// The monkey lives on a fixed full-viewport overlay, so anchors are VIEWPORT-relative: it hops
// across the screen (alternating sides) as each section scrolls past. Start = the moon; last hop
// = off the top of the screen (the exit/dissolve). Renderer-agnostic: pure geometry.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class WaypointController {
  /** @param {string} panelSelector */
  constructor(panelSelector = '.panel') {
    this.panelSelector = panelSelector;
    /** @type {{x:number,y:number}[]} */ this.anchors = [];
    /** @type {{p0:{x,y},c:{x,y},p1:{x,y},dx:number,isExit:boolean}[]} */ this.segments = [];
  }

  /** (Re)measure anchors + arcs from the current layout. Call on load + resize. */
  measure() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const panels = Array.from(document.querySelectorAll(this.panelSelector));

    // Start perch: on the moon (matches the CSS moon position), feet just below its center.
    const moonY = H * 0.46 + Math.min(W * 0.23, 160) * 0.55;
    const anchors = [{ x: W * 0.5, y: moonY }];

    // One landing per panel, alternating sides so the monkey clearly shows both directions.
    panels.forEach((_, i) => {
      const left = i % 2 === 0;
      anchors.push({ x: left ? W * 0.24 : W * 0.76, y: H * 0.6 });
    });

    // Exit: leap up and off the top of the viewport (the dissolve happens here).
    anchors.push({ x: W * 0.5, y: -H * 0.4 });

    this.anchors = anchors;
    this.segments = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      const p0 = anchors[i];
      const p1 = anchors[i + 1];
      const dx = p1.x - p0.x;
      const isExit = i === anchors.length - 2;
      const arc = isExit ? H * 0.5 : clamp(60 + Math.abs(dx) * 0.5, 110, 300);
      const c = { x: (p0.x + p1.x) / 2, y: Math.min(p0.y, p1.y) - arc };
      this.segments.push({ p0, c, p1, dx, isExit });
    }
  }

  get segmentCount() {
    return this.segments.length;
  }

  /**
   * Resolve a global scroll progress (0..1) to a monkey position + motion hints.
   * @param {number} progress
   * @returns {{x:number,y:number, t:number, seg:number, facing:'left'|'right', vy:number, exitT:number}}
   */
  positionAt(progress) {
    const n = this.segments.length;
    if (n === 0) return { x: 0, y: 0, t: 0, seg: 0, facing: 'right', vy: 0, exitT: 0 };
    const scaled = clamp(progress, 0, 1) * n;
    let seg = Math.min(n - 1, Math.floor(scaled));
    const t = clamp(scaled - seg, 0, 1);
    const s = this.segments[seg];

    // Quadratic bezier point + derivative (for vertical velocity sign).
    const mt = 1 - t;
    const x = mt * mt * s.p0.x + 2 * mt * t * s.c.x + t * t * s.p1.x;
    const y = mt * mt * s.p0.y + 2 * mt * t * s.c.y + t * t * s.p1.y;
    const vy = 2 * mt * (s.c.y - s.p0.y) + 2 * t * (s.p1.y - s.c.y);

    const facing = s.dx === 0 ? 'right' : s.dx > 0 ? 'right' : 'left';
    const exitT = s.isExit ? t : 0;
    return { x, y, t, seg, facing, vy, exitT };
  }
}

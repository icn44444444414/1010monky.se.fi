// engine/GridSystem.js — a simple responsive grid over the viewport.
// `cols` columns x `rows` rows, both 1-indexed (col 1 = leftmost, row 1 = top).
// Landings are authored as grid cells (see layout.js) so the jumps are controllable, not guessed.

export class GridSystem {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
  }

  /** Center x (viewport px) of a 1-indexed column. */
  colX(col) { return ((col - 0.5) / this.cols) * window.innerWidth; }

  /** Center y (viewport px) of a 1-indexed row. */
  rowY(row) { return ((row - 0.5) / this.rows) * window.innerHeight; }

  /** Center point of cell (col,row). */
  cell(col, row) { return { x: this.colX(col), y: this.rowY(row) }; }
}

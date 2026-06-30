// engine/layout.js — THE JUMP LAYOUT (edit this to retune the monkey's path).
//
// The viewport is a GRID.cols x GRID.rows grid (col 1 = left, row 1 = top, both 1-indexed).
// LANDINGS[i] is the grid cell where the monkey lands on panel i (in DOM order).
// Declarative — no guessing. Press the 'g' key in the browser to SEE the grid + these cells.
//
// Senior-design intent (12x8 grid): land in the negative space BESIDE each section's text,
// on the rule-of-thirds columns (3 = left third ~21%, 10 = right third ~79%), in a clean
// left<->right zig-zag, slightly below the lifted content so it frames the text.

export const GRID = { cols: 12, rows: 12 };

// THE JUMP PATH — an ordered list of grid cells the monkey hops through, top to bottom.
// This is now DECOUPLED from the page sections: add as many waypoints as you like for a denser
// Donkey-Kong staircase (many small platform hops). Each entry = one landing the monkey jumps to.
// Rows increase = lower on screen. Keep it mostly descending (avoid jarring up-jumps); a big
// downward step (>~2 rows) auto-becomes a weighty "free-fall" ledge drop.
// Press 'g' in the browser to see the grid + every waypoint and tune these by eye.
export const WAYPOINTS = [
  { col: 3,  row: 3 },
  { col: 10, row: 4 },
  { col: 4,  row: 5 },
  { col: 9,  row: 6 },
  { col: 3,  row: 6 },
  { col: 10, row: 7 },
  { col: 5,  row: 8 },
  { col: 9,  row: 8 },
  { col: 3,  row: 9 },
  { col: 11, row: 12 }, // big step -> free-fall
];

// Final leap: jump away to the top-center and dissolve into 1010.
export const EXIT_CELL = { col: 6, row: 1 };

// engine/layout.js — THE JUMP LAYOUT (edit this to retune the monkey's path).
//
// The viewport is a GRID.cols x GRID.rows grid (col 1 = left, row 1 = top, both 1-indexed).
// LANDINGS[i] is the grid cell where the monkey lands on panel i (in DOM order).
// Declarative — no guessing. Press the 'g' key in the browser to SEE the grid + these cells.
//
// Senior-design intent (12x8 grid): land in the negative space BESIDE each section's text,
// on the rule-of-thirds columns (3 = left third ~21%, 10 = right third ~79%), in a clean
// left<->right zig-zag, slightly below the lifted content so it frames the text.

export const GRID = { cols: 12, rows: 8 };

// Donkey-Kong-style DESCENT: the monkey works its way DOWN the page, hopping platform to
// platform with a couple of free-falls, then leaps away. Rows increase = lower on screen.
export const LANDINGS = [
  { col: 3,  row: 3 }, // 0  hero            -> upper-left, start the descent
  { col: 10, row: 4 }, // 1  "Like the moon" -> right, a step down
  { col: 3,  row: 6 }, // 2  "1010 = binary" -> left, DOWN 2 rows
  { col: 10, row: 6 }, // 3  "Right to left" -> right, DOWN 2 rows
  { col: 4,  row: 2 }, // 4  servizi         -> hop UP onto a high platform
  { col: 9,  row: 7 }, // 5  contatti        -> FREE-FALL ~5 rows down
];

// Final leap: jump away to the top-center and dissolve into 1010.
export const EXIT_CELL = { col: 6, row: 1 };

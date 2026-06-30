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

export const LANDINGS = [
  { col: 3,  row: 5 }, // 0  hero            (centered text) -> lower-left negative space
  { col: 10, row: 4 }, // 1  "Like the moon" (left text)     -> right third, beside it
  { col: 3,  row: 4 }, // 2  "1010 = binary" (right text)    -> left third, beside it
  { col: 10, row: 4 }, // 3  left text                       -> right third, beside it
  { col: 3,  row: 5 }, // 4  servizi         (centered)      -> lower-left
  { col: 10, row: 5 }, // 5  contatti        (centered)      -> lower-right
];

// Final leap: rise to the top-center and dissolve into 1010 there.
export const EXIT_CELL = { col: 6, row: 1 };

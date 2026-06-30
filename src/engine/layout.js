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

// Donkey-Kong DESCENT: the monkey only ever moves DOWN (no jarring up-jumps), section by
// section, with a free-fall near the end, then leaps away. Rows increase = lower on screen.
export const LANDINGS = [
  { col: 3,  row: 4 },  // 0  hero            -> upper area, start the descent
  { col: 10, row: 5 },  // 1  "Like the moon" (left text)  -> right, a step down
  { col: 3,  row: 6 },  // 2  "1010 = binary" (right text) -> left, down
  { col: 10, row: 7 },  // 3  "Right to left" (left text)  -> right, down
  { col: 3,  row: 7 },  // 4  "What we do"    (center)     -> left, beside the text (not up top)
  { col: 10, row: 11 }, // 5  contatti        (center)     -> right, FREE-FALL down
];

// Final leap: jump away to the top-center and dissolve into 1010.
export const EXIT_CELL = { col: 6, row: 1 };

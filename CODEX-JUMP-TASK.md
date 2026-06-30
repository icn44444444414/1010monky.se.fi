# Codex task — make the monkey's jump *feel* right (Donkey-Kong descent)

> The engine, grid layout, and bug-fixes are built and correct (Claude's lane). What remains is the
> **visual feel** of the jump — arcs, weight, timing, the descent rhythm — which needs a real pair of
> eyes in a browser (your strength). The human is not yet happy with how the jumps *feel* ("too high",
> apex wrong). Iterate visually until it reads as a smooth, weighty Donkey-Kong descent.

---

## 1. Run it locally (verified correct)

Public repo — no auth needed to clone. **Node 20+** required.

```bash
git clone https://github.com/icn44444444414/1010monky.se.fi.git
cd 1010monky.se.fi
npm install
npm run dev            # opens http://localhost:5173/   (or the port it prints)
```
Other scripts: `npm run build` (static dist/), `npm run lint` (eslint). Stack: **Vite + plain JS
(JSDoc) + PixiJS v8 + GSAP**. No TypeScript.

To work + push back:
```bash
git checkout prototype/main
git checkout -b feat/jump-feel
# ...edit, verify, commit (see §6)...
git push -u origin feat/jump-feel      # push needs a token/collaborator (repo is public to read)
# open a PR: base = prototype/main
```

## 2. Project map (where everything is)

```
1010monky.se.fi/
  index.html                     # the stage: panels (sections) + the bit + #ape-layer overlay
  src/
    main.js                      # bootstrap: capability gate -> renderer -> engine loop -> dust/cursor
    styles/stage.css             # panel layout, the glowing pixel "bit", custom cursor
    engine/
      layout.js          ★       # THE JUMP PATH — grid size + WAYPOINTS[] (ordered cells the monkey hops)
      GridSystem.js              # cols x rows -> viewport px
      GridOverlay.js             # press 'g' in the browser to SEE the grid + landing cells
      WaypointController.js ★    # anchors (from grid cells) -> bezier arcs + the jump CURVE (arc/ease)
      ApeStateMachine.js  ★      # crouch->launch->airborne->land->exit + squash + dissolve timing
      ScrollChoreographer.js     # GSAP ScrollTrigger (scrub) -> progress 0..1
    render/
      ApeRenderer.js             # the CONTRACT (ApeFrame/ApeRenderer) — DO NOT change the interface
      PixiApeRenderer.js  ★      # placeholder pixel monkey; squash/stretch/flip live here
      ApeRendererFactory.js, capability gate in ../a11y/
    cursor/
      BananaCursor… (native CSS cursor now), BinaryDustField.js  # landing + exit 1010 dust
  CODEX-BRIEF.md, COLLABORATION.md   # full project brief + the Claude<->Codex working agreement
```
★ = the files you'll most likely touch for the jump feel.

## 3. The tools you have (use these instead of guessing/screenshots)

- **Move/add a hop:** edit the `WAYPOINTS[]` array (and `EXIT_CELL`) in `src/engine/layout.js` — each
  is a `{ col, row }` on the `GRID.cols × GRID.rows` grid (currently **12×12**). The jump path is now
  **decoupled from the sections** — add as many waypoints as you want for a denser DK staircase.
- **See the grid:** press **`g`** in the browser → overlay of the grid + the authored cells
  (`P0`–`P5`, `EXIT`) with col/row numbers. Press `g` again to hide.
- **Self-play (verify without screenshots):** `window.__sm.frameAt(progress)` returns the exact
  `ApeFrame` for any scroll progress `0..1`; `window.__wp.anchors` are the target points. Example —
  print the whole trajectory and the apex per segment:
  ```js
  const H = innerHeight;
  for (let p = 0; p <= 1; p += 0.05)
    console.log(p.toFixed(2), Math.round(window.__sm.frameAt(p).screenPos.y / H * 100) + '%',
                window.__sm.frameAt(p).state);
  ```

## 4. Current state (your starting point)

- **Layout (`layout.js`):** 12×12 grid. Monkey descends only DOWN, then a free-fall, then leaps away.
  Landing rows ≈ hero 4, "Like the moon" 5, "1010=binary" 6, "Right to left" 7, "What we do" 7,
  contatti 11; `EXIT_CELL` col 6 row 1. Cols zig-zag 3/10 (beside the text).
- **Arc (`WaypointController.js`):** `arc = clamp(20 + |dx|*0.07, 26, 56)` (apex height in px).
- **Jump curve (`WaypointController.positionAt`):** eased horizontal (easeInOutCubic) + asymmetric
  vertical (easeOut rise, easeIn fall); `vy` normalized [-1,1].
- **States/squash (`ApeStateMachine.js`):** crouch (anticipation) → launch → airborne → land pop;
  exit dissolve completes by `exitT ~0.55` (ape fully gone by progress ~0.94).
- **Bug already fixed (don't reintroduce):** at the bottom, the ape leaps away + dissolves, and the
  1010 dust emits ONLY while the dissolve is actively progressing (no perpetual dust when parked).

## 5. Your job — the feel

Make the descent read like a **polished Donkey-Kong** climb-down. Concretely, tune until it looks right:
1. **Jump height/weight** — the human felt the hops were "too high". Tune `arc` + easing so they feel
   like grounded platform hops, not floaty leaps. Add gravity-feel (faster fall than rise) if it helps.
2. **Landing** — squash & stretch weight, a small secondary settle, dust-burst timing.
3. **Free-fall** ("What we do" → contatti) — should read as a real *fall* (accelerating, weighty).
4. **Descent rhythm** — the whole top-to-bottom path should feel deliberate and fun. Adjust the
   `layout.js` cells if a landing sits wrong relative to its section's text (use `g` to judge).
5. **Exit** — the leap-away + dissolve-into-1010 should feel like a real jump-off.

## 6. Hard constraints + how to verify every change

- **Don't change the `ApeRenderer` contract.** Keep one PixiJS WebGL context. Respect
  `prefers-reduced-motion` / no-WebGL fallbacks and 60fps (this is an agency portfolio — fast = the pitch).
- **Verify each change three ways:**
  1. `npm run build` **and** `npm run lint` both pass.
  2. **Self-play:** landings still sit on their cells — `frameAt(i/7).screenPos ≈ __wp.anchors[i+1]`;
     trajectory stays on-screen; bottom is clean (no perpetual dust).
  3. **By eye:** scroll it in the browser and confirm it actually feels right (the part Claude can't do).
- Small PRs into `prototype/main`. Commit messages end with:
  ```
  Co-Authored-By: Codex <codex@openai.com>
  ```

See `COLLABORATION.md` for the full working agreement (lanes, branch flow, attribution).

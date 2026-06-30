# Codex task — polish the monkey's jump *feel* (Donkey-Kong descent)

> The grid/layout, engine, and bug-fixes are done (Claude's lane). This task is about **how the
> jump looks and feels** — arcs, timing, squash, weight — which needs a real pair of eyes in a
> browser. Keep the monkey landing on the authored grid cells; only tune the motion/feel.

## Run it
```bash
git clone https://github.com/icn44444444414/1010monky.se.fi.git
cd 1010monky.se.fi && npm install && npm run dev   # http://localhost:5173
git checkout prototype/main && git checkout -b feat/jump-feel
```

## What's already built (don't rebuild)
- **Grid layout system** — `src/engine/layout.js` defines a 12×8 grid and `LANDINGS[]` (one cell
  per section) + `EXIT_CELL`. The monkey snaps to these cells. **Edit cells here to move landings.**
- **Grid overlay** — press **`g`** in the browser to see the grid + the authored landing cells
  (P0–P5, EXIT) with col/row numbers. Toggle off with `g`.
- **Self-play hook** — `window.__sm.frameAt(progress)` returns the exact `ApeFrame` for any scroll
  progress 0..1 (`{ state, exit, facing, vy, squash, screenPos }`), and `window.__wp.anchors` are the
  target points. Use this to verify landings/trajectory **without** screenshots, e.g.:
  ```js
  for (let p=0; p<=1; p+=0.05) console.log(p, window.__sm.frameAt(p).screenPos);
  ```
- **Engine modules** (Claude owns — don't change the contract):
  `WaypointController` (anchors→bezier arcs + the asymmetric jump curve), `ApeStateMachine`
  (crouch→launch→airborne→land→exit + squash), `ScrollChoreographer` (GSAP ScrollTrigger, scrub).
- **Renderer** (`PixiApeRenderer`) — placeholder pixel monkey behind the `ApeRenderer` contract.

## Your job — the feel
1. **Tune the jump arcs.** Self-play flags that the two big vertical hops (up onto the `servizi`
   platform, and the `servizi→contatti` free-fall) peak near the very top of the screen (apex ~2–6%).
   Decide by eye whether that's a great DK leap or "too much," and tune the apex (`WaypointController`
   `arc = …`) and/or the easing so the descent reads as a clean platform-to-platform Donkey-Kong hop.
2. **Landing feel** — squash & stretch weight, a tiny secondary bounce, dust-burst timing on landing.
3. **Free-fall feel** — the big drop should read as a *fall* (fast, weighty), not a lazy arc.
4. **Exit** — the leap-away + dissolve-into-1010 (already completes by progress ~0.94). Make the leap
   feel like a real jump-off; keep it fully gone before the page bottom (no lingering dust — that bug
   is fixed, don't reintroduce it).

## Hard constraints
- **Landings must stay on the authored grid cells** (verify with self-play: `frameAt(i/7).screenPos`
  ≈ `__wp.anchors[i+1]`). Don't move landings unless updating `layout.js` deliberately.
- Don't touch the `ApeRenderer` contract. Keep it on PixiJS (one WebGL context). Respect
  reduced-motion / no-WebGL fallbacks and 60fps.
- Verify every change: `npm run build` + `npm run lint` pass; self-play shows on-cell landings,
  on-screen trajectory, and a clean bottom (no perpetual dust). PR into `prototype/main`.

## Commit attribution
Author your commits and add the trailer (see `COLLABORATION.md`):
```
Co-Authored-By: Codex <codex@openai.com>
```

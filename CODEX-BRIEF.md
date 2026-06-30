# Codex Build Brief — 1010monky.se.fi "Binary Monkey" Pixel Mascot Prototype

> **Read this whole file before writing code.** Senior front-end + interaction-design spec for a
> high-value engagement. Build the **engine and integration** to a senior standard. The hero **pixel
> sprite art** is a separate authored asset (see §13) — your job is to make swapping it in trivial and
> to ship an impressive **base prototype** now.

---

## 1. Concept & goal

**1010monky** — the name encodes **binary** (`1010`). The mascot is therefore a **pixel-art monkey**:
an 8-bit / retro-digital ape, friendly and characterful, that feels *made of bits*. It replaces the
static moon logo as the brand's animated centerpiece and **jumps between the page's panels as the user
scrolls**, launching from the moon and **leaping off-screen at the footer — dissolving into a stream of
1s and 0s**. The mouse cursor becomes a **pixel banana** trailing **yellow dust mixed with falling
binary digits**.

This is the **base/wireframe** — a senior interactive foundation we keep building on. It must feel
intentional and premium even before the final sprite art lands.

**Target site:** `1010monky.se` (the agency's own site). For the prototype stage we reuse an existing
panel layout (the downloaded `bloon.it` hero markup as a stand-in canvas); the waypoint engine is
**stage-agnostic**, so it retargets to the real 1010monky.se DOM later with no engine change.

## 2. Quality bar & the art/engine split (non-negotiable)

Two lanes — **never blur them**:
- **Engine (YOUR job):** scroll-driven jump choreography, monkey state machine, renderer abstraction,
  pixel banana cursor + binary dust, performance, accessibility, deploy.
- **Hero sprite art (NOT your job):** a polished pixel monkey with proper directional poses is an
  authored **sprite sheet** (Aseprite). You integrate a **placeholder sprite atlas** behind a clean
  interface so the real art swaps in with zero engine changes.

Never hand-author the final pixel art in code. A code-drawn sprite reads as cheap. The placeholder must
look *deliberately* clean (a simple but readable pixel monkey), and the architecture makes the real
sheet a drop-in.

## 3. Scope of THIS deliverable

**In scope:**
1. Vite + TS project (`1010monky.se.fi/`) loading a panel-based stage.
2. A **pixel-art monkey** (PixiJS sprite) driven by a **scroll-linked waypoint system**.
3. A **state machine** (idle/perch → crouch → launch → airborne → land → exit-dissolve).
4. **Pixel banana cursor** + **yellow-dust-and-binary** particle trail.
5. Full **reduced-motion / mobile / no-WebGL fallbacks**.
6. **Static build** + nginx/VPS deploy note.

**Out of scope (flag, don't fake):** final hero sprite sheet, sound design, CMS.

## 4. Tech stack (use exactly this)

| Concern | Choice | Notes |
|---|---|---|
| Bundler/dev | **Vite** (vanilla, ES modules) | |
| Scroll choreography | **GSAP** + **ScrollTrigger** + **MotionPathPlugin** | free; backbone of jump timing |
| Sprite rendering | **PixiJS v8** (WebGL 2D) | sprites, texture atlases, filters; perfect for pixel art + effects |
| Pixel fidelity | nearest-neighbor scaling, integer upscale | crisp pixels at any DPR |
| Retro FX | PixiJS filters (subtle scanline/CRT, glow on moon) | tasteful, off under reduced-motion |
| Binary/dust particles | lightweight custom emitter on a Pixi `ParticleContainer` | yellow dust + falling `0/1` glyphs |
| Smooth scroll | **Lenis** (optional) | buttery inertia scroll that ScrollTrigger syncs to |
| **Advanced CSS** | modern CSS: custom properties, container queries, scroll-driven animations, blend modes, `image-rendering: pixelated` | the CSS layer is first-class — crisp pixels, retro glow, layout |
| Page/UI styling | **Tailwind CSS** (optional, recommended) | fast utility layout for the page/stage chrome; the mascot itself is Pixi/canvas, not CSS |
| Language | **JavaScript (ES modules)** — *no TypeScript* | plain JS + CSS; JSDoc typedefs keep the contracts normative |
| Lint/format | ESLint + Prettier | |

> **Engineer's discretion:** the goal is the *best-looking ape jump*, not a fixed shopping list. The
> tools above are the recommended baseline — substitute or add whatever genuinely serves the result
> (Tailwind if it's faster, a physics lib for liveliness, a better particle system). Just keep it
> plain-JS + CSS land, keep the pixel aesthetic, and respect the perf budget (§11).

Rationale: PixiJS is the senior choice for performant pixel-art 2D with shader effects — exactly the
"rich library, very visually rich" bar, in the *pixel* idiom the binary concept calls for. (3D/Three.js
is explicitly NOT used — wrong aesthetic for an 8-bit monkey.)

**Library budget — the jump comes first.** Keep the *language* to plain JavaScript + CSS (no
TypeScript, no app framework like React/Vue), but **library weight is NOT a constraint**: pull in any
heavy JS/CSS library that makes the ape's jump look genuinely better. Encouraged where they earn their
weight:
- **GSAP plugins** — `MotionPathPlugin` (arc paths), `CustomEase`/`CustomBounce` (natural launch +
  squashy landing), `Physics2DPlugin` (gravity/velocity-driven arcs) — all free now.
- **Matter.js** (optional) — real rigid-body physics if a tuned GSAP arc isn't lively enough.
- **PixiJS filters** + a particle lib for the dust/binary FX.
Choose per result quality, not bundle size — the jump must feel *alive*. (Still respect the perf
budget in §11 via lazy-load + quality tiers; heavy ≠ unoptimized.)

## 5. Folder structure

```
1010monky.se.fi/
  index.html                 # panel-based stage (bloon hero markup as stand-in; panels = waypoints)
  public/
    stage/                   # stage assets copied in (no live hotlinks)
    sprites/monkey/          # PLACEHOLDER pixel atlas + JSON frames (swappable)
      monkey.atlas.png
      monkey.atlas.json
    cursor/banana.png        # pixel banana (nearest-neighbor)
  src/
    main.js
    engine/
      WaypointController.js   # DOM panels -> stage coords, builds jump arcs
      ScrollChoreographer.js  # GSAP ScrollTrigger: scroll progress -> jumps (scrub)
      ApeStateMachine.js      # idle/crouch/launch/airborne/land/exit transitions
    render/
      ApeRenderer.js          # JSDoc INTERFACE (swap seam) + typedefs
      PixiApeRenderer.js      # PixiJS sprite implementation (placeholder atlas)
      ApeRendererFactory.js   # picks renderer / fallback by capability
    cursor/
      BananaCursor.js         # pixel banana follower
      BinaryDustField.js      # yellow dust + falling 0/1 particles
    fx/
      filters.js              # scanline/CRT/glow setup (reduced-motion aware)
    a11y/
      capability.js           # WebGL + reduced-motion + touch detection
      Fallback.js             # static pixel-monkey image / no-motion path
    styles/ stage.css, cursor.css
  vite.config.js
  README.md
```

## 6. Pixel art strategy (the swap seam)

- Ship a **placeholder sprite atlas** (`monkey.atlas.png` + JSON) with named animation tags. Keep it
  small and readable (a simple charming pixel monkey). It MUST expose the animation tags in §9 so the
  bespoke sheet is a drop-in.
- All rendering goes through **`ApeRenderer`**. The engine NEVER imports PixiJS directly. The real
  sprite sheet (or an alternate art set) swaps in via `ApeRendererFactory` with no engine change.

```js
// render/ApeRenderer.js  (normative contract — JSDoc typedefs, plain JS)
/**
 * @typedef {'perch'|'crouch'|'launch'|'airborne'|'land'|'exit'} ApeState
 * @typedef {'left'|'right'} Facing
 *
 * @typedef {Object} ApeFrame
 * @property {ApeState} state
 * @property {Facing}   facing                  // flips/sprite-selects directional poses
 * @property {number}   progress                // 0..1 within current state/segment
 * @property {{x:number, y:number}} screenPos   // stage-pixel position
 * @property {number}   squash                  // 0..1 squash&stretch hint
 * @property {number}   vy                      // vertical velocity sign -> rise/fall frame
 *
 * @typedef {Object} ApeRenderer
 * @property {(container: HTMLElement) => Promise<void>} mount      // load atlas, set up Pixi, pixel scaling
 * @property {(frame: ApeFrame) => void}                 setFrame   // called every rAF tick
 * @property {(w: number, h: number) => void}            resize
 * @property {(tier: 'high'|'medium'|'low') => void}     setQuality // toggles FX filters
 * @property {() => void}                                dispose
 */
```

## 7. Architecture & data flow

```
scroll position
   │
   ▼
ScrollChoreographer (GSAP ScrollTrigger, scrub)  ──progress──►  ApeStateMachine
   │                                                                 │ emits ApeState + segment progress
   ▼                                                                 ▼
WaypointController (panel rects → stage coords, bezier arcs)
   │
   └──────────────►  ApeRenderer.setFrame(ApeFrame)  (Pixi draws; banana cursor & dust independent)
```

- **WaypointController:** measure each `.panel` + footer on load/resize, convert to stage-pixel coords,
  precompute a **bezier jump arc** per segment (apex ∝ horizontal distance; gravity-like ease).
- **ScrollChoreographer:** one master GSAP timeline, `scrub: true` so the monkey is **scroll-linked**
  (scrub back = jump reverses). Each scroll segment = one jump (crouch→launch→airborne→land).
- **ApeStateMachine:** thresholds within a segment → discrete states; sets `facing`/`vy` from arc
  direction so directional sprite frames are selected.

## 8. Jump choreography — mapped to the stage panels

Waypoints in order (these exist in the stand-in markup):
`#moonStage` (start perch) → `section.panel.hero` → `.panel.left` → `.panel.right` → `.panel.left`
→ `.panel.svc#servizi` → `.panel.contact#contatti` → **footer → exit-dissolve**.

Rules:
- **Alternate landing side** each panel (R↔L) so the monkey visibly shows different directional poses.
- Arc apex scales with distance; landings trigger **squash** + a **dust+binary burst** at the feet.
- **Exit beat:** at the footer the monkey leaps past the top of the viewport and **dissolves into a
  rising stream of `1` and `0` glyphs** (the signature 1010monky moment).
- The pixel moon recoils slightly on launch (keep subtle).

## 9. Monkey state machine & required sprite animation tags

States: `perch → crouch → launch → airborne → land → … → exit`. Placeholder atlas exposes these
**named animation tags** (engine references by name, so the bespoke sheet just matches names):

- `idle` (perch breathing), `crouch`, `launch`, `jump_up`, `jump_down`, `land`,
  `exit_dissolve` (pixels scatter into 0/1).
- Each directional tag has **left/right variants** OR a single set + horizontal flip via `facing`
  (document which; flipping is acceptable for the placeholder).

Frame playback via a sprite-sheet animator (Pixi `AnimatedSprite` or a tag-driven frame picker);
crossfade is not needed for pixel art (hard frame cuts are correct). `jump_up`/`jump_down` chosen by
`vy` sign.

## 10. Pixel banana cursor + binary dust

- **BananaCursor:** hide native cursor on the stage (`cursor: none`), draw the **pixel banana**
  following the pointer with slight spring lag + tilt toward velocity, nearest-neighbor scaled.
  **Restore native cursor over interactive elements** (`a, button, input, [role=button]`).
- **BinaryDustField:** Pixi `ParticleContainer` emitting **yellow dust pixels** + occasional **falling
  `0`/`1` glyphs** on pointer movement (size/alpha falloff, slight gravity). Cap particle count
  (≤ ~300). Emit a **burst** at the monkey's feet on each `land`, and the big **1010 stream** on `exit`.
- Both no-op under reduced-motion / touch (see §11).

## 11. Accessibility, performance, mobile — HARD requirements

- **`prefers-reduced-motion: reduce`** → no jumping, no custom cursor, no dust/FX; show a static
  perched pixel monkey. Page fully usable.
- **No-WebGL / context loss** → `Fallback` renders a static pixel-monkey image; no errors.
- **Touch / small screens** → no custom cursor; simplify or disable jump choreography; content first.
- **Perf:** 60fps mid-range laptop. Pixel scaling must stay crisp (integer/nearest). Lazy-init Pixi
  after first paint; pause rAF when offscreen (`IntersectionObserver` + `visibilitychange`); FX filters
  gated by `setQuality`. Cap particles.
- **Layout independence:** waypoints recomputed on resize/font-load so jumps align to panels.

## 12. Static build & VPS deploy (nginx)

- `npm run build` → static `dist/` (html/js/css + atlas PNG/JSON + cursor PNG). **No server runtime**;
  rendering is client-side WebGL.
- Deploy = copy `dist/` to the server, point an nginx `root` at it (same pattern as the existing
  `kikab` static site). Document in `README.md`:
  - gzip/brotli + long `Cache-Control` for `*.png, *.json, *.js, *.woff2`.
  - HTTPS (Certbot already on host); `try_files $uri $uri/ /index.html;`.
- Node needed **only at build time**.

## 13. Out of scope + handoff to the pixel artist

Do **not** author the final monkey art in code. Leave:
- `public/sprites/monkey/README.md`: placeholder description + license + the **required animation tag
  names** (§9), the canvas/frame size, pivot (feet at bottom-center), and palette notes.
- `SPRITE_CONTRACT.md`: atlas format (PNG + JSON frames/tags), per-tag frame counts/fps, pixel grid
  size (e.g. 64×64 cells), directional handling (variants vs flip), and the **1010 palette** (tie the
  yellows of the banana/dust + a binary green/blue to the 1010monky brand).

(The separate art-direction brief — pixel style, palette, the directional pose set, the dissolve-to-1010
frames — goes to the pixel artist; you only consume the resulting atlas via the contract.)

## 14. Build order (milestones — commit at each)

1. **M0 Scaffold:** Vite+TS+ESLint; stage markup + assets in `public/stage`; page renders.
2. **M1 Renderer seam:** `ApeRenderer` interface + `PixiApeRenderer` showing the placeholder monkey
   perched on the moon, pixel-crisp, playing `idle`.
3. **M2 Waypoints:** `WaypointController` measuring panels → stage coords; debug-draw arcs.
4. **M3 Scroll jumps:** `ScrollChoreographer` + `ApeStateMachine` → monkey jumps panel-to-panel on
   scroll, alternating sides, with crouch/launch/land + squash.
5. **M4 Exit dissolve:** footer leap off-screen + **dissolve into 1010** stream.
6. **M5 Cursor & dust:** pixel banana cursor + yellow/binary dust + landing bursts.
7. **M6 FX + a11y/perf/mobile:** scanline/glow filters, reduced-motion, no-WebGL fallback, touch, quality tiers, offscreen pausing.
8. **M7 Build & deploy doc:** production build + nginx notes; verify `dist/` from a static server.

## 15. Definition of done

- Scrolling makes the pixel monkey **jump panel-to-panel**, visibly **alternating directional poses**,
  and **dissolve into 1s and 0s** as it exits at the footer; scrubbing back reverses it.
- Pixel banana cursor + yellow/binary dust work on desktop; both disabled on touch/reduced-motion.
- Swapping `monkey.atlas.*` for another correctly-tagged sheet requires **no engine code changes**.
- Crisp pixels at any DPR; 60fps mid laptop; graceful fallback, zero console errors without WebGL.
- `npm run build` → static `dist/` that runs behind nginx with the documented config.

## 16. Coding standards

**Plain JavaScript (ES modules) — no TypeScript.** JSDoc-typed module boundaries (the typedefs above
are normative), no engine→render concrete coupling, small focused modules, JSDoc on public methods, a
two-command `README.md`. Stay to **advanced CSS + advanced JS libraries** only. Pixel-perfect by
default; clarity over cleverness — we are continuing this codebase.

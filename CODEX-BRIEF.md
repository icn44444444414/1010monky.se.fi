# Codex Build Brief — BLOON "Jumping Ape" Mascot Prototype

> **Read this whole file before writing code.** This is a senior front-end + interaction-design
> spec for a high-value client engagement. Build the **engine and integration** to a senior
> standard. The final hero *artwork* is a separate commissioned asset (see §13) — your job is to
> make swapping it in trivial, and to ship an impressive **base prototype** now.

---

## 1. Context & goal

`bloon.it` is the site of an Italian communication agency. Its brand metaphor is **the Moon**
("la Luna"): a live `<canvas id="moon">` sits fixed and centered behind the content, and the copy
repeatedly references the moon ("Come la Luna…", "come ogni fase della Luna").

**Goal of this prototype:** introduce a **friendly cartoon ape mascot** that *replaces the static
moon logo as the brand's animated centerpiece* and **jumps between the page's panels as the user
scrolls**, using the blue moon as its launch perch. At the final panel it **leaps off-screen**. The
**mouse cursor becomes a banana** that trails **yellow dust**.

This is the **base/wireframe** — a strong, senior-grade interactive foundation we will keep
building on. It must feel intentional and premium even before the bespoke ape art lands.

## 2. Non-negotiable quality bar & the art/engine split

This is for a flagship engagement. Two separate lanes — **do not blur them**:

- **Engine (YOUR job, this brief):** scroll-driven jump choreography, ape state machine, renderer
  abstraction, banana cursor + dust, performance, accessibility, deploy. Build this to a senior
  standard now.
- **Hero ape artwork (NOT your job):** a "very visually rich" ape with proper angles is a
  commissioned **3D/illustration** deliverable. You integrate a **placeholder rigged model** behind
  a clean interface so the real asset swaps in with zero engine changes.

Never hand-draw the final ape in code. A code-authored character will read as cheap. Your placeholder
must look *deliberately* clean, and the architecture must make the real asset a drop-in.

## 3. Scope of THIS deliverable

**In scope:**
1. Vite project (`bloon-ape-prototype/`) that loads bloon.it's existing index markup as the stage.
2. A **3D ape** (Three.js) rendered over the page, driven by a **scroll-linked waypoint system**.
3. A **state machine** for the ape (idle/perch → crouch → launch → airborne → land → exit).
4. **Banana custom cursor** with a **yellow dust** particle trail.
5. Full **reduced-motion / mobile / no-WebGL fallbacks**.
6. **Static build** + an nginx/VPS deploy note.

**Out of scope (flag, don't fake):** bespoke ape illustration/rig, final sound design, CMS.

## 4. Tech stack (use exactly this)

| Concern | Choice | Notes |
|---|---|---|
| Bundler/dev | **Vite** (vanilla, ES modules) | `npm create vite@latest` → vanilla-ts or vanilla |
| Scroll choreography | **GSAP** + **ScrollTrigger** + **MotionPathPlugin** | GSAP is fully free; the backbone of the jump timing |
| 3D ape | **Three.js** (+ `GLTFLoader`, `DRACOLoader`) | renders the rigged ape model; gives real angles/lighting |
| Dust particles | lightweight **custom canvas emitter** (rAF) | avoid heavy deps; ~tsParticles optional but prefer custom |
| Language | **TypeScript** | typed module contracts below are normative |
| Lint/format | ESLint + Prettier | match a clean senior config |

Rationale: the page just serves static files; all 3D runs client-side in WebGL. 3D (not flat SVG)
is what delivers "visually rich" + genuine angles as the ape rotates through jumps.

## 5. Folder structure

```
bloon-ape-prototype/
  index.html                 # bloon.it hero markup adapted as the stage (panels kept as waypoints)
  public/
    stage/                   # bloon.it assets copied in (immagini, fonts.css) — DO NOT hotlink live site
    models/ape/ape.glb       # PLACEHOLDER rigged ape (swappable). Draco-compressed.
    cursor/banana.svg
  src/
    main.ts                  # bootstraps everything, wires modules
    engine/
      WaypointController.ts   # maps DOM panels -> 3D world positions, builds jump arcs
      ScrollChoreographer.ts  # GSAP ScrollTrigger timeline binding scroll progress -> jumps
      ApeStateMachine.ts      # idle/crouch/launch/airborne/land/exit transitions
    render/
      ApeRenderer.ts          # INTERFACE (the swap seam) + types
      ThreeApeRenderer.ts     # Three.js implementation (placeholder model)
      ApeRendererFactory.ts   # picks renderer / fallback based on capability
    cursor/
      BananaCursor.ts         # custom cursor follower
      DustField.ts            # yellow dust canvas particle system
    a11y/
      capability.ts           # WebGL + reduced-motion + mobile detection
      Fallback.ts             # static-image / no-motion fallback path
    styles/
      stage.css, cursor.css
  vite.config.ts
  README.md                  # run + build + deploy
```

## 6. The ape art strategy (the swap seam)

- Ship a **placeholder rigged glTF ape** with named animation clips (see clip list in §9). Source a
  free/licensed CC/royalty-rigged cartoon ape (e.g. from a reputable model marketplace; record the
  license in `README.md`). It must have a skeleton and at least Idle + Jump clips, or be riggable.
- All rendering goes through the **`ApeRenderer` interface**. The engine NEVER imports Three.js
  directly. When the bespoke model (or a Rive/Lottie variant) arrives, we implement the interface
  once and swap in `ApeRendererFactory` — no engine changes.

```ts
// render/ApeRenderer.ts  (normative contract)
export type ApeState =
  | 'perch'        // sitting on the moon
  | 'crouch'       // anticipation before a jump
  | 'launch'       // push-off
  | 'airborne'     // in flight (carries direction + progress)
  | 'land'         // impact/settle on target panel
  | 'exit';        // final leap out of viewport

export type Facing = 'left' | 'right';

export interface ApeFrame {
  state: ApeState;
  facing: Facing;
  progress: number;     // 0..1 within the current state/segment
  worldPos: { x: number; y: number; z: number };
  rotationY: number;    // yaw so the ape angles toward travel direction
  squash: number;       // 0..1 squash&stretch hint for landings/launches
}

export interface ApeRenderer {
  mount(container: HTMLElement): Promise<void>;   // load model, set up scene/lights/camera
  setFrame(frame: ApeFrame): void;                // called every rAF tick by the engine
  resize(w: number, h: number): void;
  setQuality(tier: 'high' | 'medium' | 'low'): void;
  dispose(): void;
}
```

## 7. Architecture & data flow

```
scroll position
   │
   ▼
ScrollChoreographer (GSAP ScrollTrigger)  ──progress──►  ApeStateMachine
   │                                                          │ emits ApeState + segment progress
   ▼                                                          ▼
WaypointController (panel DOM rects → world coords, arc paths)
   │  provides start/end/control points per segment
   ▼
   └──────────────►  ApeRenderer.setFrame(ApeFrame)  (Three.js draws; banana cursor & dust independent)
```

- **WaypointController**: on load + resize, measure each `.panel` (and the footer) bounding rect,
  convert to the renderer's world/overlay coordinate space, and precompute a **bezier jump arc**
  between consecutive waypoints (apex height ∝ horizontal distance; gravity-like easing).
- **ScrollChoreographer**: one master GSAP timeline pinned to scroll. Each segment of scroll maps to
  one jump (crouch→launch→airborne→land). Use `scrub: true` so the ape position is **scroll-linked**
  (driven by scroll, not autoplaying) — scrubbing back reverses the jump.
- **ApeStateMachine**: converts continuous segment progress into discrete states with thresholds
  (e.g. 0–0.12 crouch, 0.12–0.2 launch, 0.2–0.85 airborne, 0.85–1 land) and sets `facing`/`rotationY`
  from the segment's horizontal direction.

## 8. Jump choreography — mapped to bloon's real panels

Waypoints, in order (these IDs/classes exist in the markup):

1. **`#moonStage`** — start perch (ape sits on the moon).
2. `section.panel.hero`
3. `section.panel.left`  → ape lands camera-left
4. `section.panel.right` → ape lands camera-right (so it visibly **alternates R↔L**, giving the
   "right-to-left" angle changes you want)
5. `section.panel.left`
6. `section.panel.svc#servizi`
7. `section.panel.contact#contatti`
8. **footer** → final waypoint, then **`exit`**: ape leaps on an arc that **continues past the top
   of the viewport and is culled** (the "jumps out of screen" beat).

Rules:
- Alternate landing side each panel so the ape yaws and shows different angles in flight.
- Arc apex scales with distance; landings trigger a **squash** + a small dust burst at the feet.
- The moon (`#moonStage`) reacts subtly when the ape launches from it (tiny recoil) — keep it light.

## 9. Ape state machine & required animation clips

States: `perch → crouch → launch → airborne → land → (next) … → exit`.

Placeholder glTF should expose (or be retargeted to) these **named clips**; engine references clips
by name so the bespoke model just needs matching names:

- `Idle` (perch breathing), `Crouch`, `Launch`, `AirborneUp`, `AirborneDown`, `Land`, `ExitLeap`.

Blend between clips on transitions (Three.js `AnimationMixer` crossfade ~120ms). `airborne` selects
`AirborneUp`/`AirborneDown` by vertical velocity sign. `facing`/`rotationY` set per segment direction.

## 10. Banana cursor + yellow dust

- **BananaCursor**: hide native cursor on the stage (`cursor: none`), render `banana.svg` following
  the pointer with slight spring lag + rotation toward velocity. **Restore the native cursor over
  interactive elements** (`a, button, input, [role=button]`) — usability first.
- **DustField**: full-viewport `<canvas>` particle emitter. On pointer movement, spawn warm **yellow
  dust** particles (size/alpha falloff, slight gravity, additive blend). Throttle spawn rate; cap
  particle count (e.g. ≤ 300). Also emit a **burst** at the ape's feet on each `land`.
- Both must no-op under reduced-motion / touch (see §11).

## 11. Accessibility, performance, mobile — HARD requirements

- **`prefers-reduced-motion: reduce`** → disable jumping, custom cursor, and dust; show the ape as a
  static perched pose (or a single hero image). Page must be fully usable.
- **No-WebGL / context-loss** → `Fallback` renders a static ape image; no errors.
- **Touch / small screens** → no custom cursor; simplify or disable the jump choreography (perf +
  no hover model); keep content first.
- **Perf budget:** 60fps on a mid-range laptop. Transforms/WebGL only; no layout thrash. Draco-compress
  the model; lazy-init Three.js after first paint; pause rAF when the tab/section is offscreen
  (`IntersectionObserver` + `visibilitychange`). Quality tiers via `setQuality`.
- **Layout independence:** waypoints recomputed on `resize`/font-load so jumps always align to panels.

## 12. Static build & VPS deploy (nginx)

- `npm run build` → `dist/` of static assets (html/js/css + `.glb`/`.svg`/textures). **No server
  runtime needed** — 3D is client-side.
- Deploy = copy `dist/` to the server and point an nginx `root` at it (same pattern as the existing
  `kikab` static site). Include in `README.md`:
  - gzip/brotli + long `Cache-Control` for `*.glb, *.js, *.wasm, *.woff2`.
  - serve over HTTPS (Certbot already present on the host).
  - SPA-style `try_files $uri $uri/ /index.html;` fallback.
- Node is required **only at build time**, not to run the site.

## 13. Out of scope + handoff to the artist

Do **not** attempt to author the final "visually rich" ape in code. Leave:
- `public/models/ape/README.md` documenting the placeholder model, its license, the **required clip
  names** (§9), and the expected scale/orientation/origin so the bespoke model is a drop-in.
- A `MODEL_CONTRACT.md`: skeleton/clip naming, forward axis, unit scale, foot origin at model origin,
  texture/material expectations (PBR), poly budget for web.

(The separate art-direction brief — style, palette tied to bloon's blue `#0c78b4` + moon, the angle
turnaround sheet, jump poses — will be supplied to the illustrator; you only consume the resulting
asset via the contract above.)

## 14. Build order (milestones — commit at each)

1. **M0 Scaffold:** Vite+TS+ESLint; copy bloon hero markup + assets into `public/stage`; render the
   existing page with the moon canvas working.
2. **M1 Renderer seam:** `ApeRenderer` interface + `ThreeApeRenderer` showing a placeholder ape
   perched on the moon, lit, with `Idle`.
3. **M2 Waypoints:** `WaypointController` measuring panels → world coords; debug-draw the arcs.
4. **M3 Scroll jumps:** `ScrollChoreographer` + `ApeStateMachine` → ape jumps panel-to-panel on
   scroll, alternating sides, with crouch/launch/land + squash.
5. **M4 Exit beat:** footer leap off-screen + cull.
6. **M5 Cursor & dust:** banana cursor + yellow dust + landing bursts.
7. **M6 A11y/perf/mobile:** reduced-motion, no-WebGL fallback, touch behavior, quality tiers, offscreen pausing.
8. **M7 Build & deploy doc:** production build + nginx notes; verify `dist/` runs from a static server.

## 15. Definition of done

- Scrolling the page makes the ape **jump panel-to-panel**, visibly **alternating angles**, and
  **leap off-screen at the footer**; scrubbing back reverses it.
- Banana cursor + yellow dust work on desktop; both correctly disabled on touch/reduced-motion.
- Swapping `ape.glb` for another correctly-named rigged model requires **no engine code changes**.
- 60fps on a mid laptop; graceful fallback with no console errors when WebGL/motion is unavailable.
- `npm run build` produces a static `dist/` that runs behind nginx with the documented config.

## 16. Coding standards

Typed module boundaries (the interfaces above are normative), no global state leaks, no engine→render
concrete coupling, small focused modules, JSDoc on public methods, and a `README.md` a new dev can run
in two commands. Prefer clarity over cleverness — we are continuing this codebase.

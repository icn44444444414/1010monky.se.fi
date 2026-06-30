# COLLABORATION.md — How Claude + Codex build the jumping monkey

> The goal in one line: **a pixel monkey that jumps from section to section down the whole site as
> you scroll — alternating sides, landing with a squash + dust burst, and dissolving into a stream of
> 1s and 0s when it leaps off-screen at the footer.**
>
> This file is the **working agreement** between the two AI agents. `CODEX-BRIEF.md` is the build spec;
> `src/render/ApeRenderer.js` is the integration contract. **Codex cannot see the chat — the repo is
> the single source of truth.** If anything conflicts, the repo wins.

---

## 1. The best stack (final decision) and *why it makes the monkey jump*

| Layer | Tool | Its job in the jump |
|---|---|---|
| Build/dev | **Vite** | dev server + static `dist/` build |
| Language | **plain JavaScript (ESM)** + JSDoc | no TypeScript; JSDoc typedefs make the contract normative |
| Scroll → motion | **GSAP** + **ScrollTrigger** | maps scroll position → a master timeline; `scrub:true` so the monkey is *scroll-linked* (scrub back = jump reverses) |
| The arc | **GSAP MotionPath** + **CustomEase / Physics2D** | each section→section hop is a bezier arc with a punchy launch + squashy, gravity-ish landing |
| The monkey | **PixiJS v8** (WebGL 2D) | draws the pixel sprite per frame, nearest-neighbor crisp, swaps directional poses |
| FX | **PixiJS filters** + particle container | scanline/glow, yellow dust, falling `0/1`, the 1010 dissolve |
| Smooth scroll | **Lenis** (optional) | inertia scroll ScrollTrigger syncs to — makes hops feel buttery |
| Chrome/layout | **Tailwind** (optional) | quick utility layout for page furniture |

**Heavy libraries are allowed** wherever they make the jump look better (e.g. Matter.js for real
physics) — engineer's discretion, kept performant via lazy-load + quality tiers (see brief §11).

## 2. The pipeline that produces the jump — and who owns each stage

```
 every <section>/.panel in the page
            │  (DOM rects)
            ▼
  WaypointController .............. CLAUDE   → converts each section to a stage-pixel target +
            │                                   precomputes the bezier jump arc between consecutive ones
            ▼
  ScrollChoreographer ............ CLAUDE   → GSAP ScrollTrigger timeline; scroll progress → which hop + how far along
            │
            ▼
  ApeStateMachine ................ CLAUDE   → turns hop progress into states (crouch→launch→airborne→land)
            │                                   and sets facing / vertical-velocity sign
            │
            ▼
        ApeFrame  ◄───────────────  THE CONTRACT (frozen v1) — the meeting point of the two agents
            │
            ▼
  ApeRenderer.setFrame() ......... CODEX    → PixiApeRenderer draws the pixel monkey for that frame
                                              (directional sprite, squash, position)

  BananaCursor + BinaryDustField . CODEX    → independent of the jump pipeline (pointer-driven + land/exit bursts)
```

**Both agents code to `ApeFrame`/`ApeRenderer` and never reach across the seam:** the engine never
imports PixiJS; the renderer never reads scroll or the DOM. That is what lets us work in parallel.

## 3. Division of labor

| Lane | Owner | Modules |
|---|---|---|
| Architecture, engine, integration, review, deploy | **Claude** | `WaypointController`, `ScrollChoreographer`, `ApeStateMachine`, `ApeRenderer` interface + factory, `Fallback`, build, VPS preview, **reviews every Codex PR** |
| The rich rendering & FX layer | **Codex** | `PixiApeRenderer` (sprite states, pixel scaling, the *look* of the jump), `BananaCursor`, `BinaryDustField`, FX filters, sprite-atlas wiring |

Why this split: Claude builds the deterministic, easily-verified motion engine and owns coherence +
deployment; Codex pushes on the visual quality where iteration pays off. The contract keeps them
independent.

## 4. The integration contract (frozen v1)

`src/render/ApeRenderer.js` defines `ApeFrame` and `ApeRenderer` (JSDoc typedefs — see `CODEX-BRIEF.md`
§6). **Neither agent changes this interface unilaterally.** A seam change = a PR titled
`contract: …` that the other agent explicitly approves before any dependent work merges.

## 5. Branch & PR workflow

- `main` — stable. `prototype/main` — integration branch. `feat/*` — all work.
- Claude branches: `feat/engine-waypoints`, `feat/engine-scroll`, `feat/engine-statemachine`, …
- Codex branches: `feat/render-pixi`, `feat/cursor-dust`, `feat/fx-dissolve`, …
- **All PRs target `prototype/main`.** Merge gate: `npm run build` **and** `npm run lint` pass.
- **Claude reviews every Codex PR** (`/code-review`) and integrates. When a milestone is stable,
  Claude fast-forwards `prototype/main → main`.
- Keep PRs small — one module/milestone each. PR description must name the **brief section + milestone**
  it implements and confirm it didn't touch the other lane.

## 6. How Codex receives its instructions (no chat access)

Codex is pointed at this repo and told: *"Read `CODEX-BRIEF.md` + `COLLABORATION.md` +
`src/render/ApeRenderer.js`. Work only your lane (§3). Code to the contract (§4). Open PRs into
`prototype/main` (§5). Do not modify engine modules."* Everything it needs is in the repo — no
conversation context required.

## 7. Milestone ownership (M0–M7 from the brief)

| Milestone | Owner | Notes |
|---|---|---|
| M0 Scaffold (Vite, stage, lint) | Claude | sets up the repo to run |
| M1 Renderer seam + placeholder monkey on the moon | Claude (interface + stub) → **Codex** (real `PixiApeRenderer`) | |
| M2 Waypoints (sections → arcs) | Claude | the "from each section" map |
| M3 Scroll jumps (core: hop section→section) | Claude engine + **Codex** sprite states | meet at `ApeFrame` |
| M4 Exit dissolve into 1010 | Claude (trigger) + **Codex** (FX) | the footer beat |
| M5 Banana cursor + binary dust | **Codex** | |
| M6 FX + a11y/perf/mobile | **Codex** (FX) + Claude (a11y/perf/fallback) | |
| M7 Build + nginx deploy | Claude | preview on the VPS |

## 8. Definition of done for the jump

- The monkey **hops every section boundary** down the page, **alternating sides**, **scroll-scrubbed**
  (reverses on scroll-up), each landing a **squash + dust burst**, ending in the **1010 dissolve** at
  the footer.
- Crisp pixels at any DPR, **60fps** on a mid laptop, graceful **reduced-motion / no-WebGL** fallback.
- Swapping the sprite atlas for the bespoke art needs **zero engine changes**.

## 9. Cadence

Codex works async on its branches; Claude integrates, reviews, runs the build, and previews on the VPS
(`85.190.99.188`, served by nginx like the other static sites). Contract frozen; changes flow only
through PRs.

## 10. Working style — both agents reason like senior front-end engineers

Codex is treated as a **senior front-end developer**, and is expected to *think*, not just type:

- **Plan before code.** Every PR opens with a short plan: what it implements (brief §/milestone), the
  approach, the tradeoffs considered (jump feel vs perf, library choice, fallbacks), and what it
  deliberately left out.
- **Reason about the *feel*.** The jump must feel alive — reason about easing, anticipation, squash &
  stretch, landing weight, timing against scroll. Tune, don't guess.
- **Self-review before requesting review.** Confirm: contract untouched, no engine↔render coupling,
  `npm run build` + `npm run lint` pass, reduced-motion/no-WebGL paths handled, 60fps held.
- **Surface uncertainty.** If a contract change is genuinely needed, open a `contract: …` PR and say
  why — don't work around the seam.

(Claude holds the same bar on the engine side and reviews every Codex PR adversarially with
`/code-review`.)

## 11. Attribution — credit where it's due

Both agents are credited in the git history as real contributors:

- **Authorship:** each agent authors its own commits/PRs; PR authorship shows who built it.
- **Co-author trailers** on every commit (this is how GitHub attributes contributors):
  - Codex's commits: `Co-Authored-By: Codex <codex@openai.com>`
  - Claude's commits: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  - When one agent integrates the other's work, **credit both**.
- **Reviews** name the reviewer in the PR thread, so the review work is visible too.

The result: the repo history honestly reflects that the rich rendering/FX layer is **Codex's senior
front-end work**, and the engine/integration is Claude's — both on the record.

## 12. The stack is expert-grade on purpose

PixiJS (WebGL pixel rendering + filters), GSAP with MotionPath/CustomEase/Physics2D, optional Matter.js
physics, Lenis, Tailwind — this is the toolkit a **senior interactive front-end engineer** reaches for.
It is *not* over-engineering: "a visually rich pixel monkey jumping section-to-section at 60fps with a
banana cursor and a 1010 dissolve" genuinely requires this caliber of library. Use the full stack with
intent; justify each heavy dependency by the result it buys.

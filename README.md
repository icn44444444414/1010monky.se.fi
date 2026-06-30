# 1010monky.se.fi — Binary Monkey Pixel Mascot Prototype

Interactive mascot prototype for the **1010monky.se** site: a **pixel-art monkey** (the `1010` = binary, so the
mascot is *made of bits*) that replaces the static moon logo and **jumps between page panels as you
scroll**, launching from the moon and **dissolving into a stream of 1s and 0s** as it leaps off-screen
at the footer. The cursor becomes a **pixel banana** trailing **yellow dust and falling binary digits**.

This repo is the **base/wireframe** — a senior-architected foundation we keep building on. The polished
hero pixel sprite is an authored sprite sheet that drops into a clean renderer interface.

## Status
Base prototype — engine-first. See [`CODEX-BRIEF.md`](./CODEX-BRIEF.md) for the full build spec.

## Tech stack
- **Vite** + **JavaScript** (ES modules; JSDoc-typed contracts) — plain JS + CSS, no TypeScript
- **GSAP** (+ ScrollTrigger, MotionPath, CustomEase/Physics2D) — scroll-driven jump choreography
- **PixiJS v8** (WebGL 2D) — pixel sprite rendering + retro filters (nearest-neighbor, crisp pixels)
- **Tailwind CSS** (optional) — utility layout for page/stage chrome
- Custom Pixi particle emitter — yellow dust + falling `0/1` binary glyphs

Library weight is open — heavy JS/CSS libraries are welcome wherever they make the ape's jump look
better; engineer's discretion to pick the best tools (kept performant via lazy-load + quality tiers).

## Collaboration model (Claude + Codex)
The typed interfaces in the brief (`ApeRenderer`, `ApeFrame`, `WaypointController`) are the
**integration seams** that let two agents work in parallel.

| Lane | Owner | Modules |
|---|---|---|
| Scaffold + engine + integration + review | **Claude** | `WaypointController`, `ScrollChoreographer`, `ApeStateMachine`, a11y/perf, builds, deploy |
| Rich rendering layer | **Codex** | `PixiApeRenderer`, `BananaCursor`, `BinaryDustField`, sprite wiring |

### Branch flow
- `main` — stable
- `prototype/main` — integration branch
- `feat/*` — per-module feature branches; PRs into `prototype/main`; `npm run build` must pass to merge
- The brief's interfaces are **frozen v1**; changing a seam needs a PR both sides acknowledge.

## Run (once scaffolded)
```bash
npm install
npm run dev      # local dev server
npm run build    # static dist/ for nginx
```

## Deploy
Builds to a static `dist/` — served by nginx like any static site (rendering runs client-side; Node
only at build time). See the deploy section in `CODEX-BRIEF.md`.

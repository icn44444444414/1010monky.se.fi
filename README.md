# BLOON — Jumping Ape Mascot Prototype

Interactive mascot prototype for the BLOON agency site: a friendly cartoon ape that replaces the
static moon logo and **jumps between page panels as you scroll**, launching from the blue moon and
leaping off-screen at the footer. The cursor becomes a **banana** trailing **yellow dust**.

This repo is the **base/wireframe** — a senior-architected foundation we keep building on. The
"visually rich" hero ape is a commissioned asset that drops into a clean renderer interface.

## Status
Base prototype — engine-first. See [`CODEX-BRIEF.md`](./CODEX-BRIEF.md) for the full build spec.

## Tech stack
- **Vite** + **TypeScript** (ES modules)
- **GSAP** (ScrollTrigger + MotionPathPlugin) — scroll-driven jump choreography
- **Three.js** (GLTFLoader + DRACOLoader) — the 3D ape (real angles, lighting)
- Custom canvas particle system — banana cursor + yellow dust

## Collaboration model (Claude + Codex)
The typed interfaces in the brief (`ApeRenderer`, `ApeFrame`, `WaypointController`) are the
**integration seams** that let two agents work in parallel.

| Lane | Owner | Modules |
|---|---|---|
| Scaffold + engine + integration + review | **Claude** | `WaypointController`, `ScrollChoreographer`, `ApeStateMachine`, a11y/perf, builds, deploy |
| Rich rendering layer | **Codex** | `ThreeApeRenderer`, `BananaCursor`, `DustField`, model wiring |

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
Builds to a static `dist/` — served by nginx like any static site (3D runs client-side; Node only at
build time). See the deploy section in `CODEX-BRIEF.md`.

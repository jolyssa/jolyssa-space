# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project snapshot
- Repository currently contains README.md only; typical Astro project files (package.json, astro.config.*, src/, public/) are not present. If uninitialized, initialize before running dev/build commands.

Initialization (if needed)
- Create an Astro minimal project: bun create astro@latest -- --template minimal

Common commands (Bun + Astro)
- Install deps: bun install
- Dev server: bun dev  (serves at http://localhost:4321 by default)
- Build: bun build  (outputs to ./dist)
- Preview build: bun preview
- Astro CLI: bun astro ...  (e.g., bun astro add, bun astro check)
- Help: bun astro -- --help

Linting and tests
- No lint or test tooling detected. Single-test and lint commands are not configured.

High-level architecture (Astro minimal)
- File-based routing under src/pages: .astro or .md files map to routes by file name.
- UI components live under src/components (Astro/React/Vue/Svelte/Preact supported as added).
- Static assets are served from public/.
- Production build emits a static site to dist/ by default.

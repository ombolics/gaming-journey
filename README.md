# Gaming Journey

A visual chronicle of one group of friends' shared gaming history since 2014,
rendered as a git-branch-style timeline. Static single-page site, deployed to
GitHub Pages.

Hungarian UI; English code and documentation.

## Status

Concept phase complete, no application code yet. The design decisions are recorded:

- [CONTEXT.md](./CONTEXT.md) — domain vocabulary
- [docs/SCOPE.md](./docs/SCOPE.md) — what we build and what we deliberately don't
- [docs/adr/](./docs/adr/) — the architectural decisions and their reasoning
- [AGENTS.md](./AGENTS.md) — orientation for coding agents

`prototypes/` holds two frozen concept prototypes. Their data is largely invented and
their models were superseded — reference only.

## Next steps

1. Scaffold Vite + React + TypeScript.
2. Define the data model in `src/data/types.ts` (Run, Member, Game, Era, Moment).
3. Build the lane canvas geometry as pure functions in `src/timeline/`.
4. Collect and enter the real data — the critical path of this project.

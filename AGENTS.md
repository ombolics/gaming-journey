# Gaming Journey

A single-page visual chronicle of one group of friends' shared gaming history since
2014, rendered as a git-branch-style timeline. Static site, deployed to GitHub Pages.

Stack: React + Vite + TypeScript. No backend, no CMS, no router.

## Start here

- [CONTEXT.md](./CONTEXT.md) — the domain vocabulary. **Read it before naming
  anything.** Run, Moment, Era, Member, Game, Precision, Ending and Activity all mean
  something specific here.
- [docs/SCOPE.md](./docs/SCOPE.md) — what we build and, more usefully, what we
  deliberately don't.
- [docs/adr/](./docs/adr/) — the five decisions that shape everything else, each with
  its reasoning.

## Language

English for code, identifiers, comments, docs and ADRs. Hungarian only for UI copy
and for the data content itself (game descriptions, Moments). `CONTEXT.md` lists the
Hungarian UI label for each domain term.

## Things that look like bugs but aren't

These are deliberate and documented. Please don't "clean them up" without reading the
linked ADR first.

- A Run's ending is three states (`running` / `closed` / `faded`), not a nullable end
  date. `faded` is a real state, not missing data — never fill it with a guessed date.
  ([ADR-0002](./docs/adr/0002-three-ending-states-instead-of-a-nullable-date.md))
- The Regular / Guest flag is stated data, not computed from a Run count.
  ([ADR-0003](./docs/adr/0003-explicit-membership-derived-activity.md))
- Evergreen Runs render completely differently from ordinary Runs despite being the
  same data structure.
  ([ADR-0005](./docs/adr/0005-runs-are-spines-lanes-never-merge.md))
- Lanes never converge, even though the visual metaphor is git branches. They can't:
  a Member is often inside several Runs at once. (Same ADR.)
- Hover/focus highlighting is load-bearing, not decoration — it's the only thing that
  disambiguates overlapping Runs. (Same ADR.)

## Working notes

- The site must look good with **incomplete data**. Most Runs will have year-level
  precision, no description and no Moments for a long time. A sparse Run should look
  finished, not truncated.
- `prototypes/` is frozen reference material from the concept phase. Its data is
  largely invented and its React animation logic is built on a data model we
  discarded. Read it for ideas; don't extend it and don't copy its data.
- The SVG geometry (lanes, wobble, spines, hooks, stroke-dashoffset) should stay pure
  functions, separate from components — React contributes nothing to that part.
- When a domain decision gets made or sharpened during a session, update
  `CONTEXT.md` or add an ADR then and there rather than at the end.

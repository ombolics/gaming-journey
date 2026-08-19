# React + Vite + TypeScript for a static single-page site

The original reason to move off the single-file HTML prototype was that the project
would be "multi-page and contain media". After the scope decisions **that is no
longer true**: it became one page, with no media in v1 — so plain vanilla HTML was
a genuine alternative again. We still chose React + Vite + TypeScript, for two
specific reasons:

1. **Type safety for the data.** The data *is* the project: it will be hand-written
   over months, ~31 Runs, with `precision` and `ending` enums. In JSON or YAML a typo
   breaks the render silently; in TypeScript it fails at compile time.
2. **The expanding card.** The most delicate piece of frontend in v1 is expanding a
   card without the layout jumping. framer-motion's `layout` animation solves exactly
   that, and the React prototype already uses it.

## Consequences

- The build step and the dependency surface are an accepted cost. Deploy to GitHub
  Pages via a GitHub Action.
- **React does not help with the hard part.** The SVG geometry (lanes, wobble, merge
  bands, stroke-dashoffset) stays a pure function; React only renders the finished
  `d` attribute. Anyone expecting the framework to solve the drawing will be
  disappointed.
- The React prototype's animation logic is **largely not reusable**, because it was
  built on the event model we discarded ([ADR-0001](./0001-run-as-the-atomic-unit.md)).

# Scope and product decisions

This document records the **what we build / what we don't** decisions. Vocabulary
lives in [CONTEXT.md](../CONTEXT.md); hard-to-reverse architectural decisions live
in [docs/adr/](./adr/).

## Audience

**An internal memorial.** The primary — effectively the only — audience is the group
itself. The measure of success: someone drops the link in Discord and you scroll
through it together.

Consequences:
- Hungarian UI copy. No English version, no SEO, no share-optimisation.
- **Desktop-first.** Mobile must work, but the project is not won or lost there.
- Inside jokes can stay unexplained.

## v1 content scope

**Text only, with a data model prepared for media.**

A Run in v1 carries: game, participants, time span, one to three sentences of
description, a few Moments. The data model has the empty media list from day one,
but v1 does not fill it, and there is no lightbox, no detail page, no asset pipeline.

**Why:** the project's biggest risk is not the code, it is that the data collection
never finishes. 31 Runs times "let's go find the screenshots" equals a half-finished
repo six months from now. If the text version is live and watchable, media becomes
gradual, voluntary, enjoyable work rather than a barrier to entry.

**Known asymmetry:** everything from the Discord era (2019 onwards) still exists;
from the Skype and TS3 eras (2014-2018) essentially nothing does. The most nostalgic
years have the least evidence — another reason the design must not lean on media.

## Data situation (critical)

The React prototype's data is only partly real:

| Layer | State |
|---|---|
| Member names | roughly correct |
| Game list | roughly correct |
| Dates / timeline | **invented** |
| Descriptions, Moments | **invented** |

So the *what* and the *with whom* exist; the *when* and the *what happened* do not.
**The critical path of this project is data collection, not code.**

This vindicates the Precision and Ending fields
([ADR-0002](./adr/0002-three-ending-states-instead-of-a-nullable-date.md)): a large
part of the timeline will be `year` or `season` precision, and many Runs will stay
`faded`. That is not a shortcoming, it is the truth.

Note: the seasonality pattern in the React prototype (Minecraft every summer, Metin2
every winter) was **invented by the prototype**, not a real pattern in the group.

## Sequencing: concept first, then data

The concept and the interface get built first; **then** data research and entry begins.

**Design consequence:** the site **must look good with incomplete data**, because
data will arrive gradually over weeks and months. Concretely:
- A Run with `year` precision, no description and no Moments must still look
  presentable, not like a truncated card.
- 5 filled-in Runs alongside 26 sketchy ones must not look like a broken page.
- The data format must be pleasant to write by hand — this is not a side concern,
  it is the critical path.

Discord has been searchable since 2019, so the second half's dates can be recovered
from evidence; 2014-2018 stays collective memory.

## Information architecture

**A single canvas, not multiple pages.** One scrollable page: hero, then timeline.
No router, no per-Member or per-Game sub-pages.

The "per-Member view" is not a page but **highlighting in place**: clicking a Member
lights up their lane, dims the others and recedes the unrelated Runs. Same for a Game.

**Why:** the one memorable thing about this site is the git-branch timeline — every
navigation that leads away from it weakens it, while filtering strengthens it by
giving another reading of the same canvas. Highlighting in place is also better
content: it shows a Member's thread in its own context (who they went quiet next to,
when they came back), which a separate page would throw away. Incidentally it avoids
39 sub-pages padded with three sentences each.

**Capability given up:** there is no linkable "Szilard's page". If that is ever
needed, a URL fragment (`#member=szilard`) brings it back cheaply.

**Later, if justified:** exactly one kind of real sub-page, the Run detail — but only
once a Run (because of media) no longer fits on a card.

## Views

**v1: the branch timeline only.** The Gantt view (the React prototype's "geological
bands") is out.

The Gantt would give the game-centric reading (the branch view is member-centric),
which is a real difference, but it waits for two reasons: (1) the data is shared but
**the code is not** — separate layout, separate animation, separate responsive
behaviour, realistically 30-40% more frontend work; (2) its main justification
collapsed: the seasonality it would reveal was a prototype invention, not a real
pattern. The data model stays compatible, so v1.1 can add it without a rewrite.

## Layout and lanes

### Lanes

**Regulars get a fixed lane; Guests share a reusable guest zone** at the edge.

We deliberately do not use dynamic, git-style lane reallocation even though it would
be more "authentic": nobody reads a git graph across eleven continuous years, whereas
here **positional constancy is a memory aid** — the reader learns that the third line
is Szabi and from then on reads the canvas without labels. Guests have nothing to
memorise, so their slot can be recycled freely.

### Column structure (desktop)

```
| Year |  cards left  |  LANE CANVAS  |  cards right  |
   -- the Era is a full-width background band, label pinned left --
```

The lane canvas sits **in the middle**, with cards on both sides.

### Cards: collapsed by default, expand on scroll focus

- Default state: a **strip** — game, who, year range.
- Auto-packed: each card goes to whichever column is currently less full, with
  the side its spine sits on used only to break ties. **Not** strict left-right
  alternation, and deliberately not "follow the spine" either: most Runs involve
  the people in the leftmost lanes, so following the spine put almost every card
  on the left and left the right column empty.
- The Run in scroll focus **expands** into a full card (description, Moments), into
  space reserved in advance so nothing jumps.

**Why not a single sticky panel:** it would show one Run at a time, when the whole
story here is that several things ran in parallel.

**Why this solves collisions:** Runs overlap (three or four active in a given year),
but the collapsed strip is small enough that they fit — so collisions never arise
rather than needing to be resolved.

**Side benefit for sparse data:** a Run with no description and `year` precision looks
**complete** as a strip, not truncated. This satisfies the incremental-data
requirement above.

**Known cost:** expansion plus reserved space plus scroll focus is the most delicate
part of the v1 frontend, and needs distinct behaviour under `prefers-reduced-motion`.

### A third layout, found during implementation

The two planned layouts left a gap. `split` (canvas centred, cards both sides)
needs room for two readable strips, and below roughly 980px of content width
they degrade into slivers — but that is far too wide to justify dropping to the
phone rail. So there is a middle **stacked** layout: canvas on the left at its
natural width, one column of full-width cards beside it. The phone rail is the
same stacked layout with the canvas squeezed down to a texture, which means
there are two layouts in the code rather than three.

### Mobile

**The canvas shrinks to a narrow left rail** (~110px, thin strokes, no labels), with
full-width cards beside it. The branch graphic stays recognisable as texture and
identity; the detail (who played) moves into the card's participant chips, where it
reads better anyway.

**Why not drop the canvas on mobile:** a mobile visitor would then never see the one
thing that makes this site itself. And a separate mobile concept would be a second
product to maintain.

**Concrete consequence:** at 110px, seven lanes means ~16px spacing, so the HTML
prototype's wobble must be turned down there — the 10-24px amplitude would cause
crossings at that density. On mobile the lines are near-straight.

### Showing "we played this together"

This is the point of the canvas, so the Run gets a visual body of its own rather
than relying on lane geometry: a **spine** in the gutter, **hooks** to each
participant's lane, brightened lane segments and a slight magnetic bend toward the
spine. Evergreens get a quiet background wash instead, with no spine.

Lanes never physically converge, git-style — see
[ADR-0005](./adr/0005-runs-are-spines-lanes-never-merge.md) for why that is
impossible here and what it costs.

## Page frame

**Hero.** Title, one line, and a **stat line computed from the data**
("11 years, 14 people, 25 games, 31 shared runs"). It costs nothing and it **grows
as data lands** — so incomplete data reads as work in progress rather than emptiness.

**Sticky header.** Only the Members **active at the current scroll position** appear,
animating in and out. This is the best idea in the React prototype and worth keeping:
it also solves the clutter of fourteen names at once. Clicking a name triggers the
highlight.

**Ending.** After the last Run the lanes **run on into empty space**, followed by a
quiet closing line. Emotionally this is the page's last beat, and it is nearly free.

## Colour

The design system has a seven-colour branch palette and there are exactly seven
Regulars — one each. **Guests do not get palette colours**; they share one muted,
neutral treatment. This falls out of the Regular / Guest distinction
([ADR-0003](./adr/0003-explicit-membership-derived-activity.md)) and keeps a Guest's
single appearance from competing with a Regular's eleven-year thread.

## Conventions

- Code, identifiers, documentation and ADRs: **English**.
- UI copy and data content: **Hungarian**.

## Open questions

- Is there any visual material at all from the Skype era (2014-2016), or will those
  years exist only from memory?
- The exact Era boundaries (Skype -> TeamSpeak 3 -> Discord) are unknown; they are a
  data-collection item like everything else.
- Carried over from the HTML prototype without re-examination: the scroll-driven
  stroke-dashoffset draw-in of the lanes, the era gutter, and the wobble of the lanes.
  These are assumed, not decided.

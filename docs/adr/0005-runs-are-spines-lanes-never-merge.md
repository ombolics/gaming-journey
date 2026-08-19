# Runs are drawn as spines; lanes never actually merge

The original concept borrowed the git-branch metaphor, where branches physically
converge at a merge point. That turns out to be impossible here: because Runs overlap,
a Member's lane is frequently inside two or three Runs at once, and a single line
cannot converge on several points at the same time. This is not an edge case — it is
confirmed to have happened in the group's real history.

So lanes keep their fixed x position for their whole life, and a Run is given a body
of its own instead:

- a **spine** — a vertical accent line in the gutter between lanes, lasting exactly
  the Run's duration;
- **hooks** — short connectors from the spine to each participant's lane, so the
  grouping is literally visible;
- participant lane segments **brighten** for the Run's duration and **bend slightly**
  toward the spine. Bends from concurrent Runs sum, producing a gentle waver rather
  than a break.

Several concurrent Runs mean several spines at different x positions.

**Evergreens are the exception:** an Evergreen gets no spine and no hooks, only a
quiet background wash. This looks inconsistent — an Evergreen is the same data
structure as any other Run ([ADR-0001](./0001-run-as-the-atomic-unit.md)) — but it is
deliberate. With League of Legends running since 2014 with everyone, every Member
would otherwise be inside a Run at literally every moment, and the canvas would be
solid gold. The React prototype's separate `ambient` field was a bad answer to this
real problem.

## Consequences

- Static rendering alone cannot guarantee which spine binds whom when several
  overlap. Focus is the safety net: hovering or focusing a Run lights up only its
  participants and dims everything else. **The interaction is therefore not a nicety
  but load-bearing** — the static picture gives the gestalt, focus gives certainty.
- The gutter between lanes must be wide enough to hold several concurrent spines,
  which costs horizontal space that would otherwise go to cards.
- If concurrent bending ever looks unstable in practice, the fallback is to drop the
  bend and keep spines plus hooks. That still works; it is just flatter.

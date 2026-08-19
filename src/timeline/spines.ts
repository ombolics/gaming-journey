/**
 * Placing the Runs on the canvas.
 *
 * A Run's body is a vertical spine in the gutter with hooks out to each
 * participant's lane — lanes never converge, because a Member is routinely
 * inside several Runs at once (ADR-0005).
 *
 * A spine wants to sit among its own people, so its preferred x is the mean of
 * its participants' lanes. Concurrent spines must not collide, so placement is
 * greedy: take the preferred x if it is clear, otherwise step outwards until
 * something is.
 */

import { overlaps, type Interval } from './layout'

export type SpineInput = {
  id: string
  span: Interval
  /** x of each participant's lane. */
  memberX: number[]
}

export type Spine = {
  id: string
  x: number
  span: Interval
  memberX: number[]
}

/** Minimum horizontal gap between two spines that overlap in time, in px. */
const MIN_GAP = 26

/** How far the search steps each time the preferred position is taken. */
const STEP = MIN_GAP / 2

/** Give up after this many steps and accept a collision rather than fly off. */
const MAX_STEPS = 40

export function placeSpines(runs: SpineInput[], width: number): Spine[] {
  // Earliest first, so the long-running Runs claim their natural x before the
  // short ones have to negotiate around them.
  const ordered = [...runs].sort((a, b) => a.span.from - b.span.from)
  const placed: Spine[] = []

  for (const run of ordered) {
    const preferred = mean(run.memberX)
    const conflicts = placed.filter((p) => overlaps(p.span, run.span))
    placed.push({
      id: run.id,
      x: findFreeX(preferred, conflicts, width),
      span: run.span,
      memberX: run.memberX,
    })
  }

  return placed
}

function findFreeX(preferred: number, conflicts: Spine[], width: number): number {
  if (isClear(preferred, conflicts)) return preferred

  // Alternate outwards from the preferred position so the spine stays as close
  // to its own people as the crowding allows.
  for (let step = 1; step <= MAX_STEPS; step++) {
    for (const candidate of [
      preferred + step * STEP,
      preferred - step * STEP,
    ]) {
      if (candidate < 0 || candidate > width) continue
      if (isClear(candidate, conflicts)) return candidate
    }
  }

  return preferred
}

function isClear(x: number, conflicts: Spine[]): boolean {
  return conflicts.every((c) => Math.abs(c.x - x) >= MIN_GAP)
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

// ---------------------------------------------------------------------------
// Ties
// ---------------------------------------------------------------------------

/**
 * The tie announces the grouping at the moment the Run starts: one bar reaching
 * across the participants, with a node sitting on each of their lanes.
 *
 * It replaced an earlier design that drew a separate curve from every lane to
 * the spine. That produced N long horizontal curves per Run, crossing the lanes
 * of people who were not in it, and with several Runs at the same height they
 * merged into one meaningless squiggle. A bar plus nodes says the same thing
 * with a single stroke, and the nodes are what carry the meaning: only
 * participants get one.
 */
export type Tie = {
  fromX: number
  toX: number
  nodes: number[]
}

export function tieFor(spine: Spine): Tie {
  return {
    fromX: Math.min(...spine.memberX, spine.x),
    toX: Math.max(...spine.memberX, spine.x),
    nodes: spine.memberX,
  }
}

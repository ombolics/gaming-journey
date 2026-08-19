/**
 * Assembling the data into geometry. This is the seam between the domain and
 * the rendering: everything below it is numbers, everything above it is React.
 */

import { ERAS } from '../data/eras'
import { GUESTS, MEMBERS, REGULARS } from '../data/members'
import { RUNS } from '../data/runs'
import type { Member, MemberId, Run } from '../data/types'
import { allocateGuestSlots, laneGeometry, type Interval } from './layout'
import { buildLane, type LanePath } from './lanes'
import { placeSpines, tieFor, type Spine, type Tie } from './spines'
import { nowAsYear, runSpan, toSpan, toYear, uncertainty } from './time'
import { BRANCH_PALETTE, GUEST_COLOR } from '../styles/theme'

export type PlacedMember = {
  member: Member
  laneX: number
  color: string
  span: Interval
  lane: LanePath
}

export type PlacedRun = {
  run: Run
  spine?: Spine
  tie?: Tie
  /** Evergreens get one of these instead of a spine — see ADR-0005. */
  wash?: { fromX: number; toX: number }
  span: Interval
}

export type TimelineModel = {
  width: number
  now: number
  members: PlacedMember[]
  runs: PlacedRun[]
  eras: { id: string; label: string; from: number; to: number }[]
  lastYear: number
}

export type BuildOptions = {
  width: number
  wobbleScale?: number
  now?: number
}

export function buildTimeline({
  width,
  wobbleScale = 1,
  now = nowAsYear(),
}: BuildOptions): TimelineModel {
  const anchors = spreadAnchors()
  const runSpans = new Map<string, Interval>(
    RUNS.map((run) => {
      const span = runSpan(run.from, run.ending, now)
      const from = anchors.get(run.id) ?? span.from
      return [run.id, { from, to: Math.max(span.to, from + 0.2) }]
    }),
  )

  // A Guest's lane exists only around their Runs; a Regular's runs from the day
  // they joined until they leave, whether or not they were playing (ADR-0003).
  const guestSpans = GUESTS.map((g) => ({
    id: g.id,
    span: memberSpanFromRuns(g.id, runSpans) ?? {
      from: toYear(g.joined),
      to: toYear(g.joined) + 0.5,
    },
  }))
  const { slots, slotCount } = allocateGuestSlots(guestSpans)

  const geometry = laneGeometry(width, REGULARS.length, slotCount)

  const laneXOf = (id: MemberId): number => {
    const regularIndex = REGULARS.findIndex((m) => m.id === id)
    if (regularIndex !== -1) return geometry.regularX[regularIndex]
    return geometry.guestX[slots.get(id) ?? 0]
  }

  // Evergreens get no spine: with League of Legends running since 2014 with
  // everyone, every lane would otherwise be inside a Run at all times and the
  // canvas would be solid gold (ADR-0005).
  const spines = placeSpines(
    RUNS.filter((r) => !r.evergreen).map((r) => ({
      id: r.id,
      span: runSpans.get(r.id)!,
      memberX: r.members.map(laneXOf),
    })),
    width,
  )
  const spineById = new Map(spines.map((s) => [s.id, s]))

  const members: PlacedMember[] = MEMBERS.map((member) => {
    const span =
      member.kind === 'guest'
        ? guestSpans.find((g) => g.id === member.id)!.span
        : {
            from: toSpan(member.joined).from,
            to: member.left ? toYear(member.left) : now,
          }

    const laneX = laneXOf(member.id)
    // Evergreens are left out of Activity on purpose. League of Legends has
    // run since 2014 with everyone, so counting it would add the same constant
    // to every lane at every height: no information, and it would flatten the
    // contrast that makes real activity visible.
    const mine = RUNS.filter(
      (r) => !r.evergreen && r.members.includes(member.id),
    )
      .map((r) => spineById.get(r.id))
      .filter((s): s is Spine => s !== undefined)

    return {
      member,
      laneX,
      color: colorOf(member),
      span,
      lane: buildLane({
        laneX,
        from: span.from,
        to: span.to,
        spines: mine,
        seed: seedOf(member.id),
        wobbleScale,
      }),
    }
  })

  const runs: PlacedRun[] = RUNS.map((run) => {
    const spine = spineById.get(run.id)
    const memberX = run.members.map(laneXOf)
    return {
      run,
      spine,
      tie: spine ? tieFor(spine) : undefined,
      wash: run.evergreen
        ? { fromX: Math.min(...memberX), toX: Math.max(...memberX) }
        : undefined,
      span: runSpans.get(run.id)!,
    }
  })

  const lastYear = Math.ceil(now)

  return {
    width,
    now,
    members,
    runs,
    lastYear,
    eras: ERAS.map((era) => ({
      id: era.id,
      label: era.label,
      from: toYear(era.from),
      to: era.until ? toYear(era.until) : now,
    })),
  }
}

/**
 * Spreading Runs that share a start out across the year they are known to.
 *
 * Most dates are only known to the year, so `toYear` puts every Run of 2015 at
 * exactly the same height — four Runs stacked on one line, their ties merging
 * into a single meaningless horizontal squiggle. Spreading them across the
 * uncertainty band fixes that, and it is honest rather than cosmetic: the true
 * date really is somewhere inside that band, and we really do not know where.
 *
 * As dates get verified and Precision sharpens, the band narrows and the
 * spreading shrinks with it, until a month-precise Run barely moves at all.
 */
function spreadAnchors(): Map<string, number> {
  const groups = new Map<number, Run[]>()
  for (const run of RUNS) {
    const key = toSpan(run.from).from
    const group = groups.get(key)
    if (group) group.push(run)
    else groups.set(key, [run])
  }

  const anchors = new Map<string, number>()
  for (const [start, group] of groups) {
    const band = uncertainty(group[0].from)
    // Stable order, so the layout does not shuffle between renders.
    const ordered = [...group].sort((a, b) => a.id.localeCompare(b.id))
    ordered.forEach((run, index) => {
      // Inset from both edges, so nothing lands exactly on a year rule.
      anchors.set(run.id, start + band * ((index + 1) / (ordered.length + 1)))
    })
  }

  return anchors
}

function memberSpanFromRuns(
  id: MemberId,
  spans: Map<string, Interval>,
): Interval | undefined {
  const mine = RUNS.filter((r) => r.members.includes(id)).map(
    (r) => spans.get(r.id)!,
  )
  if (mine.length === 0) return undefined
  return {
    from: Math.min(...mine.map((s) => s.from)),
    to: Math.max(...mine.map((s) => s.to)),
  }
}

function colorOf(member: Member): string {
  const index = REGULARS.findIndex((m) => m.id === member.id)
  return index === -1
    ? GUEST_COLOR
    : BRANCH_PALETTE[index % BRANCH_PALETTE.length]
}

/** Stable per-Member number, so a lane wobbles the same way on every render. */
function seedOf(id: MemberId): number {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash)
}

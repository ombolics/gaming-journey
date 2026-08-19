/**
 * Drawing a Member's lane down the canvas.
 *
 * Nothing along a lane is allowed to change abruptly. Three things vary as it
 * descends, and each is a continuous function of height rather than a switch
 * that flips at a Run boundary:
 *
 *   wobble    a slow sine, unique per Member, so the canvas reads as drawn
 *             rather than plotted;
 *   bend      a pull toward the spines of the Runs the Member is in. The pull
 *             ramps in and out with a smoothstep, so joining a Run eases the
 *             lane across instead of kinking it. Concurrent pulls average,
 *             which is why this reads as a waver, not a break (ADR-0005);
 *   activity  how many Runs they are in at that height. Derived (ADR-0003) and
 *             kept fractional, so weight and opacity can vary continuously.
 *
 * The lane is emitted as one filled ribbon rather than a stroked path. A stroke
 * has a single width, so encoding activity in stroke-width would mean cutting
 * the lane into segments, and every segment boundary is a visible step.
 * A ribbon can taper.
 */

import { yearToPx } from './layout'
import type { Spine } from './spines'

/** Vertical sampling step, in px. Small enough to curve, large enough to be cheap. */
const SAMPLE_STEP = 12

/**
 * How far toward a spine a lane leans, as a fraction of the gap.
 *
 * Deliberately small. A stronger pull made lanes wander far enough that the
 * movement stopped reading as a response to anything and just looked unstable —
 * the grouping is carried by the tie, not by the lean. The lean only has to
 * hint.
 */
const BEND_FRACTION = 0.16

/** ...and never further than this, in px, however far the spine is. */
const BEND_CAP = 26

/** Years over which a Run's pull fades in at its start and out at its end. */
const PULL_RAMP = 0.22

/** Radius, in samples, of the smoothing pass that removes residual corners. */
const SMOOTHING_RADIUS = 3

/** Half-width of the ribbon at zero activity, and at full activity. */
const HALF_WIDTH_QUIET = 0.7
const HALF_WIDTH_ACTIVE = 2.4

/** Opacity of the ribbon at zero activity, and at full activity. */
const OPACITY_QUIET = 0.26
const OPACITY_ACTIVE = 1

/** Activity beyond this is treated the same. Past three, more is just noise. */
const MAX_ACTIVITY = 3

/** One opacity stop per this many samples. Enough to read as a gradient. */
const STOP_EVERY = 8

export type LaneSample = { x: number; y: number; activity: number }

export type OpacityStop = { offset: number; opacity: number }

export type LanePath = {
  /** A closed, filled ribbon. Varies in width; never in segments. */
  d: string
  /** Gradient stops down the lane, so opacity varies as continuously as width. */
  stops: OpacityStop[]
  top: number
  bottom: number
  start: { x: number; y: number }
  end: { x: number; y: number }
}

export type LaneInput = {
  laneX: number
  /** The Member's life on the canvas, in decimal years. */
  from: number
  to: number
  /** Spines of the Runs this Member takes part in. */
  spines: Spine[]
  /** Stable per-Member number, so each lane wobbles differently. */
  seed: number
  /** Scales the wobble down where lanes are crowded. Zero on narrow screens. */
  wobbleScale?: number
}

export function buildLane(input: LaneInput): LanePath {
  const samples = smooth(sampleLane(input))
  const first = samples[0]
  const last = samples[samples.length - 1]

  return {
    d: toRibbon(samples),
    stops: toStops(samples),
    top: first.y,
    bottom: last.y,
    start: { x: first.x, y: first.y },
    end: { x: last.x, y: last.y },
  }
}

export function halfWidthFor(activity: number): number {
  return lerp(HALF_WIDTH_QUIET, HALF_WIDTH_ACTIVE, activity / MAX_ACTIVITY)
}

export function opacityFor(activity: number): number {
  return lerp(OPACITY_QUIET, OPACITY_ACTIVE, activity / MAX_ACTIVITY)
}

// ---------------------------------------------------------------------------

function sampleLane(input: LaneInput): LaneSample[] {
  const { laneX, from, to, spines, seed, wobbleScale = 1 } = input

  const yStart = yearToPx(from)
  const yEnd = Math.max(yearToPx(to), yStart + SAMPLE_STEP)
  const amplitude = (7 + (seed % 8)) * wobbleScale
  const wavelength = 320 + (seed % 5) * 60
  const phase = ((seed % 17) / 17) * Math.PI * 2

  const samples: LaneSample[] = []
  for (let y = yStart; y <= yEnd; y += SAMPLE_STEP) {
    const progress = (y - yStart) / (yEnd - yStart)
    const year = from + progress * (to - from)

    let totalWeight = 0
    let weightedX = 0
    for (const spine of spines) {
      const weight = pullWeight(year, spine)
      if (weight <= 0) continue
      totalWeight += weight
      weightedX += weight * spine.x
    }

    const bend =
      totalWeight > 0
        ? clamp(
            (weightedX / totalWeight - laneX) *
              BEND_FRACTION *
              Math.min(totalWeight, 1),
            -BEND_CAP,
            BEND_CAP,
          )
        : 0

    samples.push({
      x: laneX + Math.sin(y / wavelength + phase) * amplitude + bend,
      y,
      activity: Math.min(totalWeight, MAX_ACTIVITY),
    })
  }

  // Finish exactly on the end, however the step happened to divide.
  const last = samples[samples.length - 1]
  if (last.y < yEnd) {
    samples.push({ x: last.x, y: yEnd, activity: last.activity })
  }

  return samples
}

/**
 * How strongly one Run pulls at a given moment: zero outside it, one in the
 * middle, and a smoothstep in between, so the lane eases across rather than
 * stepping across.
 */
function pullWeight(year: number, spine: Spine): number {
  if (year < spine.span.from - PULL_RAMP || year > spine.span.to + PULL_RAMP) {
    return 0
  }
  const rising = (year - (spine.span.from - PULL_RAMP)) / PULL_RAMP
  const falling = (spine.span.to + PULL_RAMP - year) / PULL_RAMP
  return smoothstep(clamp(Math.min(rising, falling), 0, 1))
}

/** A moving average over x and activity. Cheap, and it removes any residue. */
function smooth(samples: LaneSample[]): LaneSample[] {
  if (samples.length <= 2) return samples

  return samples.map((sample, index) => {
    let sumX = 0
    let sumActivity = 0
    let count = 0
    for (let k = -SMOOTHING_RADIUS; k <= SMOOTHING_RADIUS; k++) {
      const neighbour = samples[clamp(index + k, 0, samples.length - 1)]
      sumX += neighbour.x
      sumActivity += neighbour.activity
      count++
    }
    return { x: sumX / count, y: sample.y, activity: sumActivity / count }
  })
}

/**
 * The ribbon: down one offset side, back up the other, closed. Offsets follow
 * the local normal, so the width stays true where the lane leans.
 */
function toRibbon(samples: LaneSample[]): string {
  const left: Point[] = []
  const right: Point[] = []

  samples.forEach((sample, index) => {
    const previous = samples[Math.max(index - 1, 0)]
    const next = samples[Math.min(index + 1, samples.length - 1)]
    const dx = next.x - previous.x
    const dy = next.y - previous.y
    const length = Math.hypot(dx, dy) || 1
    const nx = -(dy / length)
    const ny = dx / length
    const half = halfWidthFor(sample.activity)

    left.push({ x: sample.x + nx * half, y: sample.y + ny * half })
    right.push({ x: sample.x - nx * half, y: sample.y - ny * half })
  })

  right.reverse()
  return `${curveThrough(left, false)} ${curveThrough(right, true)} Z`
}

type Point = { x: number; y: number }

/** A smooth path through points, using midpoints as quadratic anchors. */
function curveThrough(points: Point[], continueFromCurrent: boolean): string {
  if (points.length === 0) return ''

  const head = continueFromCurrent ? 'L' : 'M'
  let d = `${head} ${round(points[0].x)} ${round(points[0].y)}`

  for (let i = 0; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2
    const midY = (points[i].y + points[i + 1].y) / 2
    d += ` Q ${round(points[i].x)} ${round(points[i].y)} ${round(midX)} ${round(midY)}`
  }

  const last = points[points.length - 1]
  return `${d} L ${round(last.x)} ${round(last.y)}`
}

function toStops(samples: LaneSample[]): OpacityStop[] {
  const first = samples[0]
  const last = samples[samples.length - 1]
  const span = last.y - first.y || 1
  const stops: OpacityStop[] = []

  for (let i = 0; i < samples.length; i += STOP_EVERY) {
    stops.push({
      offset: (samples[i].y - first.y) / span,
      opacity: opacityFor(samples[i].activity),
    })
  }

  stops.push({ offset: 1, opacity: opacityFor(last.activity) })
  return stops
}

// ---------------------------------------------------------------------------

function smoothstep(x: number): number {
  return x * x * (3 - 2 * x)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}

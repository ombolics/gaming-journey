/**
 * Turning domain time into numbers on the vertical axis.
 *
 * Everything here is a pure function of its arguments — including the clock,
 * which is passed in rather than read. The unit throughout is the "decimal
 * year": 2016.5 is halfway through 2016.
 */

import type { Ending, Season, TimePoint } from '../data/types'

/** The half-open month range [start, end) a Season covers, as month indices. */
const SEASON_MONTHS: Record<Season, { from: number; to: number }> = {
  spring: { from: 2, to: 5 }, // March - May
  summer: { from: 5, to: 8 }, // June - August
  autumn: { from: 8, to: 11 }, // September - November
  winter: { from: 11, to: 14 }, // December - February of the following year
}

/** A stretch of the axis. `from` and `to` are decimal years. */
export type YearSpan = { from: number; to: number }

/**
 * The full range of decimal years a TimePoint could mean. A month-precision
 * point covers one twelfth of a year; a year-precision point covers all of it.
 * This range *is* the uncertainty — the renderer uses its width to decide how
 * softly to draw the edge.
 */
export function toSpan(point: TimePoint): YearSpan {
  switch (point.precision) {
    case 'month':
      return {
        from: point.year + (point.month - 1) / 12,
        to: point.year + point.month / 12,
      }
    case 'season': {
      const { from, to } = SEASON_MONTHS[point.season]
      return { from: point.year + from / 12, to: point.year + to / 12 }
    }
    case 'year':
      return { from: point.year, to: point.year + 1 }
  }
}

/** The single best-guess position for a TimePoint: the middle of its span. */
export function toYear(point: TimePoint): number {
  const { from, to } = toSpan(point)
  return (from + to) / 2
}

/** How wide the uncertainty is, in years. 1/12 for a month, 1 for a year. */
export function uncertainty(point: TimePoint): number {
  const { from, to } = toSpan(point)
  return to - from
}

/** The clock, as a decimal year. The only impure function in this module. */
export function nowAsYear(now: Date = new Date()): number {
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1)
  const startOfNextYear = Date.UTC(now.getUTCFullYear() + 1, 0, 1)
  const progress = (now.getTime() - startOfYear) / (startOfNextYear - startOfYear)
  return now.getUTCFullYear() + progress
}

/**
 * Where a Run stops on the axis, and how that stop should read.
 *
 * The three Endings are genuinely different (ADR-0002), so they resolve to
 * three different shapes rather than to one number:
 *
 * - `running` ends at the present, and keeps going.
 * - `closed`  ends at a known point, with that point's own uncertainty.
 * - `faded`   ends *somewhere after* the last sighting. There is no end, so
 *             `to` is only where the drawing should have finished trailing off.
 */
export type ResolvedEnd =
  | { kind: 'running'; at: number }
  | { kind: 'closed'; at: number; uncertainty: number }
  | { kind: 'faded'; from: number; to: number }

/** How far past the last sighting a faded Run keeps trailing, in years. */
const FADE_LENGTH = 0.75

export function resolveEnding(
  ending: Ending,
  runStart: TimePoint,
  now: number,
): ResolvedEnd {
  switch (ending.kind) {
    case 'running':
      return { kind: 'running', at: now }
    case 'closed':
      return {
        kind: 'closed',
        at: toYear(ending.at),
        uncertainty: uncertainty(ending.at),
      }
    case 'faded': {
      // With no last sighting, the Run starts fading from where it began.
      const lastSeen = ending.lastSeen ?? runStart
      const from = toSpan(lastSeen).to
      return { kind: 'faded', from, to: Math.min(from + FADE_LENGTH, now) }
    }
  }
}

/** The span a Run occupies on the axis, fading included. */
export function runSpan(
  from: TimePoint,
  ending: Ending,
  now: number,
): YearSpan {
  const end = resolveEnding(ending, from, now)
  const to = end.kind === 'faded' ? end.to : end.at
  return { from: toSpan(from).from, to: Math.max(to, toSpan(from).to) }
}

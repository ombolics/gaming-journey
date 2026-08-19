/**
 * Turning domain values into Hungarian UI copy.
 *
 * The wording carries the Precision and the Ending honestly: a year-precision
 * date must not be rendered as though it were known to the month, and a faded
 * Run must not read as though it had ended on a date (ADR-0002).
 */

import type { Ending, Season, TimePoint } from '../data/types'

const MONTHS = [
  'január',
  'február',
  'március',
  'április',
  'május',
  'június',
  'július',
  'augusztus',
  'szeptember',
  'október',
  'november',
  'december',
]

const SEASONS: Record<Season, string> = {
  spring: 'tavasz',
  summer: 'nyár',
  autumn: 'ősz',
  winter: 'tél',
}

export function formatPoint(point: TimePoint): string {
  switch (point.precision) {
    case 'month':
      return `${point.year}. ${MONTHS[point.month - 1]}`
    case 'season':
      return `${point.year} ${SEASONS[point.season]}`
    case 'year':
      return `${point.year}`
  }
}

/** Short form for the strip, where there is no room for a month name. */
export function formatYear(point: TimePoint): string {
  return `${point.year}`
}

export function formatEnding(ending: Ending): string {
  switch (ending.kind) {
    case 'running':
      return 'ma is megy'
    case 'closed':
      return formatPoint(ending.at)
    case 'faded':
      return ending.lastSeen
        ? `${formatPoint(ending.lastSeen)} után elhalt`
        : 'elhalt'
  }
}

/** The range as it appears on a collapsed strip. */
export function formatSpan(from: TimePoint, ending: Ending): string {
  switch (ending.kind) {
    case 'running':
      return `${formatYear(from)} —`
    case 'closed':
      return ending.at.year === from.year
        ? formatYear(from)
        : `${formatYear(from)} — ${formatYear(ending.at)}`
    case 'faded':
      return ending.lastSeen && ending.lastSeen.year !== from.year
        ? `${formatYear(from)} — ${formatYear(ending.lastSeen)}`
        : `${formatYear(from)} —`
  }
}

/** "Andris, Dávid és Szabi" — a list the way it would be said aloud. */
export function formatNames(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} és ${names[names.length - 1]}`
}

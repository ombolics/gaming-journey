/**
 * The people.
 *
 * Names are believed correct. Join dates are at `year` precision because that
 * is genuinely all we know so far — they have not been checked against
 * anything. Sharpen them as the data collection proceeds; do not guess months.
 */

import type { Member } from './types'

const year = (y: number) => ({ precision: 'year', year: y }) as const

export const MEMBERS: Member[] = [
  // --- Regulars, in lane order (left to right) -----------------------------
  { id: 'andris', name: 'Andris', kind: 'regular', joined: year(2014) },
  { id: 'david', name: 'Dávid', kind: 'regular', joined: year(2014) },
  { id: 'szabi', name: 'Szabi', kind: 'regular', joined: year(2014) },
  { id: 'csabi', name: 'Csabi', kind: 'regular', joined: year(2014) },
  { id: 'szilard', name: 'Szilárd', kind: 'regular', joined: year(2014) },
  { id: 'joci', name: 'Joci', kind: 'regular', joined: year(2018) },
  { id: 'akos', name: 'Ákos', kind: 'regular', joined: year(2018) },

  // --- Guests ---------------------------------------------------------------
  { id: 'tamulus', name: 'Tamülus', kind: 'guest', joined: year(2014) },
  { id: 'zadorakk', name: 'Zadorakk', kind: 'guest', joined: year(2014) },
  { id: 'kecske', name: 'Kecske', kind: 'guest', joined: year(2015) },
  { id: 'karlzy', name: 'Karlzy', kind: 'guest', joined: year(2015) },
  { id: 'warloch', name: 'Warloch', kind: 'guest', joined: year(2015) },
  { id: 'bocika', name: 'Bocika', kind: 'guest', joined: year(2020) },
  { id: 'fasko-laci', name: 'Faskó Laci', kind: 'guest', joined: year(2024) },
]

export const MEMBERS_BY_ID = new Map(MEMBERS.map((m) => [m.id, m]))

/** Regulars in lane order. Their index in this list *is* their lane. */
export const REGULARS = MEMBERS.filter((m) => m.kind === 'regular')

export const GUESTS = MEMBERS.filter((m) => m.kind === 'guest')

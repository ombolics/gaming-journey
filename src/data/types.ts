/**
 * Domain types. Vocabulary is defined in CONTEXT.md — the names here are not
 * arbitrary, and neither are the shapes. See docs/adr/ for the reasoning.
 */

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * A point in time known only to a certain Precision. Modelled as a union rather
 * than a `Date` so that unknown precision cannot be faked: there is no way to
 * write a month you do not know.
 */
export type TimePoint =
  | { precision: 'month'; year: number; month: number } // month: 1-12
  | { precision: 'season'; year: number; season: Season }
  | { precision: 'year'; year: number }

/**
 * How a Run finished. Three states, not a nullable date — see ADR-0002.
 * `faded` is a real state: it means the Run petered out with no known end.
 * Never convert a `faded` into a `closed` with a guessed date.
 */
export type Ending =
  | { kind: 'running' }
  | { kind: 'closed'; at: TimePoint }
  | { kind: 'faded'; lastSeen?: TimePoint }

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

/** Regulars, in lane order (left to right). Order is the lane assignment. */
export const REGULAR_IDS = [
  'andris',
  'david',
  'szabi',
  'csabi',
  'szilard',
  'joci',
  'akos',
] as const

export const GUEST_IDS = [
  'tamulus',
  'zadorakk',
  'kecske',
  'karlzy',
  'warloch',
  'bocika',
  'fasko-laci',
] as const

export type RegularId = (typeof REGULAR_IDS)[number]
export type GuestId = (typeof GUEST_IDS)[number]
export type MemberId = RegularId | GuestId

/**
 * A person in the group. `kind` is stated data, never computed from a Run
 * count — see ADR-0003. Colour is not stored: Regulars take their palette
 * colour from their lane index, Guests share one muted treatment.
 */
export type Member = {
  id: MemberId
  /** Hungarian display name. */
  name: string
  kind: 'regular' | 'guest'
  joined: TimePoint
  left?: TimePoint
}

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

export const GAME_IDS = [
  'league-of-legends',
  'minecraft',
  'tanki-online',
  'metin2',
  'dark-orbit',
  'unturned',
  'cube-world',
  'team-fortress-2',
  'terraria',
  'rainbow-six-siege',
  'space-engineers',
  'ring-of-elysium',
  'war-thunder',
  'guild-wars-2',
  'world-of-tanks',
  'cod-warzone',
  'among-us',
  'pubg',
  'phasmophobia',
  'lost-ark',
  'tft',
  'lethal-company',
  'escape-from-tarkov',
] as const

export type GameId = (typeof GAME_IDS)[number]

export type Game = {
  id: GameId
  /** Display title, as the group would say it. */
  title: string
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

/** A memorable point inside a Run. Never stands alone. */
export type Moment = {
  text: string
  /** Only when it is actually known. Usually it is not. */
  at?: TimePoint
}

export type Run = {
  id: string
  game: GameId
  members: MemberId[]
  from: TimePoint
  ending: Ending

  /**
   * A Run that goes on quietly for years underneath the others. Same data
   * shape as any Run, but rendered as a background wash with no spine —
   * see ADR-0005 for why the inconsistency is deliberate.
   */
  evergreen?: boolean

  /**
   * Timing has not been verified against evidence or the group's memory yet.
   * Seeded Runs start `true`; clearing the flag is the data-collection task.
   * The UI marks these, so the timeline doubles as a to-do list.
   */
  unverified?: boolean

  description?: string
  moments?: Moment[]

  /** Reserved for v1.1. Always empty in v1 — see docs/SCOPE.md. */
  media?: never[]
}

// ---------------------------------------------------------------------------
// Eras
// ---------------------------------------------------------------------------

/** The stretch during which the group used one voice platform. */
export type Era = {
  id: string
  label: string
  from: TimePoint
  /** Absent means it runs to the present. */
  until?: TimePoint
}

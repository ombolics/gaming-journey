/**
 * The Runs — who played what, when.
 *
 * SEEDED, NOT VERIFIED. Every entry below carries `unverified: true`, and that
 * is the honest state of things: the *game* and the *participants* came out of
 * the concept prototype and are believed roughly right, but every date is a
 * hypothesis and none of the descriptions survived review (the prototype's
 * prose was invented, so it was not carried over).
 *
 * The data-collection task is, per Run: pin the timing down, choose the right
 * Ending, and write what actually happened. Then drop `unverified`.
 *
 * Two rules while doing that, both load-bearing (ADR-0002):
 *   - Do not invent precision. If only the year is known, leave it at `year`.
 *   - Do not turn a `faded` into a `closed` with a guessed date. Most of these
 *     really did just peter out, and that is worth recording as such.
 */

import type { Run } from './types'

const year = (y: number) => ({ precision: 'year', year: y }) as const
const faded = { kind: 'faded' } as const
const running = { kind: 'running' } as const

export const RUNS: Run[] = [
  {
    id: 'lol-forever',
    game: 'league-of-legends',
    members: ['andris', 'david', 'szabi', 'csabi', 'szilard', 'joci', 'akos'],
    from: year(2014),
    ending: running,
    evergreen: true,
    unverified: true,
  },
  { id: 'minecraft-1', game: 'minecraft', members: ['andris', 'david', 'szabi', 'csabi', 'szilard', 'tamulus'], from: year(2014), ending: faded, unverified: true },
  { id: 'tanki-1', game: 'tanki-online', members: ['david', 'szabi'], from: year(2014), ending: faded, unverified: true },
  { id: 'metin2-1', game: 'metin2', members: ['andris', 'david', 'szabi', 'csabi', 'zadorakk'], from: year(2014), ending: faded, unverified: true },

  { id: 'dark-orbit-1', game: 'dark-orbit', members: ['david', 'csabi'], from: year(2015), ending: faded, unverified: true },
  { id: 'minecraft-2', game: 'minecraft', members: ['andris', 'david', 'szabi', 'csabi', 'kecske', 'karlzy'], from: year(2015), ending: faded, unverified: true },
  { id: 'unturned-1', game: 'unturned', members: ['david', 'szabi', 'csabi', 'warloch'], from: year(2015), ending: faded, unverified: true },
  { id: 'cube-world-1', game: 'cube-world', members: ['andris', 'david', 'szabi'], from: year(2015), ending: faded, unverified: true },

  { id: 'tf2-1', game: 'team-fortress-2', members: ['andris', 'csabi'], from: year(2016), ending: faded, unverified: true },

  { id: 'terraria-1', game: 'terraria', members: ['andris', 'szabi', 'csabi'], from: year(2017), ending: faded, unverified: true },
  { id: 'r6-1', game: 'rainbow-six-siege', members: ['andris', 'david'], from: year(2017), ending: faded, unverified: true },

  { id: 'space-engineers-1', game: 'space-engineers', members: ['david', 'csabi'], from: year(2018), ending: faded, unverified: true },
  { id: 'ring-of-elysium-1', game: 'ring-of-elysium', members: ['andris', 'david'], from: year(2018), ending: faded, unverified: true },

  { id: 'war-thunder-1', game: 'war-thunder', members: ['andris', 'david'], from: year(2019), ending: faded, unverified: true },
  { id: 'gw2-1', game: 'guild-wars-2', members: ['andris', 'david'], from: year(2019), ending: faded, unverified: true },
  { id: 'wot-1', game: 'world-of-tanks', members: ['andris', 'david', 'joci'], from: year(2019), ending: faded, unverified: true },

  { id: 'warzone-1', game: 'cod-warzone', members: ['andris', 'david'], from: year(2020), ending: faded, unverified: true },
  { id: 'among-us-1', game: 'among-us', members: ['andris', 'david', 'szabi', 'csabi', 'szilard', 'bocika'], from: year(2020), ending: faded, unverified: true },
  { id: 'pubg-1', game: 'pubg', members: ['andris', 'david', 'csabi'], from: year(2020), ending: faded, unverified: true },

  { id: 'phasmophobia-1', game: 'phasmophobia', members: ['andris', 'david', 'szabi', 'csabi'], from: year(2021), ending: faded, unverified: true },

  { id: 'lost-ark-group', game: 'lost-ark', members: ['andris', 'david', 'szabi'], from: year(2022), ending: faded, unverified: true },
  { id: 'lost-ark-solo', game: 'lost-ark', members: ['andris'], from: year(2022), ending: faded, unverified: true },
  { id: 'gw2-2', game: 'guild-wars-2', members: ['andris', 'david', 'csabi'], from: year(2022), ending: faded, unverified: true },

  { id: 'war-thunder-2', game: 'war-thunder', members: ['andris', 'david', 'csabi'], from: year(2023), ending: faded, unverified: true },
  { id: 'tft-1', game: 'tft', members: ['andris', 'szabi'], from: year(2023), ending: faded, unverified: true },

  { id: 'lethal-company-1', game: 'lethal-company', members: ['andris', 'david', 'szabi', 'csabi'], from: year(2024), ending: faded, unverified: true },
  { id: 'tanki-2', game: 'tanki-online', members: ['david', 'szabi', 'fasko-laci'], from: year(2024), ending: faded, unverified: true },

  { id: 'tarkov-1', game: 'escape-from-tarkov', members: ['andris', 'david'], from: year(2025), ending: faded, unverified: true },
]


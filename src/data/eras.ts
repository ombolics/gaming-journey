/**
 * Which voice platform the group was on.
 *
 * The boundaries are unknown — these are year-precision placeholders and a
 * data-collection item. Discord in particular can probably be pinned exactly,
 * since the server's creation date is recoverable.
 */

import type { Era } from './types'

export const ERAS: Era[] = [
  {
    id: 'skype',
    label: 'Skype',
    from: { precision: 'year', year: 2014 },
    until: { precision: 'year', year: 2016 },
  },
  {
    id: 'teamspeak',
    label: 'TeamSpeak 3',
    from: { precision: 'year', year: 2016 },
    until: { precision: 'year', year: 2019 },
  },
  {
    id: 'discord',
    label: 'Discord',
    from: { precision: 'year', year: 2019 },
  },
]

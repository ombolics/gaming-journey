/**
 * The games. Titles as the group would say them.
 *
 * This list is believed roughly correct; it came out of the concept prototype
 * and survived review. Add to it freely as memory improves.
 */

import type { Game } from './types'

export const GAMES: Game[] = [
  { id: 'league-of-legends', title: 'League of Legends' },
  { id: 'minecraft', title: 'Minecraft' },
  { id: 'tanki-online', title: 'Tanki Online' },
  { id: 'metin2', title: 'Metin2' },
  { id: 'dark-orbit', title: 'Dark Orbit' },
  { id: 'unturned', title: 'Unturned' },
  { id: 'cube-world', title: 'Cube World' },
  { id: 'team-fortress-2', title: 'Team Fortress 2' },
  { id: 'terraria', title: 'Terraria' },
  { id: 'rainbow-six-siege', title: 'Rainbow Six Siege' },
  { id: 'space-engineers', title: 'Space Engineers' },
  { id: 'ring-of-elysium', title: 'Ring of Elysium' },
  { id: 'war-thunder', title: 'War Thunder' },
  { id: 'guild-wars-2', title: 'Guild Wars 2' },
  { id: 'world-of-tanks', title: 'World of Tanks' },
  { id: 'cod-warzone', title: 'CoD Warzone' },
  { id: 'among-us', title: 'Among Us' },
  { id: 'pubg', title: 'PUBG' },
  { id: 'phasmophobia', title: 'Phasmophobia' },
  { id: 'lost-ark', title: 'Lost Ark' },
  { id: 'tft', title: 'Teamfight Tactics' },
  { id: 'lethal-company', title: 'REPO / Lethal Company' },
  { id: 'escape-from-tarkov', title: 'Escape from Tarkov' },
]

export const GAMES_BY_ID = new Map(GAMES.map((g) => [g.id, g]))

/**
 * Display labels for the four games we sell services for. Keyed by the
 * camelCase identifier used by the API / Pusher payloads (`data.game`).
 *
 * Lives alongside the SVG geometry config but keyed differently: the SVG file
 * uses kebab-case ('wild-rift') because that mirrors CSS class conventions,
 * while the API uses camelCase ('wildRift'). Centralizing here means callers
 * don't have to know about that distinction.
 */

export type GameId = 'leagueOfLegends' | 'valorant' | 'wildRift' | 'tft'

export const GAME_LABELS: Record<GameId, string> = {
  leagueOfLegends: 'League of Legends',
  valorant: 'Valorant',
  wildRift: 'Wild Rift',
  tft: 'Teamfight Tactics',
}

export const gameLabel = (game: string | null | undefined): string => {
  if (!game) return 'serviço'
  return GAME_LABELS[game as GameId] ?? game
}

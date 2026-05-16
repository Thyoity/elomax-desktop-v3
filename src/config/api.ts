/**
 * Centralized URL configuration. All hosts are read from environment variables
 * (see `.env` / `.env.example`) so the app can be pointed at staging, local,
 * or production without touching the source.
 */

const env = import.meta.env

if (!env.VITE_API_BASE_URL) {
  console.warn('[config/api] VITE_API_BASE_URL is not set — falling back to production')
}

/** Base for the public website (images, files, external links). No `/api` segment. */
export const WEB_BASE_URL: string =
  env.VITE_WEB_BASE_URL ?? 'https://elojobmax.com.br'

/** Base for REST endpoints. Includes the `/api` segment. */
export const API_BASE_URL: string =
  env.VITE_API_BASE_URL ?? `${WEB_BASE_URL}/api`

/** Pusher app key. */
export const PUSHER_KEY: string = env.VITE_PUSHER_KEY ?? ''

/** Pusher cluster (e.g. 'mt1'). */
export const PUSHER_CLUSTER: string = env.VITE_PUSHER_CLUSTER ?? 'mt1'

/** Convenience helpers for the most repeated asset URLs. */
export const championImageUrl = (championId: string | number): string =>
  `${WEB_BASE_URL}/images/elements/league-of-legends/champions/${championId}.png`

export const agentImageUrl = (agentId: string | number): string =>
  `${WEB_BASE_URL}/images/elements/valorant/agents/${agentId}.png`

export const captchaImageUrl = (token: string): string =>
  `${WEB_BASE_URL}/images/captchas/${token}.jpg`

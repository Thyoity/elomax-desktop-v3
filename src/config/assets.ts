/**
 * Static-asset URL helpers. Replaces Webpack's `require()` calls used by the
 * legacy bulk-copied templates with Vite-friendly imports.
 *
 * Each glob is `eager: true` so the asset URLs are inlined at build time.
 */

const badgeModules = import.meta.glob<{ default: string }>(
  '@/assets/badges/simple/*.png',
  { eager: true },
)
const fullBadgeModules = import.meta.glob<{ default: string }>(
  '@/assets/badges/*.png',
  { eager: true },
)
const soundModules = import.meta.glob<{ default: string }>(
  '@/assets/sounds/*.mp3',
  { eager: true },
)
const imageModules = import.meta.glob<{ default: string }>(
  '@/assets/imgs/*.png',
  { eager: true },
)
const valorantBadgeModules = import.meta.glob<{ default: string }>(
  '@/assets/valorant-badges/*.png',
  { eager: true },
)

const resolve = (
  modules: Record<string, { default: string }>,
  key: string,
): string => modules[key]?.default ?? ''

/** Compact (simple/) ranked-tier badge URL by tier name (e.g. `iron`, `gold`). */
export const badgeUrl = (tier: string): string =>
  resolve(badgeModules, `/src/assets/badges/simple/${tier}.png`)

/** Full-art ranked badge URL by tier name (the parent folder, non-simple). */
export const fullBadgeUrl = (tier: string): string =>
  resolve(fullBadgeModules, `/src/assets/badges/${tier}.png`)

/** Notification / chat sound URL by base filename (no extension). */
export const soundUrl = (name: string): string =>
  resolve(soundModules, `/src/assets/sounds/${name}.mp3`)

/** Generic image asset URL from src/assets/imgs/. */
export const imageUrl = (name: string): string =>
  resolve(imageModules, `/src/assets/imgs/${name}.png`)

/** Valorant ranked badge URL by tier name. */
export const valorantBadgeUrl = (tier: string): string =>
  resolve(valorantBadgeModules, `/src/assets/valorant-badges/${tier}.png`)

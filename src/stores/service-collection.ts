/**
 * Single source of truth for the 20 service "buckets" used across the services
 * and services-queue stores, the services DTO, and any UI that filters services
 * by their internal `type` string.
 *
 * Adding a new service variant is a one-line change here.
 */
import { filter as _filter, find as _find } from 'lodash-es'

/** Internal (camelCase) service `type` → state bucket key (plural camelCase). */
export const SERVICE_TYPE_TO_BUCKET = {
  eloBoost: 'eloBoosts',
  winBoost: 'winBoosts',
  duoBoost: 'duoBoosts',
  placement: 'placements',
  mastery: 'masteries',
  maintenance: 'maintenances',
  coaching: 'coachings',
  replayAnalysis: 'replayAnalyses',
  valorantEloBoost: 'valorantEloBoosts',
  valorantWinBoost: 'valorantWinBoosts',
  valorantDuoBoost: 'valorantDuoBoosts',
  valorantPlacement: 'valorantPlacements',
  wildRiftEloBoost: 'wildRiftEloBoosts',
  wildRiftWinBoost: 'wildRiftWinBoosts',
  wildRiftDuoBoost: 'wildRiftDuoBoosts',
  wildRiftPlacement: 'wildRiftPlacements',
  tftEloBoost: 'tftEloBoosts',
  tftWinBoost: 'tftWinBoosts',
  tftPlacement: 'tftPlacements',
  tftPass: 'tftPasses',
} as const

export type ServiceType = keyof typeof SERVICE_TYPE_TO_BUCKET
export type ServiceBucket = (typeof SERVICE_TYPE_TO_BUCKET)[ServiceType]

export const SERVICE_TYPES = Object.keys(SERVICE_TYPE_TO_BUCKET) as ServiceType[]
export const SERVICE_BUCKETS = Object.values(SERVICE_TYPE_TO_BUCKET) as ServiceBucket[]

/**
 * Mirrors the per-action allow-lists from the legacy Vuex store. Actions
 * not listed here accept every type in SERVICE_TYPE_TO_BUCKET.
 */
const DUO_TYPES: ServiceType[] = ['duoBoost', 'valorantDuoBoost', 'wildRiftDuoBoost']

export const ACTION_ALLOWED_TYPES = {
  setServiceAccount: ['eloBoost'] as ServiceType[],
  // Duo services don't expose an account because the client plays alongside the booster.
  setServiceAccountStatus: SERVICE_TYPES.filter((t) => !DUO_TYPES.includes(t)),
  setServiceVictoriesDefeats: [
    'placement',
    'valorantPlacement',
    'wildRiftPlacement',
    'tftPlacement',
  ] as ServiceType[],
  setServiceCurrentVictories: [
    'winBoost',
    'duoBoost',
    'valorantWinBoost',
    'valorantDuoBoost',
    'wildRiftWinBoost',
    'wildRiftDuoBoost',
    'tftWinBoost',
  ] as ServiceType[],
  setServiceCurrentClassCount: ['coaching'] as ServiceType[],
} as const

export type RestrictedAction = keyof typeof ACTION_ALLOWED_TYPES

export const isAllowed = (action: RestrictedAction, type: string): boolean =>
  (ACTION_ALLOWED_TYPES[action] as readonly string[]).includes(type)

/**
 * Finds the service instance in whichever bucket its `type` maps to.
 * Returns null if `type` is unknown or no matching id is found.
 */
export function findServiceInState(
  state: Record<string, any>,
  service: { type: string; id: any },
): any | null {
  const bucket = SERVICE_TYPE_TO_BUCKET[service.type as ServiceType]
  if (!bucket) return null
  return _find(state[bucket], { id: service.id }) || null
}

/** `arr.filter(s => s.status === 'in_progress')` factored out. */
export const filterInProgress = <T extends { status: string }>(arr: T[]): T[] =>
  _filter(arr, (i) => i.status === 'in_progress')

/**
 * Server payload `type` strings (snake_case) → internal bucket + camelCase type.
 * Used by the services DTO to fan items into per-game buckets without a long
 * if/else chain. `postprocess` runs against the *processed* service object.
 */
export interface DtoTypeConfig {
  bucket: ServiceBucket
  type: ServiceType
  postprocess?: (service: any) => void
}

export const RAW_TYPE_TO_DTO_CONFIG: Record<string, DtoTypeConfig> = {
  elo_boost: { bucket: 'eloBoosts', type: 'eloBoost' },
  md10: { bucket: 'placements', type: 'placement' },
  by_victory: { bucket: 'winBoosts', type: 'winBoost' },
  duo_queue: { bucket: 'duoBoosts', type: 'duoBoost' },
  mastery: {
    bucket: 'masteries',
    type: 'mastery',
    postprocess: (s) => {
      s.details.services = JSON.parse(s.details.services)
    },
  },
  maintenance: { bucket: 'maintenances', type: 'maintenance' },
  coaching: { bucket: 'coachings', type: 'coaching' },
  replay_analysis: { bucket: 'replayAnalyses', type: 'replayAnalysis' },
  valorant_elo_boost: { bucket: 'valorantEloBoosts', type: 'valorantEloBoost' },
  valorant_placement: { bucket: 'valorantPlacements', type: 'valorantPlacement' },
  valorant_win_boost: { bucket: 'valorantWinBoosts', type: 'valorantWinBoost' },
  valorant_duo_boost: { bucket: 'valorantDuoBoosts', type: 'valorantDuoBoost' },
  wild_rift_elo_boost: { bucket: 'wildRiftEloBoosts', type: 'wildRiftEloBoost' },
  wild_rift_placement: { bucket: 'wildRiftPlacements', type: 'wildRiftPlacement' },
  wild_rift_win_boost: { bucket: 'wildRiftWinBoosts', type: 'wildRiftWinBoost' },
  wild_rift_duo_boost: { bucket: 'wildRiftDuoBoosts', type: 'wildRiftDuoBoost' },
  tft_elo_boost: { bucket: 'tftEloBoosts', type: 'tftEloBoost' },
  tft_placement: { bucket: 'tftPlacements', type: 'tftPlacement' },
  tft_win_boost: { bucket: 'tftWinBoosts', type: 'tftWinBoost' },
  tft_pass: { bucket: 'tftPasses', type: 'tftPass' },
}

/** Empty `Record<ServiceBucket, any[]>` skeleton for store/DTO initial state. */
export const emptyBuckets = (): Record<ServiceBucket, any[]> => {
  const out = {} as Record<ServiceBucket, any[]>
  for (const bucket of SERVICE_BUCKETS) out[bucket] = []
  return out
}

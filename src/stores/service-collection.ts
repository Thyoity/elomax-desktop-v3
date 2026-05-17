import { filter as _filter, find as _find } from 'lodash-es'
import type { Dayjs } from 'dayjs'

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

export type ChatItemType = 'my-message' | 'their-message' | 'date'

export interface ChatItem {
  id: string | number
  uid: string | number
  type: ChatItemType
  value: string
  time?: string
}

export interface ServiceClient {
  id: number
  username: string
  isOnline: boolean
}

export interface Service {
  id: number
  type: ServiceType
  amount: string
  boosterAmount: string
  chatItems: ChatItem[]
  description: string | null
  details: Record<string, any>
  client: ServiceClient
  dateAcceptable: Dayjs | null
  dateUpdated: string
  dateFinished: Dayjs | null
  screenshot: string | null
  status: string
}

export type ServiceRef = Pick<Service, 'id' | 'type'>

export const SERVICE_TYPES = Object.keys(SERVICE_TYPE_TO_BUCKET) as ServiceType[]
export const SERVICE_BUCKETS = Object.values(SERVICE_TYPE_TO_BUCKET) as ServiceBucket[]

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

export function findServiceInState(
  state: Record<string, any>,
  service: ServiceRef,
): Service | null {
  const bucket = SERVICE_TYPE_TO_BUCKET[service.type]
  if (!bucket) return null
  return (_find(state[bucket], { id: service.id }) as Service | undefined) || null
}

export const filterInProgress = <T extends { status: string }>(arr: T[]): T[] =>
  _filter(arr, (i) => i.status === 'in_progress')

export interface DtoTypeConfig {
  bucket: ServiceBucket
  type: ServiceType
  postprocess?: (service: Service) => void
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

export const emptyBuckets = (): Record<ServiceBucket, Service[]> => {
  const out = {} as Record<ServiceBucket, Service[]>
  for (const bucket of SERVICE_BUCKETS) out[bucket] = []
  return out
}

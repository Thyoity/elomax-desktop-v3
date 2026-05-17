import { defineStore } from 'pinia'
import dayjs from 'dayjs'

import servicesDTO from '@/dtos/services'
import {
  RAW_TYPE_TO_DTO_CONFIG,
  SERVICE_BUCKETS,
  emptyBuckets,
  filterInProgress,
  findServiceInState,
  isAllowed,
  type ChatItem,
  type Service,
  type ServiceBucket,
  type ServiceRef,
} from './service-collection'

interface State extends Record<ServiceBucket, Service[]> {
  isLoadingServices: boolean
  loadingServicesText: string
  detailedService: Service | null
}

const generateInitialState = (): State => ({
  isLoadingServices: true,
  loadingServicesText: '',
  ...emptyBuckets(),
  detailedService: null,
})

function findActiveService(
  store: { detailedService: Service | null; $state: Record<string, any> },
  service: ServiceRef,
): Service | null {
  if (store.detailedService && store.detailedService.id === service.id) return store.detailedService
  return findServiceInState(store.$state, service)
}

const inProgress = (bucket: ServiceBucket) => (s: State) => filterInProgress(s[bucket])

const VICTORY_DEFEAT_OPS: Record<string, { field: 'victories' | 'defeats'; delta: 1 | -1 }> = {
  'add-victory': { field: 'victories', delta: 1 },
  'remove-victory': { field: 'victories', delta: -1 },
  'add-defeat': { field: 'defeats', delta: 1 },
  'remove-defeat': { field: 'defeats', delta: -1 },
}

export const useServicesStore = defineStore('services', {
  state: (): State => generateInitialState(),
  getters: {
    inProgressEloBoosts: inProgress('eloBoosts'),
    inProgressWinBoosts: inProgress('winBoosts'),
    inProgressDuoBoosts: inProgress('duoBoosts'),
    inProgressPlacements: inProgress('placements'),
    inProgressMasteries: inProgress('masteries'),
    inProgressMaintenances: inProgress('maintenances'),
    inProgressCoachings: inProgress('coachings'),
    inProgressReplayAnalyses: inProgress('replayAnalyses'),
    inProgressValorantEloBoosts: inProgress('valorantEloBoosts'),
    inProgressValorantWinBoosts: inProgress('valorantWinBoosts'),
    inProgressValorantDuoBoosts: inProgress('valorantDuoBoosts'),
    inProgressValorantPlacements: inProgress('valorantPlacements'),
    inProgressWildRiftEloBoosts: inProgress('wildRiftEloBoosts'),
    inProgressWildRiftWinBoosts: inProgress('wildRiftWinBoosts'),
    inProgressWildRiftDuoBoosts: inProgress('wildRiftDuoBoosts'),
    inProgressWildRiftPlacements: inProgress('wildRiftPlacements'),
    inProgressTftEloBoosts: inProgress('tftEloBoosts'),
    inProgressTftWinBoosts: inProgress('tftWinBoosts'),
    inProgressTftPlacements: inProgress('tftPlacements'),
    inProgressTftPasses: inProgress('tftPasses'),
    serviceById: (s) => (id: number): Service | null => {
      for (const bucket of SERVICE_BUCKETS) {
        const found = s[bucket].find((svc) => svc.id === id)
        if (found) return found
      }
      if (s.detailedService && s.detailedService.id === id) return s.detailedService
      return null
    },
  },
  actions: {
    resetServicesModule() {
      Object.assign(this, generateInitialState())
    },
    setIsLoadingServices(value = true) {
      this.isLoadingServices = value
    },
    setLoadingServicesText(value = '') {
      this.loadingServicesText = value
    },
    setServices(services: any) {
      const result = servicesDTO.in(services)
      for (const bucket of SERVICE_BUCKETS) {
        this[bucket] = result[bucket]
      }
    },
    loadDetailedService(rawService: any): Service | null {
      const config = RAW_TYPE_TO_DTO_CONFIG[rawService.type]
      if (!config) {
        this.detailedService = null
        return null
      }
      const processed = servicesDTO.in([rawService])[config.bucket][0]
      if (!processed) {
        this.detailedService = null
        return null
      }
      const bucketArray: Service[] = this[config.bucket]
      const index = bucketArray.findIndex((s) => s.id === processed.id)
      if (index !== -1) {
        bucketArray.splice(index, 1, processed)
        this.detailedService = null
        return bucketArray[index]
      }
      this.detailedService = processed
      return processed
    },
    resetDetailedService() {
      this.detailedService = null
    },
    setServiceAccount({ service, account }: { service: ServiceRef; account: any }) {
      if (!isAllowed('setServiceAccount', service.type)) return
      const target = findActiveService(this, service)
      if (target) target.details.account = { ...account }
    },
    setServiceAccountStatus({ service, accountStatus }: { service: ServiceRef; accountStatus: any }) {
      if (!isAllowed('setServiceAccountStatus', service.type)) return
      const target = findActiveService(this, service)
      if (target) target.details.account_status = accountStatus
    },
    setServiceVictoriesDefeats({ service, operation }: { service: ServiceRef; operation: string }) {
      if (!isAllowed('setServiceVictoriesDefeats', service.type)) return
      const op = VICTORY_DEFEAT_OPS[operation]
      if (!op) return
      const target = findActiveService(this, service)
      if (target) target.details[op.field] = parseInt(target.details[op.field]) + op.delta
    },
    setServiceCurrentVictories({ service, operation }: { service: ServiceRef; operation: string }) {
      if (!isAllowed('setServiceCurrentVictories', service.type)) return
      const delta = operation === 'add' ? 1 : -1
      const target = findActiveService(this, service)
      if (target) target.details.current_victories = parseInt(target.details.current_victories) + delta
    },
    setServiceCurrentClassCount({ service, operation }: { service: ServiceRef; operation: string }) {
      if (!isAllowed('setServiceCurrentClassCount', service.type)) return
      const delta = operation === 'add' ? 1 : -1
      const target = findActiveService(this, service)
      if (target) target.details.current_class_count = parseInt(target.details.current_class_count) + delta
    },
    setServiceClientIsOnline({ service, isOnline }: { service: ServiceRef; isOnline: boolean }) {
      const target = findActiveService(this, service)
      if (target) target.client = { ...target.client, isOnline }
    },
    addServiceChatItem({ service, chatItem }: { service: ServiceRef; chatItem: ChatItem }) {
      const target = findActiveService(this, service)
      if (!target) return
      if (target.chatItems.some((existing) => existing.uid === chatItem.uid)) return
      target.chatItems.push(chatItem)
    },
    finishService({
      service,
      dateFinished,
      screenshot,
    }: {
      service: ServiceRef
      dateFinished: any
      screenshot: string | null
    }) {
      const target = findActiveService(this, service)
      if (!target) return
      target.dateFinished = dayjs(dateFinished)
      target.screenshot = screenshot
      target.status = 'finished'
    },
  },
})

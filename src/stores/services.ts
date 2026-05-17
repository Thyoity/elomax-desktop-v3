import { defineStore } from 'pinia'
import { first as _first, assign as _assign } from 'lodash-es'
import dayjs from 'dayjs'

import servicesDTO from '@/dtos/services'
import {
  SERVICE_BUCKETS,
  emptyBuckets,
  filterInProgress,
  findServiceInState,
  isAllowed,
  type ServiceBucket,
} from './service-collection'

interface State extends Record<ServiceBucket, any[]> {
  isLoadingServices: boolean
  loadingServicesText: string
  tempService: any | null
}

const generateInitialState = (): State => ({
  isLoadingServices: true,
  loadingServicesText: '',
  ...emptyBuckets(),
  tempService: null,
})

/** Map operation suffix → which detail field & sign to apply. */
const VICTORY_DEFEAT_OPS: Record<string, { field: 'victories' | 'defeats'; delta: 1 | -1 }> = {
  'add-victory': { field: 'victories', delta: 1 },
  'remove-victory': { field: 'victories', delta: -1 },
  'add-defeat': { field: 'defeats', delta: 1 },
  'remove-defeat': { field: 'defeats', delta: -1 },
}

export const useServicesStore = defineStore('services', {
  state: (): State => generateInitialState(),
  getters: {
    inProgressEloBoosts: (s) => filterInProgress(s.eloBoosts),
    inProgressWinBoosts: (s) => filterInProgress(s.winBoosts),
    inProgressDuoBoosts: (s) => filterInProgress(s.duoBoosts),
    inProgressPlacements: (s) => filterInProgress(s.placements),
    inProgressMasteries: (s) => filterInProgress(s.masteries),
    inProgressMaintenances: (s) => filterInProgress(s.maintenances),
    inProgressCoachings: (s) => filterInProgress(s.coachings),
    inProgressReplayAnalyses: (s) => filterInProgress(s.replayAnalyses),
    inProgressValorantEloBoosts: (s) => filterInProgress(s.valorantEloBoosts),
    inProgressValorantWinBoosts: (s) => filterInProgress(s.valorantWinBoosts),
    inProgressValorantDuoBoosts: (s) => filterInProgress(s.valorantDuoBoosts),
    inProgressValorantPlacements: (s) => filterInProgress(s.valorantPlacements),
    inProgressWildRiftEloBoosts: (s) => filterInProgress(s.wildRiftEloBoosts),
    inProgressWildRiftWinBoosts: (s) => filterInProgress(s.wildRiftWinBoosts),
    inProgressWildRiftDuoBoosts: (s) => filterInProgress(s.wildRiftDuoBoosts),
    inProgressWildRiftPlacements: (s) => filterInProgress(s.wildRiftPlacements),
    inProgressTftEloBoosts: (s) => filterInProgress(s.tftEloBoosts),
    inProgressTftWinBoosts: (s) => filterInProgress(s.tftWinBoosts),
    inProgressTftPlacements: (s) => filterInProgress(s.tftPlacements),
    inProgressTftPasses: (s) => filterInProgress(s.tftPasses),
  },
  actions: {
    RESET_SERVICES_MODULE() {
      Object.assign(this, generateInitialState())
    },
    SET_IS_LOADING_SERVICES(value = true) {
      this.isLoadingServices = value
    },
    SET_LOADING_SERVICES_TEXT(value = '') {
      this.loadingServicesText = value
    },
    SET_SERVICES(services: any) {
      const result = servicesDTO.in(services, false)
      for (const bucket of SERVICE_BUCKETS) {
        ;(this as any)[bucket] = result[bucket]
      }
    },
    SET_TEMP_SERVICE({ service, onLoad }: { service: any; onLoad: (svc: any) => void }) {
      const result = servicesDTO.in([service], true)
      for (const bucket of SERVICE_BUCKETS) {
        if (result[bucket].length) {
          this.tempService = _first(result[bucket])
          break
        }
      }
      onLoad(this.tempService)
    },
    RESET_TEMP_SERVICE() {
      this.tempService = null
    },
    SET_SERVICE_ACCOUNT({ service, account }: { service: any; account: any }) {
      if (!isAllowed('SET_SERVICE_ACCOUNT', service.type)) return
      const s = findServiceInState(this.$state, service)
      if (!s) return
      s.details.account = { ...account }
    },
    SET_SERVICE_ACCOUNT_STATUS({ service, accountStatus }: { service: any; accountStatus: any }) {
      if (!isAllowed('SET_SERVICE_ACCOUNT_STATUS', service.type)) return
      const s = findServiceInState(this.$state, service)
      if (!s) return
      s.details.account_status = accountStatus
    },
    SET_SERVICE_VICTORIES_DEFEATS({ service, operation }: { service: any; operation: string }) {
      if (!isAllowed('SET_SERVICE_VICTORIES_DEFEATS', service.type)) return
      const op = VICTORY_DEFEAT_OPS[operation]
      if (!op) return
      const s = findServiceInState(this.$state, service)
      if (!s) return
      s.details[op.field] = parseInt(s.details[op.field]) + op.delta
    },
    SET_SERVICE_CURRENT_VICTORIES({ service, operation }: { service: any; operation: string }) {
      if (!isAllowed('SET_SERVICE_CURRENT_VICTORIES', service.type)) return
      const s = findServiceInState(this.$state, service)
      if (!s) return
      const delta = operation === 'add' ? 1 : -1
      s.details.current_victories = parseInt(s.details.current_victories) + delta
    },
    SET_SERVICE_CURRENT_CLASS_COUNT({ service, operation }: { service: any; operation: string }) {
      if (!isAllowed('SET_SERVICE_CURRENT_CLASS_COUNT', service.type)) return
      const s = findServiceInState(this.$state, service)
      if (!s) return
      const delta = operation === 'add' ? 1 : -1
      s.details.current_class_count = parseInt(s.details.current_class_count) + delta
    },
    SET_SERVICE_CLIENT_IS_ONLINE({ service, isOnline }: { service: any; isOnline: boolean }) {
      const s = findServiceInState(this.$state, service)
      if (!s) return
      _assign(s, { client: { ...s.client, isOnline } })
    },
    ADD_SERVICE_CHAT_ITEM({ service, chatItem }: { service: any; chatItem: any }) {
      if (this.tempService && this.tempService.id === service.id) {
        this.tempService.chatItems.push(chatItem)
      }
      const s = findServiceInState(this.$state, service)
      if (s) s.chatItems.push(chatItem)
    },
    FINISH_SERVICE({
      service,
      dateFinished,
      screenshot,
    }: {
      service: any
      dateFinished: any
      screenshot: any
    }) {
      const s = findServiceInState(this.$state, service)
      if (!s) return
      _assign(s, { dateFinished: dayjs(dateFinished), screenshot, status: 'finished' })
    },
  },
})

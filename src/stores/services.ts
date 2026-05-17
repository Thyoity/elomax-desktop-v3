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
      const result = servicesDTO.in(services, false)
      for (const bucket of SERVICE_BUCKETS) {
        ;(this as any)[bucket] = result[bucket]
      }
    },
    setTempService({ service, onLoad }: { service: any; onLoad: (svc: any) => void }) {
      const result = servicesDTO.in([service], true)
      for (const bucket of SERVICE_BUCKETS) {
        if (result[bucket].length) {
          this.tempService = _first(result[bucket])
          break
        }
      }
      onLoad(this.tempService)
    },
    resetTempService() {
      this.tempService = null
    },
    setServiceAccount({ service, account }: { service: any; account: any }) {
      if (!isAllowed('setServiceAccount', service.type)) return
      this._applyToBoth(service, (s) => {
        s.details.account = { ...account }
      })
    },
    setServiceAccountStatus({ service, accountStatus }: { service: any; accountStatus: any }) {
      if (!isAllowed('setServiceAccountStatus', service.type)) return
      this._applyToBoth(service, (s) => {
        s.details.account_status = accountStatus
      })
    },
    setServiceVictoriesDefeats({ service, operation }: { service: any; operation: string }) {
      if (!isAllowed('setServiceVictoriesDefeats', service.type)) return
      const op = VICTORY_DEFEAT_OPS[operation]
      if (!op) return
      this._applyToBoth(service, (s) => {
        s.details[op.field] = parseInt(s.details[op.field]) + op.delta
      })
    },
    setServiceCurrentVictories({ service, operation }: { service: any; operation: string }) {
      if (!isAllowed('setServiceCurrentVictories', service.type)) return
      const delta = operation === 'add' ? 1 : -1
      this._applyToBoth(service, (s) => {
        s.details.current_victories = parseInt(s.details.current_victories) + delta
      })
    },
    setServiceCurrentClassCount({ service, operation }: { service: any; operation: string }) {
      if (!isAllowed('setServiceCurrentClassCount', service.type)) return
      const delta = operation === 'add' ? 1 : -1
      this._applyToBoth(service, (s) => {
        s.details.current_class_count = parseInt(s.details.current_class_count) + delta
      })
    },
    setServiceClientIsOnline({ service, isOnline }: { service: any; isOnline: boolean }) {
      this._applyToBoth(service, (s) => {
        _assign(s, { client: { ...s.client, isOnline } })
      })
    },
    addServiceChatItem({ service, chatItem }: { service: any; chatItem: any }) {
      this._applyToBoth(service, (s) => {
        s.chatItems.push(chatItem)
      })
    },
    finishService({
      service,
      dateFinished,
      screenshot,
    }: {
      service: any
      dateFinished: any
      screenshot: any
    }) {
      this._applyToBoth(service, (s) => {
        _assign(s, { dateFinished: dayjs(dateFinished), screenshot, status: 'finished' })
      })
    },
    _applyToBoth(service: { id: any; type: string }, mutate: (s: any) => void) {
      if (this.tempService && this.tempService.id === service.id) mutate(this.tempService)
      const s = findServiceInState(this.$state, service)
      if (s) mutate(s)
    },
  },
})

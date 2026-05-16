/**
 * Vuex-style mapState/mapMutations/mapActions/mapGetters helpers that re-route to Pinia stores.
 * Lets components ported from the legacy Vuex codebase keep their existing import syntax:
 *   import { mapState, mapMutations } from '@/stores/compat'
 *   mapState('auth', ['token']) // -> works on useAuthStore
 */
import {
  mapState as piniaMapState,
  mapActions as piniaMapActions,
  type StoreDefinition,
} from 'pinia'

import { useAppStore } from './app'
import { useAuthStore } from './auth'
import { useLolStore } from './lol'
import { useSettingsStore } from './settings'
import { useNotificationsStore } from './notifications'
import { useServicesStore } from './services'
import { useServicesQueueStore } from './services-queue'

type AnyStoreDef = StoreDefinition<any, any, any, any>

const moduleRegistry: Record<string, AnyStoreDef> = {
  app: useAppStore as unknown as AnyStoreDef,
  auth: useAuthStore as unknown as AnyStoreDef,
  lol: useLolStore as unknown as AnyStoreDef,
  settings: useSettingsStore as unknown as AnyStoreDef,
  notifications: useNotificationsStore as unknown as AnyStoreDef,
  services: useServicesStore as unknown as AnyStoreDef,
  'services-queue': useServicesQueueStore as unknown as AnyStoreDef,
}

function resolveStore(moduleName: string | null): AnyStoreDef {
  if (!moduleName) return moduleRegistry.app
  const store = moduleRegistry[moduleName]
  if (!store) throw new Error(`[compat] unknown store module: ${moduleName}`)
  return store
}

type Keys = string[] | Record<string, string>

export function mapState(moduleOrKeys: string | Keys, keys?: Keys): any {
  if (typeof moduleOrKeys === 'string') {
    return piniaMapState(resolveStore(moduleOrKeys), keys as any)
  }
  return piniaMapState(resolveStore(null), moduleOrKeys as any)
}

// Pinia merges mutations + actions, so map mutations/actions both target mapActions.
export function mapMutations(moduleOrKeys: string | Keys, keys?: Keys): any {
  if (typeof moduleOrKeys === 'string') {
    return piniaMapActions(resolveStore(moduleOrKeys), keys as any)
  }
  return piniaMapActions(resolveStore(null), moduleOrKeys as any)
}

export function mapActions(moduleOrKeys: string | Keys, keys?: Keys): any {
  if (typeof moduleOrKeys === 'string') {
    return piniaMapActions(resolveStore(moduleOrKeys), keys as any)
  }
  return piniaMapActions(resolveStore(null), moduleOrKeys as any)
}

// Pinia exposes getters via mapState too.
export function mapGetters(moduleOrKeys: string | Keys, keys?: Keys): any {
  if (typeof moduleOrKeys === 'string') {
    return piniaMapState(resolveStore(moduleOrKeys), keys as any)
  }
  return piniaMapState(resolveStore(null), moduleOrKeys as any)
}

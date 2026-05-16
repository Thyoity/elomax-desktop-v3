/**
 * Single source of truth for all 22 service "extras". Adding a new variant is
 * one entry in this map — no new .vue file needed.
 */

import type { Component } from 'vue'
import ExtraChampionsModal from '@/components/modals/ExtraChampionsModal.vue'
import ExtraAgentsModal from '@/components/modals/ExtraAgentsModal.vue'

// Eager-glob all extra icons so each entry can be referenced by file name.
const iconModules = import.meta.glob<{ default: string }>(
  '@/assets/extras/*.png',
  { eager: true },
)
const iconUrl = (name: string): string => {
  const key = `/src/assets/extras/${name}.png`
  return iconModules[key]?.default ?? ''
}

/** Pretty labels for the lane/role values used by primary/secondary route extras. */
const ROLE_LABELS: Record<string, string> = {
  top: 'Topo',
  mid: 'Mid',
  support: 'Suporte',
  jungle: 'Selva',
  adc: 'ADC',
}

const ROLE_ICONS: Record<string, string> = {
  top: iconUrl('top'),
  mid: iconUrl('mid'),
  support: iconUrl('support'),
  jungle: iconUrl('jungle'),
  adc: iconUrl('adc'),
}

export interface ExtraModalSpec {
  /** Vue component opened via `useModal({ component, ... })`. */
  component: Component
  title: string
  description: string
  /** Key under which `value` is passed to the modal (e.g. `champions`, `agents`). */
  paramKey: string
}

export interface ExtraConfig {
  /** Static string or a resolver that receives the extra's `value`. */
  tooltip: string | ((value: any) => string)
  /** Single icon URL used regardless of `value`. */
  icon?: string
  /** Icon URL chosen by `value` (used by primary/secondary route). */
  iconByValue?: Record<string, string>
  /** Click opens the named modal with `{ extraTitle, extraDescription, [paramKey]: value }`. */
  modal?: ExtraModalSpec
}

export const EXTRAS_CONFIG: Record<string, ExtraConfig> = {
  solo: {
    tooltip: 'Serviço solo',
    icon: iconUrl('solo'),
  },
  win: {
    tooltip: 'Vitória extra',
    icon: iconUrl('win'),
  },
  friend: {
    tooltip: 'Amigo',
    icon: iconUrl('friend'),
  },
  'valorant-friend': {
    tooltip: 'Convide um Amigo',
    icon: iconUrl('valorant-friend'),
  },
  'favorite-booster': {
    tooltip: (value) => `Booster favorito: ${value}`,
    icon: iconUrl('favorite-booster'),
  },
  'mmr-tax': {
    tooltip: 'Correção de MMR',
    icon: iconUrl('mmr-tax'),
  },
  'mmr-tax-buffed': {
    tooltip: 'Taxa de MMR Buffado',
    icon: iconUrl('mmr-tax-buffed'),
  },
  'risk-tax': {
    tooltip: 'Taxa de Risco',
    icon: iconUrl('risk-tax'),
  },
  'kda-reduction': {
    tooltip: 'Redução de KDA',
    icon: iconUrl('kda-reduction'),
  },
  'spell-order': {
    tooltip: (value: string) => `Flash no ${String(value).toUpperCase()}`,
    icon: iconUrl('spell-order'),
  },
  'hidden-nick': {
    // Legacy reused the offline-chat icon for the hidden-nick extra.
    tooltip: 'Nick Oculto',
    icon: iconUrl('offline-chat'),
  },
  'offline-chat': {
    tooltip: 'Chat offline',
    icon: iconUrl('offline-chat'),
  },
  streaming: {
    tooltip: 'Streaming',
    icon: iconUrl('streaming'),
  },
  remote: {
    tooltip: 'Serviço Remoto',
    icon: iconUrl('remote'),
  },
  'restricted-time': {
    tooltip: (value) => `Horário restrito: ${value}`,
    icon: iconUrl('restricted-time'),
  },
  'deadline-time-reduction': {
    tooltip: 'Prazo de entrega reduzido',
    icon: iconUrl('deadline-time-reduction'),
  },
  'priority-service': {
    tooltip: 'Serviço prioritário',
    icon: iconUrl('priority-service'),
  },
  'primary-route': {
    tooltip: (value: string) => `Rota 1ª: ${ROLE_LABELS[value] ?? value}`,
    iconByValue: ROLE_ICONS,
  },
  'secondary-route': {
    tooltip: (value: string) => `Rota 2ª: ${ROLE_LABELS[value] ?? value}`,
    iconByValue: ROLE_ICONS,
  },
  champions: {
    tooltip: 'Campeões',
    icon: iconUrl('champions'),
    modal: {
      component: ExtraChampionsModal,
      title: 'Extra: Campeões específicos',
      description: 'O cliente pagou pela restrição de campeões.',
      paramKey: 'champions',
    },
  },
  agents: {
    // Legacy reuses the champions icon for the agents extra.
    tooltip: 'Agentes',
    icon: iconUrl('champions'),
    modal: {
      component: ExtraAgentsModal,
      title: 'Extra: Agentes específicos',
      description: 'O cliente pagou pela restrição de agentes.',
      paramKey: 'agents',
    },
  },
  'super-restriction': {
    tooltip: 'Super restrição',
    icon: iconUrl('super-restriction'),
    modal: {
      component: ExtraChampionsModal,
      title: 'Extra: Super restrição',
      description: 'O cliente pagou por uma super restrição de campeões.',
      paramKey: 'champions',
    },
  },
}

/** Resolved icon for a given extra `type` and `value`. */
export const resolveExtraIcon = (config: ExtraConfig, value: any): string => {
  if (config.iconByValue) return config.iconByValue[value] ?? ''
  return config.icon ?? ''
}

/** Resolved tooltip text for a given extra `type` and `value`. */
export const resolveExtraTooltip = (config: ExtraConfig, value: any): string => {
  return typeof config.tooltip === 'function' ? config.tooltip(value) : config.tooltip
}

import dayjs from 'dayjs'

import {
  RAW_TYPE_TO_DTO_CONFIG,
  SERVICE_BUCKETS,
  type ServiceBucket,
} from '@/stores/service-collection'

const EXTRA_TYPE_OVERRIDES: Record<string, string> = {
  champion_mastery: 'super-restriction',
  deadline_time_reduction: 'deadline-time-reduction',
  mmr_tax_buffed: 'mmr-tax-buffed',
}

const pushExtra = (extras: any[], rawType: string, value: any) => {
  if (rawType === 'lanes') {
    extras.push({ type: 'primary-route', value: value.primary })
    extras.push({ type: 'secondary-route', value: value.secondary })
    return
  }
  const type = EXTRA_TYPE_OVERRIDES[rawType] ?? rawType.replace('_', '-')
  extras.push({ type, value })
}

const processChatItems = (chatItems: any[] | undefined, userId: number) => {
  if (!chatItems || !Array.isArray(chatItems) || chatItems.length === 0) return []

  const processed: any[] = []
  let lastDateDay: string | null = null

  for (const item of chatItems) {
    const dateCreated = dayjs(item.date_created)
    const formattedDay = dateCreated.format('DD/MM/YYYY')

    if (lastDateDay !== formattedDay) {
      lastDateDay = formattedDay
      const uniqueId = item.id + dateCreated.unix()
      processed.push({ id: uniqueId, uid: uniqueId, type: 'date', value: formattedDay })
    }

    processed.push({
      id: item.id,
      uid: item.uid,
      type: userId === parseInt(item.id_user) ? 'my-message' : 'their-message',
      value: item.message,
      time: dateCreated.format('HH:mm'),
    })
  }

  return processed
}

const processDefaultServiceStructure = (service: any) => {
  const extrasObject = JSON.parse(service.details.extras)
  const extras: any[] = []
  if (extrasObject && extrasObject.constructor === Object) {
    for (const [key, value] of Object.entries(extrasObject)) {
      pushExtra(extras, key, value)
    }
  }
  return {
    id: parseInt(service.id),
    amount: service.amount,
    boosterAmount: service.booster_amount,
    chatItems: processChatItems(service.chatItems, parseInt(service.id_booster)),
    description: service.description,
    details: { ...service.details, extras },
    client: {
      id: parseInt(service.client.id),
      username: service.client.username,
      isOnline: false,
    },
    dateAcceptable: service.date_acceptable ? dayjs(service.date_acceptable) : null,
    dateUpdated: service.date_updated,
    dateFinished: service.date_finished ? dayjs(service.date_finished) : null,
    screenshot: service.screenshot ?? null,
    status: service.status,
  }
}

export type ServicesDtoOutput = Record<ServiceBucket, any[]>

export default {
  /**
   * Fans an array of server-shaped services into 20 buckets keyed by internal
   * camelCase names. Unknown server types are dropped silently (matches legacy).
   */
  in(services: any[] = [], isTemp = false): ServicesDtoOutput {
    const buckets = {} as ServicesDtoOutput
    for (const key of SERVICE_BUCKETS) buckets[key] = []

    if (!Array.isArray(services)) return buckets

    for (const service of services) {
      const config = RAW_TYPE_TO_DTO_CONFIG[service.type]
      if (!config) continue
      const processed = {
        ...processDefaultServiceStructure(service),
        type: config.type,
        isTemp,
      }
      config.postprocess?.(processed)
      buckets[config.bucket].push(processed)
    }

    return buckets
  },
}

import { defineStore } from 'pinia'

import servicesDTO from '@/dtos/services'
import {
  SERVICE_BUCKETS,
  type ServiceBucket,
} from './service-collection'

/** Bucket key in the dto output → matching key on the queue store state. */
type QueueBucket = `queue${Capitalize<ServiceBucket>}`
const toQueueBucket = (bucket: ServiceBucket): QueueBucket =>
  (`queue${bucket.charAt(0).toUpperCase()}${bucket.slice(1)}`) as QueueBucket

const QUEUE_BUCKETS: QueueBucket[] = SERVICE_BUCKETS.map(toQueueBucket)

interface State extends Record<QueueBucket, any[]> {
  fetchLocalTime: Date | null
  fetchServerTime: any
  isLoadingServicesQueue: boolean
  loadingServicesQueueText: string
}

const generateInitialState = (): State => {
  const queueBuckets = {} as Record<QueueBucket, any[]>
  for (const key of QUEUE_BUCKETS) queueBuckets[key] = []
  return {
    fetchLocalTime: null,
    fetchServerTime: null,
    isLoadingServicesQueue: true,
    loadingServicesQueueText: '',
    ...queueBuckets,
  }
}

export const useServicesQueueStore = defineStore('services-queue', {
  state: (): State => generateInitialState(),
  actions: {
    resetServicesQueueModule() {
      Object.assign(this, generateInitialState())
    },
    setServicesQueueFetchServerTime(serverTime: any) {
      this.fetchLocalTime = new Date()
      this.fetchServerTime = serverTime
    },
    setIsLoadingServicesQueue(value = true) {
      this.isLoadingServicesQueue = value
    },
    setLoadingServicesQueueText(value = '') {
      this.loadingServicesQueueText = value
    },
    setServicesQueue({ queue }: { queue: any }) {
      const result = servicesDTO.in(queue)
      for (const bucket of SERVICE_BUCKETS) {
        ;(this as any)[toQueueBucket(bucket)] = result[bucket]
      }
    },
  },
})

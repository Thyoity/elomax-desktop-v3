/**
 * Single source of truth for Pusher channel names + event names used across
 * the app. Constants here mirror what the backend emits — a typo on either
 * side breaks the integration silently, so we centralize them.
 */

/** Channel name factories. Use these instead of inlining string concatenation. */
export const pusherChannel = {
  /** Per-user private channel: notifications, credit, read receipts. */
  privateUser: (userId: number | string): string => `private-user-${userId}`,
  /** Per-service presence channel: client online/offline + chat messages. */
  presenceService: (serviceId: number | string): string =>
    `presence-service-${serviceId}`,
  /** Global queue channel: services entering / being accepted in the queue. */
  servicesQueue: 'services-queue' as const,
} as const

/** Custom event names (server-emitted). Keep in sync with the API. */
export const pusherEvents = {
  // private-user-<id>
  newNotification: 'new-notification',
  creditUpdate: 'credit-update',
  readServiceNotifications: 'read-service-notifications',
  // services-queue
  servicesQueueUpdated: 'updated',
  servicesQueueAccepted: 'accepted',
  // presence-service-<id>
  newChatItem: 'new-chat-item',
} as const

/** Built-in Pusher framework events. */
export const pusherSystemEvents = {
  subscriptionSucceeded: 'pusher:subscription_succeeded',
  subscriptionError: 'pusher:subscription_error',
  memberAdded: 'pusher:member_added',
  memberRemoved: 'pusher:member_removed',
} as const

/** Connection state transitions surfaced by Pusher's connection object. */
export const pusherConnectionState = {
  connecting: 'connecting',
  connected: 'connected',
  unavailable: 'unavailable',
  disconnected: 'disconnected',
  failed: 'failed',
} as const

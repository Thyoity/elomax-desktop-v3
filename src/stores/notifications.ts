import { defineStore } from 'pinia'
import { filter as _filter, truncate as _truncate } from 'lodash-es'
import dayjs, { type Dayjs } from 'dayjs'

interface Notification {
  id: number
  relatedServiceId: number
  isRead: boolean
  description: string
  dateCreated: Dayjs
  dateUpdated: Dayjs
  dateRead: Dayjs | null
}

interface State {
  isLoadingNotifications: boolean
  loadingNotificationsText: string
  notifications: Notification[]
}

const generateInitialState = (): State => ({
  isLoadingNotifications: true,
  loadingNotificationsText: '',
  notifications: [],
})

export const useNotificationsStore = defineStore('notifications', {
  state: (): State => generateInitialState(),
  actions: {
    RESET_NOTIFICATIONS_MODULE() {
      Object.assign(this, generateInitialState())
    },
    SET_IS_LOADING_NOTIFICATIONS(value = true) {
      this.isLoadingNotifications = value
    },
    SET_LOADING_NOTIFICATIONS_TEXT(value = '') {
      this.loadingNotificationsText = value
    },
    SET_NOTIFICATIONS(notifications: any[]) {
      this.notifications = notifications.map((notification: any) => ({
        id: parseInt(notification.id),
        relatedServiceId: parseInt(notification.id_related_service),
        isRead: !!notification.is_read,
        description: `${notification.user ? notification.user.username : 'Cliente'} escreveu: ${_truncate(
          notification.title,
          { length: 50, separator: ' ' },
        )}`,
        dateCreated: dayjs(notification.date_created),
        dateUpdated: dayjs(notification.date_updated),
        dateRead: notification.date_read ? dayjs(notification.date_read) : null,
      }))
    },
    ADD_NOTIFICATION({
      relatedServiceId,
      client,
      notification,
    }: {
      relatedServiceId: number
      client: { username: string }
      notification: any
    }) {
      this.notifications.push({
        id: parseInt(notification.id),
        relatedServiceId,
        isRead: !!notification.is_read,
        description: `${client.username} escreveu: ${_truncate(notification.title, { length: 50, separator: ' ' })}`,
        dateCreated: dayjs(notification.date_created),
        dateUpdated: dayjs(notification.date_updated),
        dateRead: notification.date_read ? dayjs(notification.date_read) : null,
      })
    },
    REMOVE_SERVICE_NOTIFICATIONS(serviceId: number) {
      this.notifications = _filter(this.notifications, (n) => n.relatedServiceId !== serviceId)
    },
  },
})

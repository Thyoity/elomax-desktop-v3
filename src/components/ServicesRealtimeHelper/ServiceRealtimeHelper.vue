<template>
  <div style="display: none;"></div>
</template>

<script>
import dayjs from 'dayjs'
import { mapActions, mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useServicesStore } from '@/stores/services'
import { useSettingsStore } from '@/stores/settings'
import {
  pusherChannel,
  pusherEvents,
  pusherSystemEvents,
} from '@/config/pusher-channels'

export default {
  props: ['service'],
  computed: {
    ...mapState(useAuthStore, ['user']),
    ...mapState(useSettingsStore, ['playSoundOnNewNotification', 'playSoundOnNewChatItem']),
    ...mapState(useAppStore, ['currentServiceId', 'currentServiceTab', 'notificationSound', 'chatMessageSound']),
    channelName() {
      return pusherChannel.presenceService(this.service.id)
    },
  },
  methods: {
    ...mapActions(useServicesStore, ['setServiceClientIsOnline', 'addServiceChatItem']),
    ...mapActions(useNotificationsStore, ['addNotification']),
    onSubscriptionSucceeded(data) {
      const isClientOnline = !!data?.members?.[this.service.client.id]
      this.setServiceClientIsOnline({ service: this.service, isOnline: isClientOnline })
    },
    onMemberAdded(member) {
      if (member?.info?.userId === this.service.client.id) {
        this.setServiceClientIsOnline({ service: this.service, isOnline: true })
      }
    },
    onMemberRemoved(member) {
      if (member?.info?.userId === this.service.client.id) {
        this.setServiceClientIsOnline({ service: this.service, isOnline: false })
      }
    },
    onNewChatItem(data) {
      if (data?.from_app) return

      this.addServiceChatItem({
        service: this.service,
        chatItem: {
          id: data.uid,
          uid: data.uid,
          type: parseInt(data.id_user) === this.user.id ? 'my-message' : 'their-message',
          value: data.message,
          time: dayjs(data.time).format('HH:mm'),
        },
      })

      const userIsOnThisChat =
        this.currentServiceId === this.service.id && this.currentServiceTab === 'chat'
      if (!userIsOnThisChat && this.playSoundOnNewChatItem) {
        this.chatMessageSound?.play()
      }
    },
  },
  mounted() {
    const channel = this.$pusher.subscribe(this.channelName)
    channel.bind(pusherSystemEvents.subscriptionSucceeded, this.onSubscriptionSucceeded)
    channel.bind(pusherSystemEvents.memberAdded, this.onMemberAdded)
    channel.bind(pusherSystemEvents.memberRemoved, this.onMemberRemoved)
    channel.bind(pusherEvents.newChatItem, this.onNewChatItem)
  },
  beforeUnmount() {
    if (this.$pusher) this.$pusher.unsubscribe(this.channelName)
  },
}
</script>

<style scoped lang="scss"></style>

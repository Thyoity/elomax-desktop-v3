<template>
  <div style="display: none;">
    <AppServiceRealtimeHelper v-for="eloBoost in eloBoosts" :key="eloBoost.id" :service="eloBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="duoBoost in duoBoosts" :key="duoBoost.id" :service="duoBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="winBoost in winBoosts" :key="winBoost.id" :service="winBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="placement in placements" :key="placement.id" :service="placement"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="mastery in masteries" :key="mastery.id" :service="mastery"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="maintenance in maintenances" :key="maintenance.id" :service="maintenance"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="coaching in coachings" :key="coaching.id" :service="coaching"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="replayAnalysis in replayAnalyses" :key="replayAnalysis.id" :service="replayAnalysis"></AppServiceRealtimeHelper>

    <AppServiceRealtimeHelper v-for="eloBoost in valorantEloBoosts" :key="eloBoost.id" :service="eloBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="duoBoost in valorantDuoBoosts" :key="duoBoost.id" :service="duoBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="winBoost in valorantWinBoosts" :key="winBoost.id" :service="winBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="placement in valorantPlacements" :key="placement.id" :service="placement"></AppServiceRealtimeHelper>

    <AppServiceRealtimeHelper v-for="eloBoost in wildRiftEloBoosts" :key="eloBoost.id" :service="eloBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="duoBoost in wildRiftDuoBoosts" :key="duoBoost.id" :service="duoBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="winBoost in wildRiftWinBoosts" :key="winBoost.id" :service="winBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="placement in wildRiftPlacements" :key="placement.id" :service="placement"></AppServiceRealtimeHelper>

    <AppServiceRealtimeHelper v-for="eloBoost in tftEloBoosts" :key="eloBoost.id" :service="eloBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="winBoost in tftWinBoosts" :key="winBoost.id" :service="winBoost"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="placement in tftPlacements" :key="placement.id" :service="placement"></AppServiceRealtimeHelper>
    <AppServiceRealtimeHelper v-for="pass in tftPasses" :key="pass.id" :service="pass"></AppServiceRealtimeHelper>

    <AppServiceRealtimeHelper v-if="tempService" :service="tempService"></AppServiceRealtimeHelper>
  </div>
</template>

<script>
import { mapState, mapMutations } from '@/stores/compat'
import AppServiceRealtimeHelperComponent from './ServiceRealtimeHelper.vue'
import { pusherChannel, pusherEvents } from '@/config/pusher-channels'

// Per-game settings used to alert the booster that a new service entered the
// queue and is up for grabs (like a ride-hail "new request" ping). Each game
// has its own sound/volume because boosters often play only one and want a
// distinctive cue for the ones they care about.
const NEW_SERVICE_ALERT_BY_GAME = {
  leagueOfLegends: { soundKey: 'leagueOfLegendsNotificationSound', volumeKey: 'leagueOfLegendsNotificationVolume' },
  valorant: { soundKey: 'valorantNotificationSound', volumeKey: 'valorantNotificationVolume' },
  wildRift: { soundKey: 'wildRiftNotificationSound', volumeKey: 'wildRiftNotificationVolume' },
  tft: { soundKey: 'tftNotificationSound', volumeKey: 'tftNotificationVolume' },
}

export default {
  components: {
    AppServiceRealtimeHelper: AppServiceRealtimeHelperComponent,
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('services', [
      'eloBoosts', 'winBoosts', 'duoBoosts', 'placements', 'masteries', 'maintenances', 'coachings', 'replayAnalyses',
      'valorantEloBoosts', 'valorantWinBoosts', 'valorantDuoBoosts', 'valorantPlacements',
      'wildRiftEloBoosts', 'wildRiftWinBoosts', 'wildRiftDuoBoosts', 'wildRiftPlacements',
      'tftEloBoosts', 'tftWinBoosts', 'tftPlacements', 'tftPasses',
      'tempService',
    ]),
    ...mapState('settings', [
      'playSoundOnNewNotification', 'playSoundOnNewChatItem',
      'leagueOfLegendsNotificationVolume', 'leagueOfLegendsNotificationSound',
      'valorantNotificationVolume', 'valorantNotificationSound',
      'wildRiftNotificationVolume', 'wildRiftNotificationSound',
      'tftNotificationVolume', 'tftNotificationSound',
    ]),
    ...mapState(['currentServiceId', 'currentServiceTab', 'serviceNotificationSound', 'serviceNotificationSounds', 'notificationSound', 'chatMessageSound']),
  },
  data() {
    return {
      userId: null,
      // Channels we subscribed in `mounted` — kept so `beforeUnmount` can
      // unsubscribe ALL of them (the legacy code only unsubscribed one and
      // leaked the rest).
      subscribedChannels: [],
    }
  },
  methods: {
    ...mapMutations('notifications', ['ADD_NOTIFICATION', 'REMOVE_SERVICE_NOTIFICATIONS']),
    ...mapMutations('auth', ['UPDATE_USER_CREDIT']),
    isCurrentUser(id) {
      return parseInt(id) === parseInt(this.user.id)
    },
    // Alerts the booster that a new service of `game` just entered the queue
    // and is up for grabs (rideshare-style "new request" ping): plays the
    // configured sound for that game and flashes the taskbar icon so the
    // alert is noticeable even when the app is in the background.
    alertNewServiceInQueue(game) {
      const cfg = NEW_SERVICE_ALERT_BY_GAME[game]
      if (!cfg) return
      const sound = this[cfg.soundKey]
      if (sound === 'disabled') return
      this.$bridge.send('elomax-notification')
      this.$bridge.send('show-new-service-notification', { game })
      this.serviceNotificationSounds[sound]?.volume(this[cfg.volumeKey]).play()
    },
  },
  mounted() {
    this.userId = this.user.id

    const privateUser = this.$pusher.subscribe(pusherChannel.privateUser(this.user.id))
    this.subscribedChannels.push(pusherChannel.privateUser(this.user.id))

    privateUser.bind(pusherEvents.newNotification, (data) => {
      const relatedServiceId = parseInt(data.id_related_service)
      const isOnOpenChat =
        this.currentServiceId === relatedServiceId && this.currentServiceTab === 'chat'
      if (isOnOpenChat) return

      this.ADD_NOTIFICATION({
        relatedServiceId,
        client: data.user,
        notification: data,
      })
      if (this.playSoundOnNewNotification) this.notificationSound.play()
    })

    privateUser.bind(pusherEvents.creditUpdate, (data) => {
      this.UPDATE_USER_CREDIT(data)
    })

    privateUser.bind(pusherEvents.readServiceNotifications, (data) => {
      this.REMOVE_SERVICE_NOTIFICATIONS(parseInt(data))
    })

    const servicesQueue = this.$pusher.subscribe(pusherChannel.servicesQueue)
    this.subscribedChannels.push(pusherChannel.servicesQueue)

    servicesQueue.bind(pusherEvents.servicesQueueUpdated, (data) => {
      const isQueueChange = data.status === 'in_queue' || data.initialStatus === 'in_queue'
      if (isQueueChange) {
        this.$bus.emit('reload-services-queue')
        const enteredQueue =
          data.status === 'in_queue' && data.initialStatus !== 'in_queue'
        if (enteredQueue) this.alertNewServiceInQueue(data.game)
      }

      const involvesMe =
        this.isCurrentUser(data?.initialBoosterId) ||
        this.isCurrentUser(data?.boosterId) ||
        this.isCurrentUser(data?.initialClientId) ||
        this.isCurrentUser(data?.clientId)
      if (involvesMe) this.$bus.emit('reload-in-progress-services')
    })

    servicesQueue.bind(pusherEvents.servicesQueueAccepted, (data) => {
      const involvesMe =
        this.isCurrentUser(data?.boosterId) || this.isCurrentUser(data?.clientId)
      this.$bus.emit(involvesMe ? 'reload-services' : 'reload-services-queue')
    })
  },
  beforeUnmount() {
    // Unsubscribe from ALL channels we opened. The legacy code only
    // unsubscribed `private-user-<id>` and leaked `services-queue`.
    if (this.$pusher) {
      for (const name of this.subscribedChannels) this.$pusher.unsubscribe(name)
    }
    this.subscribedChannels = []
  },
}
</script>

<style scoped lang="scss"></style>

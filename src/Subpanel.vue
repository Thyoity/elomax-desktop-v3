<template>
  <div class="subpanel">
    <div style="display: flex; flex-direction: row">
      <AppServicesRealtimeHelper v-if="isConnectedToPusher"></AppServicesRealtimeHelper>
      <span class="tag small" :class="{ active: notifications.length, inactive: !notifications.length }" style="font-size: 13px; margin-right: 7px;"><ion-icon name="notifications-outline"></ion-icon></span>
      <span class="tag small" style="font-size: 13px">{{ user.group }}</span>
    </div>
    <div
      style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
      "
    >
      <h1 style="margin-top: 0; text-align: left">{{ user.username }}</h1>

      <p v-if="isLoadingNotifications" style="text-align: left; margin: 0">
        Carregando notificações...
      </p>

      <p v-else-if="isError" style="text-align: left; margin: 0">
        Problema ao carregar as notificações,
        <a href="javascript: void(0)" @click="loadTransactions()" style="color: #fff">clique aqui</a>
        para tentar novamente...
      </p>

      <template v-else-if="notifications.length > 0">
        <div
          v-for="(notification, index) in groupedNotifications.slice(0, 6)"
          :key="index"
          class="notification"
          :class="{ read: false }"
          @click="openService(notification.serviceId)"
        >
          <div class="date-day">
            <ion-icon v-if="true" name="mail-outline"></ion-icon>
            <ion-icon v-else name="mail-open-outline"></ion-icon>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div v-if="true" class="not-read-circle animated fadeIn" style="margin-right: 7px; animation-delay: .3s;"></div>
              <h3 class="creation-date" v-if="notification.date">
                {{ notification.date.format("DD, MMM, YYYY - HH:mm") }}
              </h3>
            </div>
            <p class="description">{{ notification.description }}</p>
          </div>
        </div>
      </template>

      <p v-else style="text-align: left; margin: 0">
        Você não possui nenhuma notificação.
      </p>
    </div>
    <div>
      <div class="balance-container">
        <div>
          <small>Saldo atual</small>
          <span>R$ {{ parseFloat(user.credit).toFixed(2).replace(".", ",") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useServicesStore } from '@/stores/services'
import { useServicesQueueStore } from '@/stores/services-queue'
import { mapActions, mapState } from 'pinia'
import { soundUrl } from '@/config/assets'
import { API_BASE_URL, WEB_BASE_URL, PUSHER_KEY, PUSHER_CLUSTER } from '@/config/api'
import { pusherConnectionState } from '@/config/pusher-channels'
import axios from "axios"
import dayjs from "dayjs"
import { Howl } from 'howler'
import _ from 'lodash'
import AppServicesRealtimeHelperComponent from './components/ServicesRealtimeHelper/ServicesRealtimeHelper.vue'
export default {
  components: {
    'AppServicesRealtimeHelper': AppServicesRealtimeHelperComponent
  },
  data() {
    return {
      isConnectedToPusher: false,
      show: false,
      isLoadingTransactions: true,
      isError: false,
      transactions: [],
      howl: null
    };
  },
  computed: {
    ...mapState(useAuthStore, ["user", "token"]),
    ...mapState(useNotificationsStore, ["isLoadingNotifications", "loadingNotificationsText", "notifications"]),
    ...mapState(useAppStore, ["currentServiceId", "currentServiceTab"]),
    groupedNotifications(){
      const groupedNotifications = []
      _.forEach(this.notifications, (notification) => {
        const foundNotification = _.find(groupedNotifications, { serviceId: notification.relatedServiceId })
        if (!foundNotification) {
          groupedNotifications.push({
            serviceId: notification.relatedServiceId,
            date: notification.dateCreated,
            description: notification.description
          })
        } else {
          if (notification.dateCreated > foundNotification.date) {
            foundNotification.description = notification.description
            foundNotification.date = notification.dateCreated
          }
        }
      })
      return groupedNotifications
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['setUser']),
    ...mapActions(useServicesQueueStore, ['setIsLoadingServicesQueue', 'setLoadingServicesQueueText', 'setServicesQueue', 'setServicesQueueFetchServerTime']),
    ...mapActions(useServicesStore, ['setIsLoadingServices', 'setLoadingServicesText', 'setServices']),
    ...mapActions(useNotificationsStore, ['setIsLoadingNotifications', 'setLoadingNotificationsText', 'setNotifications']),
    ...mapActions(useAppStore, ['setCurrentService', 'setServiceNotificationSound', 'setServiceNotificationSounds', 'setChatMessageSound', 'setNotificationSound']),
    async loadTransactions() {
      this.isError = false;
      this.isLoadingTransactions = true;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/user/transactions`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.transactions = res.data.data.transactions.map((transaction) => {
          return {
            id: parseInt(transaction.id),
            gateway: transaction.gateway,
            status: transaction.status,
            amount: transaction.amount,
            description: transaction.description,
            dateCreated: dayjs(transaction.date_created),
          };
        });
        this.setUser(res.data.data.user)
      } catch (err) {
        this.isError = true;
      }
      this.isLoadingTransactions = false;
    },
    async loadServicesQueue(loadingText = 'Carregando serviços...') {
      this.setIsLoadingServicesQueue(true)
      this.setLoadingServicesQueueText(loadingText)
      try {
        const { data } = await axios.get(`${API_BASE_URL}/services/queue`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.setServicesQueue({
          queue: data.data.queue
        })
        this.setServicesQueueFetchServerTime(data.data.server_time)
      } catch (err) {
        console.log('erro', err)
      }
      this.setIsLoadingServicesQueue(false)
      this.setLoadingServicesQueueText('')
    },
    async loadServices(loadingText = 'Carregando serviços...') {
      this.setIsLoadingServices(true)
      this.setLoadingServicesText(loadingText)
      try {
        const { data } = await axios.get(`${API_BASE_URL}/services`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.setServices(data.data)
      } catch (err) {}
      this.setIsLoadingServices(false)
      this.setLoadingServicesText('')
    },
    async loadNotifications(loadingText = 'Carregando notificações...') {
      this.setIsLoadingNotifications(true)
      this.setLoadingNotificationsText(loadingText)
      try {
        const { data } = await axios.get(`${API_BASE_URL}/user/notifications`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.setNotifications(data.data)
      } catch (err) {}
      this.setIsLoadingNotifications(false)
      this.setLoadingNotificationsText('')
    },
    startPusher() {
      this.$pusher.initialize(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        authEndpoint: `${API_BASE_URL}/pusher/auth`,
        auth: {
          params: { userId: this.user.id },
        },
      })
      const pusher = this.$pusher.pusher
      if (!pusher) return

      pusher.connection.bind('state_change', (states) => {
        const becameUnavailable = states.current === pusherConnectionState.unavailable
        const reconnected =
          states.previous === pusherConnectionState.unavailable &&
          states.current === pusherConnectionState.connected
        const firstConnect =
          states.previous === pusherConnectionState.connecting &&
          states.current === pusherConnectionState.connected

        if (becameUnavailable) {
          this.isConnectedToPusher = false
          return
        }
        if (reconnected || firstConnect) {
          this.isConnectedToPusher = true
          this.loadNotifications()
          this.loadServicesQueue(
            reconnected ? 'Reconectado. Recarregando serviços...' : 'Carregando serviços...',
          )
          this.loadServices('Carregando serviços...')
        }
      })
    },
    openService (relatedServiceId) {
      if (this.currentServiceId === relatedServiceId && this.currentServiceTab !== 'chat') {
        
      } else if (this.currentServiceId) {
        this.$router.push('/services')
        setTimeout(() => {
          this.$router.push('/services/' + relatedServiceId)
        }, 0)
        
      } else {
        this.$router.push('/services/' + relatedServiceId)
      }
    },

    onReloadAllServices(){
      this.loadServicesQueue('Carregando serviços...')
      this.loadServices('Carregando serviços...')
    },
    onReloadServicesQueue(){
      this.loadServicesQueue('Recarregando serviços na fila...')
    },
    onReloadInProgressServices(){
      this.loadServices('Recarregando serviços em progresso...')
    }
  },
  mounted() {
    this.startPusher();
    this.setServiceNotificationSounds(
      {
        n1: new Howl({
          src: [
              soundUrl('service-notification')
          ]
        }),
        n2: new Howl({
          src: [
              soundUrl('service-notification-2')
          ]
        }),
        lol: new Howl({
          src: [
              soundUrl('lol')
          ]
        }),
        valorant: new Howl({
          src: [
              soundUrl('valorant')
          ]
        }),
        wr: new Howl({
          src: [
              soundUrl('wr')
          ]
        }),
        tft: new Howl({
          src: [
              soundUrl('tft')
          ]
        })
    })
    this.setServiceNotificationSound(new Howl({
        src: [
            soundUrl('service-notification')
        ]
    }))
    this.setChatMessageSound(new Howl({
        src: [
            soundUrl('chat-message')
        ]
    }))
    this.setNotificationSound(new Howl({
        src: [
            soundUrl('notification')
        ]
    }))
    this.$bus.on('reload-services', this.onReloadAllServices)
    this.$bus.on('reload-in-progress-services', this.onReloadInProgressServices)
    this.$bus.on('reload-services-queue', this.onReloadServicesQueue)
  },
  beforeUnmount() {
    this.$bus.off('reload-services', this.onReloadAllServices)
    this.$bus.off('reload-in-progress-services', this.onReloadInProgressServices)
    this.$bus.off('reload-services-queue', this.onReloadServicesQueue)
    this.$pusher.destroy()
  },
};
</script>

<style lang="scss">
.subpanel {
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 100%;
  padding: 50px 50px;
  flex-shrink: 0;
  h1 {
    margin-top: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 26px;
    font-weight: 800;
  }
  .notification {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
    position: relative;
    padding-right: 30px;
    cursor: pointer;

    .date-day {
      border-radius: 5px;
      color: rgb(133, 208, 255);
      font-weight: 900;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
      margin-right: 10px;
      transition: all .3s;
      font-size: 17px;
    }

    &:hover {
      .date-day {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    .creation-date {
      position: relative;
      font-size: 13px;
      margin: 0;
      margin-top: 6px;
      margin-bottom: 5px;
      color: #aaaaaa;
      font-weight: 700;
      transition: all 1s;
      transform: translateX(15px);
    }
    .not-read-circle {
      position: absolute;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: rgb(133, 208, 255);
    }
    p.description {
      color: rgb(133, 208, 255);
      font-size: 9px;
      line-height: 130%;
      text-align: left;
      margin: 0;
      font-weight: 300;
      letter-spacing: 0.5px;
    }
    &.read {
      .date-day {
        color: #666;
      }
      p.description {
        color: rgba(255, 255, 255, 0.3);
      }
      .creation-date {
        transform: translateX(0px);
      }
    }
  }
  
}
.balance-container {
  width: 100%;
  height: 70px;
  border: 1px solid rgb(133, 208, 255);
  box-shadow: inset 0 0 1px rgb(133, 208, 255), 0 0 3px rgb(133, 208, 255);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    small {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.3);
    }
    span {
      color: rgb(133, 208, 255);
      font-weight: 600;
      font-size: 19px;
    }
  }
}
</style>

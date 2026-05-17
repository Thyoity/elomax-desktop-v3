<template>
  <div class="chat--container">
    <OverlayScrollbar ref="scroll">
      <div class="conversation animated fadeIn">
        <div v-for="chatItem in service.chatItems" :key="chatItem.uid" :id="'chat-item-' + chatItem.uid" class="animated headShake" :class="{
          'my': chatItem.type === 'my-message',
          'their': chatItem.type === 'their-message',
          'date': chatItem.type === 'date',
        }">
          <p v-safe-html="chatItem.value"></p>
          <div v-if="chatItem.type !== 'date'" class="time">
            <small>{{ chatItem.time }}</small>
            <strong v-if="false && chatItem.type === 'my-message'" class="check">
              <!-- <ion-icon name="time-outline"></ion-icon> -->
              <ion-icon name="checkmark-done-outline"></ion-icon>
              <!-- <ion-icon name="checkmark-outline"></ion-icon> -->
            </strong>
          </div>
        </div>
      </div>
    </OverlayScrollbar>
    
    <div class="form animated fadeIn" style="animation-delay: .15s;">
      <div class="input-area">
        <textarea v-model="inputValue" @keydown.enter.exact.prevent @keyup.enter.exact="sendMessage()" placeholder="Digite sua mensagem aqui..."></textarea>
      </div>
      <div class="send-area">
        <a class="send-button" :class="{'active': isMessageSendable}" href="javascript:void(0)" @click="sendMessage()"><ion-icon name="send-outline"></ion-icon></a>
      </div>
    </div>
  </div>
</template>
<script>
import { API_BASE_URL, WEB_BASE_URL } from '@/config/api'
import { mapState, mapMutations } from '@/stores/compat'
import { useServicesStore } from '@/stores/services'
import axios from 'axios'
import dayjs from 'dayjs'
export default {
  props: ['service'],
  computed: {
    ...mapState ('auth', ['user', 'token']),
    ...mapState ('notifications', ['notifications']),
    isMessageSendable () {
      if (!this.inputValue || this.inputValue.length < 1) {
        return false
      }
      return true
    }
  },
  data () {
    return {
      inputValue: ''
    }
  },
  methods: {
    ...mapMutations('services', ['addServiceChatItem']),
    ...mapMutations ('notifications', ['addNotification','removeServiceNotifications']),
    generateUniqueId () {
      return '' + this.user.id + this.service.id + new Date().valueOf()
    },
    getViewport () {
      const instance = this.$refs.scroll?.osInstance?.()
      return instance?.elements()?.viewport ?? null
    },
    isScrolledAwayFromBottom () {
      const viewport = this.getViewport()
      if (!viewport) return false
      return viewport.scrollTop < viewport.scrollHeight - viewport.clientHeight - 100
    },
    scrollToChatItem (uid, smooth = true) {
      const target = document.getElementById('chat-item-' + uid)
      if (!target) return
      target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' })
    },
    async sendMessage () {
      if (!this.isMessageSendable) return
      const uniqueId = this.generateUniqueId()
      const message = this.inputValue
      this.inputValue = ''
      this.addServiceChatItem({
        service: this.service,
        chatItem: {
          id: uniqueId,
          uid: uniqueId,
          type: 'my-message',
          value: message,
          time: dayjs().format('HH:mm')
        }
      })
      await axios.post(`${API_BASE_URL}/services/${this.service.id}/chat-items`, {
        uid: uniqueId,
        message
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
    },
    async markServiceNotificationsAsRead () {
      let highestNotificationId = null
      this.notifications.forEach((notification) => {
        if (notification.relatedServiceId === this.service.id) {
          if (!highestNotificationId || highestNotificationId < notification.id) {
            highestNotificationId = notification.id
          }
        }
      })
      if (highestNotificationId) {
        const result = await axios.post(`${API_BASE_URL}/services/${this.service.id}/notifications/read-until/${highestNotificationId}`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      }
      this.removeServiceNotifications(this.service.id)
    }
  },
  mounted () {
    if (this.service.chatItems.length > 0) {
      this.scrollToChatItem(this.service.chatItems[this.service.chatItems.length - 1].uid, false)
    }
    const servicesStore = useServicesStore()
    this.unsubscribeFromStore = servicesStore.$onAction(({ name, args }) => {
      if (name !== 'addServiceChatItem') return
      const payload = args[0]
      if (payload?.service?.id !== this.service.id) return
      if (this.isScrolledAwayFromBottom()) return
      setTimeout(() => {
        this.scrollToChatItem(payload.chatItem.uid)
      }, 0)
    })
    this.markServiceNotificationsAsRead()
  },
  beforeUnmount() {
    this.unsubscribeFromStore?.()
  }
}
</script>
<style lang="scss" scoped>
  .chat--container {
    display: flex;
    flex-direction: column;
    height: 100%;
    .conversation {
      display: flex;
      flex-direction: column;
      width: 100%;
      flex-grow: 1;
      p {
        margin: 0;
        padding-bottom: 10px;
        padding-right: 30px;
        font-weight: 600;
        color: #333333;
        /* These are technically the same, but use both */
        overflow-wrap: break-word;
        word-wrap: break-word;

        -ms-word-break: break-all;
        /* This is the dangerous one in WebKit, as it breaks things wherever */
        word-break: break-all;
        /* Instead use this non-standard one: */
        word-break: break-word;

        /* Adds a hyphen where the word breaks, if supported (No Blink) */
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
      }
      div.time {
        position: absolute;
        right: 5px;
        bottom: 0px;
        color: rgba(0, 0, 0, .5);
        small {
          font-size: 8px;
          font-weight: bold;
          line-height: 100%;
        }
        strong.check {
          position: relative;
          top: 4px;
          font-size: 16px;
          margin-left: 4px;

          &.double {
            color: green;
          }
        }       
      }
      .date {
        padding: 5px 10px;
        background-color: rgba(255, 255, 255, .1);
        align-self: center;
        text-align: center;
        border-radius: 5px;
        margin: 20px 0;

        &:first-child {
          margin-top: 0;
        }

        p {
          padding: 0;
          color: #FFF;
          font-weight: 800;
          font-size: 13px;
        }
      }
      .their {
        position: relative;
        align-self: flex-start;
        margin-left: 30px;
        padding: 5px 10px;
        background-color: rgba(170,170,170);
        border-radius: 5px;
        margin-bottom: 10px;
        font-size: 13px;
        min-width: 150px;
        text-align: left;
        max-width: 45%;
      }
      .my {
        position: relative;
        align-self: flex-end;
        margin-right: 30px;
        padding: 5px 10px;
        background-color: #85d0ff;
        border-radius: 5px;
        margin-bottom: 10px;
        font-size: 13px;
        min-width: 100px;
        text-align: left;
        max-width: 45%;
      }
      .their:last-child, .my:last-child {
        margin-bottom: 40px;
      }
    }
    .form {
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 100px;  
      flex-shrink: 0;
      margin-top: 20px;
      margin-bottom: 35px;

      .input-area {
        padding-left: 20px;
        flex-grow: 1;

        textarea {
          background-color: rgba(0, 0, 0, .1);
          height: 100%!important;
          width: 100%!important;
          border: 0 none;
          outline: 0;
          resize: none;
          font-size: 14px;
          color: #FFF;
          padding: 20px;
        }
      }

      .send-area {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 30px;

        .send-button {
          color: rgb(170, 170, 170);
          display: flex;
          width: 50px;
          height: 50px;
          align-items: center;
          justify-content: center;
          background-color: rgba(102, 102, 102);
          border-radius: 50%;
          font-size: 24px;
          box-shadow: inset 0 0 1px rgba(102, 102, 102), 0 0 3px rgba(102, 102, 102);
          transition: .3s all;
          cursor: not-allowed;

          &.active {
            cursor: pointer;
            color: #FFF;
            background-color: #85d0ff;
            box-shadow: inset 0 0 3px rgb(133, 208, 255), 0 0 5px rgb(133, 208, 255);
            &:hover {
              box-shadow: inset 0 0 5px rgb(133, 208, 255), 0 0 7px rgb(133, 208, 255);
            }
          }
        }
      }
    }
  }
</style>
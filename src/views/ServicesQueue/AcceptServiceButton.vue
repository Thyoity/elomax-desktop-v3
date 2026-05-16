<template>
  <div class="services-queue__accept-service-button">
    <a href="javascript:void(0)" v-if="countdown && countdown > 0" class="locked">
      <ion-icon name="lock-closed-outline" style="margin-right: 3px;"></ion-icon>
      <span>{{ countdown.toFixed(1) }}s</span>
    </a>
    <a v-else href="javascript: void(0)" class="unlocked" @click="openAcceptModal">
      Aceitar serviço
    </a>
  </div>
</template>
<script>
import { useModal } from 'vue-final-modal'
import { mapState } from '@/stores/compat'
import AcceptServiceModal from '@/components/modals/AcceptServiceModal.vue'

export default {
  props: ['modalParams'],
  data(){
    return {
      interval: null,
      moment: false,
      countdown: null
    }
  },
  computed: {
    ...mapState('services-queue', ['fetchLocalTime', 'fetchServerTime'])
  },
  methods: {
    updateCountdown(){
      const now = this.$dayjs().add(this.$dayjs(this.fetchServerTime).diff(this.fetchLocalTime), 'milliseconds')
      return (Math.round((now.diff(this.$dayjs(this.modalParams.dateAcceptable, "DD/MM/YYYY HH:mm:ss")) / 1000) * 10) / 10) * -1
    },
    openAcceptModal() {
      // `serviceId` is the only prop the modal actually consumes; the rest of
      // `modalParams` (dateAcceptable etc.) is for this button's countdown.
      const modal = useModal({
        component: AcceptServiceModal,
        attrs: {
          serviceId: this.modalParams.serviceId,
          onAccepted: () => modal.close(),
          onCancel: () => modal.close(),
          onClosed: () => modal.destroy(),
        },
      })
      modal.open()
    }
  },
  mounted(){
    if (this.modalParams && this.modalParams.dateAcceptable) {
      this.countdown = this.updateCountdown()
      this.interval = setInterval(() => {
        this.countdown = this.updateCountdown()
      }, 100)
    }
  },
  beforeUnmount(){
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
}
</script>
<style lang="scss" scoped>
  .services-queue__accept-service-button {
    margin-top: 20px;
    display: flex;
    a {
      background: transparent;
      padding: 8px 12px;
      border: 1px solid #85d0ff;
      color: #85d0ff;
      border-radius: 5px;
      transition: .3s all;
      font-size: 13px;
      cursor: pointer;
      width: 120px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      &.unlocked:hover {
        box-shadow: inset 0 0 1px #85d0ff, 0 0 10px #85d0ff;
      }
      &.locked {
        color: #85d0ff;
        border: 1px solid #666;
        color: #666;
        cursor: not-allowed;
      }
    }
  }
</style>

<template>
  <VueFinalModal
    class="modal-overlay"
    content-class="modal-content"
    :click-to-close="!isAcceptingService"
    @closed="$emit('closed')"
  >
    <div class="accept-service">
      <h3 class="accept-service__title">Deseja realmente aceitar o serviço?</h3>
      <p class="accept-service__description">
        Após a confirmação, a *desistência* só poderá ser procedida por um moderador ou administrador,
        podendo acarretar em penalidades em sua conta da ELOMAX.
      </p>

      <div v-if="isFillingCaptcha" class="accept-service__captcha">
        <img v-if="captchaLink" class="accept-service__captcha-img" :src="captchaLink" />
        <span v-else>Carregando captcha...</span>
        <input
          v-if="captchaLink"
          v-model="captchaValue"
          type="text"
          class="accept-service__captcha-input"
          placeholder="Digite o captcha"
        />
        <div class="accept-service__options accept-service__options--inline">
          <a href="javascript:void(0)" class="accept-service__btn accept-service__btn--cancel" @click="$emit('cancel')">Cancelar</a>
          <a href="javascript:void(0)" class="accept-service__btn accept-service__btn--primary" @click="acceptService">Confirmar!</a>
        </div>
      </div>

      <div v-else-if="!isAcceptingService" class="accept-service__options">
        <a href="javascript:void(0)" class="accept-service__btn accept-service__btn--cancel" @click="$emit('cancel')">Cancelar</a>
        <a href="javascript:void(0)" class="accept-service__btn accept-service__btn--primary" @click="fillCaptcha">Sim, quero este serviço!</a>
      </div>

      <div v-else class="accept-service__options">
        <a href="javascript:void(0)" class="accept-service__btn accept-service__btn--primary">Aguarde...</a>
      </div>
    </div>
  </VueFinalModal>
</template>

<script>
import axios from 'axios'
import { VueFinalModal } from 'vue-final-modal'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL, captchaImageUrl } from '@/config/api'

export default {
  name: 'AcceptServiceModal',
  components: { VueFinalModal },
  props: {
    serviceId: { type: [Number, String], required: true },
  },
  // Semantic events for the caller to wire via useModal({ attrs: { onAccepted, onCancel, onClosed } }).
  // `accepted` fires after a successful captcha submission so the caller can close + refresh.
  emits: ['accepted', 'cancel', 'closed'],
  data() {
    return {
      isFillingCaptcha: false,
      isAcceptingService: false,
      captchaValue: '',
      captchaLink: null,
    }
  },
  computed: {
    ...mapState(useAuthStore, ['token']),
  },
  methods: {
    async fillCaptcha() {
      try {
        this.isFillingCaptcha = true
        this.captchaLink = null
        this.captchaValue = ''
        const result = await axios.get(
          `${API_BASE_URL}/services/queue/service-captcha/${this.serviceId}`,
          { headers: { Authorization: `Bearer ${this.token}` } },
        )
        this.isAcceptingService = false
        if (result.data.success) {
          this.captchaLink = captchaImageUrl(result.data.data)
        }
        this.handleCaptchaErrorCode(result.data.code)
      } catch (err) {
        this.handleRequestError(err)
      }
    },
    async acceptService() {
      if (!this.captchaValue || this.captchaValue.length !== 5) {
        return this.$toast.error('Captcha inválido.', 'Ops', { position: 'topCenter' })
      }
      this.isAcceptingService = true
      try {
        const result = await axios.post(
          `${API_BASE_URL}/services/queue/accept-service/${this.serviceId}`,
          { ch_value: this.captchaValue },
          { headers: { Authorization: `Bearer ${this.token}` } },
        )
        this.isAcceptingService = false
        if (result.data.success) {
          this.$bus.emit('reload-services')
          this.$bus.emit('reload-services-queue')
          this.$emit('accepted')
          return this.$toast.success('Serviço aceito!', 'Sucesso', { position: 'topCenter' })
        }
        this.handleAcceptErrorCode(result.data.code)
      } catch (err) {
        this.handleRequestError(err)
        this.$emit('cancel')
        this.isAcceptingService = false
      }
    },
    handleCaptchaErrorCode(code) {
      const messages = {
        ERROR_INVALID_USER_TYPE: 'Para aceitar este serviço, você deve ser um booster ou administrador.',
        ERROR_INVALID_USER_STATUS: 'Você não possui permissão para aceitar este serviço.',
        ERROR_UNAVAILABLE_SERVICE: 'Serviço inválido, ou já aceito por outro booster.',
        ERROR_UNAVAILABLE_SLOT: 'Você não possui espaço para aceitar este serviço.',
        ERROR_CLIENT_IS_SAME_AS_BOOSTER: 'O booster não pode ser o mesmo que o cliente.',
      }
      if (messages[code]) {
        this.$toast.error(messages[code], 'Ops', { position: 'topCenter' })
      }
    },
    handleAcceptErrorCode(code) {
      const messages = {
        ERROR_INVALID_USER_TYPE: 'Para aceitar este serviço, você deve ser um booster ou administrador.',
        ERROR_INVALID_USER_STATUS: 'Você não possui permissão para aceitar este serviço.',
        ERROR_UNAVAILABLE_SERVICE: 'Serviço inválido, ou já aceito por outro booster.',
        ERROR_INVALID_CHALLENGE: 'O captcha foi digitado incorretamente.',
        ERROR_UNAVAILABLE_SLOT: 'Você não possui espaço para aceitar este serviço.',
        ERROR_CLIENT_IS_SAME_AS_BOOSTER: 'O booster não pode ser o mesmo que o cliente.',
      }
      if (messages[code]) {
        this.$toast.error(messages[code], 'Ops', { position: 'topCenter' })
      }
    },
    handleRequestError(err) {
      if (err?.response?.data?.code === 'STILL_NOT_ACCEPTABLE_ERROR') {
        this.$toast.error('O serviço ainda não está disponível para aceitar.', 'Ops', { position: 'topCenter' })
        return
      }
      this.$toast.error('Erro desconhecido.', `Ops: ${err?.message ?? ''}`, { position: 'topCenter' })
    },
  },
}
</script>

<style lang="scss" scoped>
.accept-service {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px 50px;

  &__title {
    color: rgb(18, 18, 25);
    font-size: 24px;
    margin: 40px 0 30px;
    text-align: center;
  }

  &__description {
    margin: 0 30px 40px;
    text-align: center;
  }

  &__captcha {
    display: flex;
    flex-direction: column;
    align-items: center;

    &-img {
      border-radius: 8px;
    }

    &-input {
      background-color: transparent;
      outline: 0;
      border: 0;
      border-bottom: 2px solid #333;
      padding: 10px 0;
      color: #333;
      width: 180px;
      font-size: 16px;
      font-weight: bold;
      margin-top: 10px;
      text-align: center;
    }
  }

  &__options {
    display: flex;
    flex-direction: row;

    &--inline {
      margin-top: 24px;
    }
  }

  &__btn {
    padding: 9px 16px;
    margin: 0 6px;
    border-radius: 6px;
    background-color: #121219;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    font-weight: 500;
    user-select: none;
    transition: background-color .18s ease, transform .12s ease, box-shadow .18s ease;

    &:hover {
      background-color: #2a2a35;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    &:active {
      background-color: #0a0a10;
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    &:focus-visible {
      outline: 2px solid #85d0ff;
      outline-offset: 2px;
    }

    &--cancel {
      background-color: #fff;
      color: #121219;
      border: 1px solid #121219;

      &:hover {
        background-color: #f0f0f5;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &:active {
        background-color: #e0e0e8;
      }
    }
  }
}
</style>

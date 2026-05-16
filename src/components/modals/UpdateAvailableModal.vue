<template>
  <VueFinalModal
    class="modal-overlay"
    content-class="modal-content modal-content--update"
    :click-to-close="false"
    :esc-to-close="false"
    @closed="$emit('closed')"
  >
    <div class="update-available">
      <div class="update-available__badge">
        <ion-icon name="cloud-download-outline" />
      </div>

      <h3 class="update-available__title">Atualização disponível</h3>

      <p class="update-available__description">
        Uma nova versão do ELOMAX está pronta para ser baixada.
        <strong v-if="version" class="update-available__version">v{{ version }}</strong>
      </p>

      <div class="update-available__options">
        <a href="javascript:void(0)" class="update-available__btn update-available__btn--cancel" @click="$emit('cancel')">Mais tarde</a>
        <a href="javascript:void(0)" class="update-available__btn update-available__btn--primary" @click="$emit('confirm')">Atualizar agora</a>
      </div>
    </div>
  </VueFinalModal>
</template>

<script>
import { VueFinalModal } from 'vue-final-modal'

export default {
  name: 'UpdateAvailableModal',
  components: { VueFinalModal },
  props: {
    version: { type: String, default: null },
  },
  // `confirm` → user wants to download; `cancel` → snooze (re-prompt later).
  // `closed` fires after the close animation so the caller can `destroy()`.
  emits: ['confirm', 'cancel', 'closed'],
}
</script>

<style lang="scss" scoped>
.update-available {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px;

  &__badge {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(133, 208, 255, 0.12);
    color: #2880c9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 32px 0 18px;
  }

  &__title {
    color: rgb(18, 18, 25);
    font-size: 22px;
    margin: 0 0 12px;
    text-align: center;
  }

  &__description {
    margin: 0 12px 24px;
    text-align: center;
    color: #444;
    line-height: 1.5;
  }

  &__version {
    display: inline-block;
    margin-left: 4px;
    color: #2880c9;
    font-weight: 600;
  }

  &__options {
    display: flex;
    flex-direction: row;
  }

  &__btn {
    padding: 9px 18px;
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

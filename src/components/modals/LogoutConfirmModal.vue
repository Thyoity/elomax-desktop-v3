<template>
  <VueFinalModal
    class="modal-overlay"
    content-class="modal-content modal-content--logout"
    @closed="$emit('closed')"
  >
    <div class="logout-confirm">
      <h3 class="logout-confirm__title">Deseja realmente sair?</h3>
      <p class="logout-confirm__description">
        Você precisará fazer login novamente para voltar a usar o app.
      </p>

      <div class="logout-confirm__options">
        <a href="javascript:void(0)" class="logout-confirm__btn logout-confirm__btn--cancel" @click="$emit('cancel')">Cancelar</a>
        <a href="javascript:void(0)" class="logout-confirm__btn logout-confirm__btn--primary" @click="$emit('confirm')">Sim, sair</a>
      </div>
    </div>
  </VueFinalModal>
</template>

<script>
import { VueFinalModal } from 'vue-final-modal'

export default {
  name: 'LogoutConfirmModal',
  components: { VueFinalModal },
  // Semantic events the caller wires via `useModal({ attrs: { onConfirm, onCancel, onClosed } })`.
  // `closed` fires after the close animation — the right time for the caller to call `destroy()`.
  emits: ['confirm', 'cancel', 'closed'],
}
</script>

<style lang="scss" scoped>
.logout-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px 40px;

  &__title {
    color: rgb(18, 18, 25);
    font-size: 22px;
    margin: 36px 0 20px;
    text-align: center;
  }

  &__description {
    margin: 0 20px 30px;
    text-align: center;
    color: #444;
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

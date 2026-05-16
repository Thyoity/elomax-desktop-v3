<template>
  <VueFinalModal
    class="modal-overlay"
    content-class="modal-content modal-content--extras"
    @closed="$emit('closed')"
  >
    <div class="champions">
      <h3 class="champions__title">{{ extraTitle }}</h3>
      <p class="champions__description">{{ extraDescription }}</p>
      <OverlayScrollbar class="champions__scroll">
        <ul v-if="champions && champions.length" class="champions__list">
          <li v-for="championId in champions" :key="championId" class="champions__item">
            <img :src="championImageUrl(championId)" />
          </li>
        </ul>
      </OverlayScrollbar>
      <div class="champions__options">
        <a href="javascript:void(0)" class="champions__btn" @click="$emit('close')">Fechar</a>
      </div>
    </div>
  </VueFinalModal>
</template>

<script>
import { VueFinalModal } from 'vue-final-modal'
import { championImageUrl } from '@/config/api'

export default {
  name: 'ExtraChampionsModal',
  components: { VueFinalModal },
  props: {
    extraTitle: { type: String, default: '' },
    extraDescription: { type: String, default: '' },
    champions: { type: Array, default: () => [] },
  },
  emits: ['close', 'closed'],
  methods: {
    championImageUrl,
  },
}
</script>

<style lang="scss" scoped>
.champions {
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
    margin-bottom: 40px;
    text-align: center;
  }

  &__scroll {
    width: 100%;
    max-height: 150px;
    overflow: hidden;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  &__item {
    list-style: none;
    width: 45px;
    height: 45px;
    margin: 3px;

    img {
      width: 45px;
      height: 45px;
    }
  }

  &__options {
    display: flex;
    flex-direction: row;
    margin-top: 40px;
  }

  &__btn {
    padding: 9px 18px;
    border-radius: 6px;
    background-color: #fff;
    color: #121219;
    border: 1px solid #121219;
    text-decoration: none;
    cursor: pointer;
    font-weight: 500;
    user-select: none;
    transition: background-color .18s ease, transform .12s ease, box-shadow .18s ease;

    &:hover {
      background-color: #f0f0f5;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    &:active {
      background-color: #e0e0e8;
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    }

    &:focus-visible {
      outline: 2px solid #85d0ff;
      outline-offset: 2px;
    }
  }
}
</style>

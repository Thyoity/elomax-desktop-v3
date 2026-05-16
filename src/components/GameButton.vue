<template>
  <div
    v-if="svg"
    class="game-button"
    :class="[`game-button--${game}`, { 'game-button--active': active }]"
    @click="$emit('click', $event)"
  >
    <svg
      class="game-button__svg"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="svg.viewBox"
      v-bind="svg.svgAttrs"
    >
      <path v-for="(d, i) in svg.paths" :key="i" :d="d" />
    </svg>
  </div>
</template>

<script>
import { GAME_SVGS } from '@/config/game-svgs'

export default {
  name: 'GameButton',
  props: {
    game: {
      type: String,
      required: true,
      validator: (v) => Object.prototype.hasOwnProperty.call(GAME_SVGS, v),
    },
    active: { type: Boolean, default: false },
  },
  emits: ['click'],
  computed: {
    svg() {
      return GAME_SVGS[this.game] ?? null
    },
  },
}
</script>

<style lang="scss" scoped>
.game-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-top: -12px;
  margin-bottom: 0;
  cursor: pointer;
  transition: all 0.3s;

  &__svg {
    fill: #3e6082;
    transition: all 0.3s;
  }

  &:hover .game-button__svg,
  &--active .game-button__svg {
    fill: #85d0ff;
  }

  &--lol .game-button__svg {
    width: 26px;
    height: 26px;
    position: relative;
    top: 2px;
  }
  &--wild-rift .game-button__svg {
    width: 30px;
    height: 30px;
  }
  &--valorant .game-button__svg {
    width: 28px;
    height: 28px;
    position: relative;
    top: 2px;
  }
  &--tft .game-button__svg {
    width: 32px;
    height: 32px;
  }
}
</style>

<template>
  <div v-if="svg" class="game-icon" :class="`game-icon--${game}`">
    <svg
      class="game-icon__svg"
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
  name: 'GameIcon',
  props: {
    game: {
      type: String,
      required: true,
      validator: (v) => Object.prototype.hasOwnProperty.call(GAME_SVGS, v),
    },
  },
  computed: {
    svg() {
      return GAME_SVGS[this.game] ?? null
    },
  },
}
</script>

<style lang="scss" scoped>
.game-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  margin-bottom: 0;

  &__svg {
    fill: #fff;
  }

  // Per-game offset and inner SVG size adjustments.
  &--lol {
    margin-top: -7px;
    .game-icon__svg {
      width: 30px;
      height: 30px;
      position: relative;
      top: 2px;
    }
  }
  &--valorant {
    margin-top: -5px;
    .game-icon__svg {
      width: 28px;
      height: 28px;
      position: relative;
      top: 2px;
    }
  }
  &--wild-rift {
    margin-top: -5px;
    .game-icon__svg {
      width: 35px;
      height: 35px;
    }
  }
  &--tft {
    margin-top: -1px;
    .game-icon__svg {
      width: 35px;
      height: 35px;
    }
  }
}
</style>

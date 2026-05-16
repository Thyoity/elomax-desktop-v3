<template>
  <div
    v-if="config"
    class="extra-icon"
    :class="{ 'extra-icon--clickable': hasModal }"
    v-tippy="tippyOptions"
    :content="tooltip"
    @click="onClick($event)"
  >
    <img class="extra-icon__img" :src="iconSrc" :alt="tooltip" />
  </div>
</template>

<script>
import { useModal } from 'vue-final-modal'
import { EXTRAS_CONFIG, resolveExtraIcon, resolveExtraTooltip } from '@/config/extras'
import { suppressTippy } from '@/plugins/tippy-helpers'

export default {
  name: 'ExtraIcon',
  props: {
    type: { type: String, required: true },
    value: { default: null },
  },
  data() {
    return {
      tippyOptions: { placement: 'top', arrow: true },
    }
  },
  computed: {
    config() {
      const cfg = EXTRAS_CONFIG[this.type]
      if (!cfg && import.meta.env.DEV) {
        console.warn(`[ExtraIcon] unknown extra type: ${this.type}`)
      }
      return cfg ?? null
    },
    iconSrc() {
      return this.config ? resolveExtraIcon(this.config, this.value) : ''
    },
    tooltip() {
      return this.config ? resolveExtraTooltip(this.config, this.value) : ''
    },
    hasModal() {
      return Boolean(this.config?.modal)
    },
  },
  methods: {
    onClick(event) {
      const modalSpec = this.config?.modal
      if (!modalSpec) return
      const restoreTippy = suppressTippy(event?.currentTarget)
      const modal = useModal({
        component: modalSpec.component,
        attrs: {
          extraTitle: modalSpec.title,
          extraDescription: modalSpec.description,
          [modalSpec.paramKey]: this.value,
          onClose: () => modal.close(),
          onClosed: () => {
            modal.destroy()
            restoreTippy()
          },
        },
      })
      modal.open()
    },
  },
}
</script>

<style lang="scss" scoped>
.extra-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &--clickable {
    cursor: pointer;
  }

  &__img {
    display: block;
  }
}
</style>

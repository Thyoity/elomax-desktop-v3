<template>
  <div
    class="extra--super-restriction"
    v-tippy="{ placement: 'top', arrow: true }"
    :content="'Super restrição'"
    @click="openSuperRestrictionModal"
  >
    <img :src="icon" />
  </div>
</template>

<script>
import { useModal } from 'vue-final-modal'
// Super restriction reuses the champions modal — it's a stricter variant of
// the champion-list restriction, so the visualization is identical.
import ExtraChampionsModal from '@/components/modals/ExtraChampionsModal.vue'
import icon from '@/assets/extras/super-restriction.png'

export default {
  name: 'AppExtraSuperRestriction',
  props: ['value'],
  data() {
    return { icon }
  },
  methods: {
    openSuperRestrictionModal() {
      const modal = useModal({
        component: ExtraChampionsModal,
        attrs: {
          extraTitle: 'Extra: Super restrição',
          extraDescription: 'O cliente pagou por uma super restrição de campeões.',
          champions: this.value,
          onClose: () => modal.close(),
          onClosed: () => modal.destroy(),
        },
      })
      modal.open()
    },
  },
}
</script>

<style scoped lang="scss">
  .extra--super-restriction {
    cursor: pointer;
  }
</style>

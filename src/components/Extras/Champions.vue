<template>
  <div
    class="extra--champions"
    v-tippy="{ placement: 'top', arrow: true }"
    content="Campeões"
    @click="openChampionsModal"
  >
    <img :src="icon" />
  </div>
</template>

<script>
import { useModal } from 'vue-final-modal'
import ExtraChampionsModal from '@/components/modals/ExtraChampionsModal.vue'
import icon from '@/assets/extras/champions.png'

export default {
  name: 'AppExtraChampions',
  props: ['value'],
  data() {
    return { icon }
  },
  methods: {
    openChampionsModal() {
      const modal = useModal({
        component: ExtraChampionsModal,
        attrs: {
          extraTitle: 'Extra: Campeões específicos',
          extraDescription: 'O cliente pagou pela restrição de campeões.',
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
  .extra--champions {
    cursor: pointer;
  }
</style>

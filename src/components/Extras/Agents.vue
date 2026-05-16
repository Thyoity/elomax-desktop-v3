<template>
  <div
    class="extra--agents"
    v-tippy="{ placement: 'top', arrow: true }"
    content="Agentes"
    @click="openAgentsModal"
  >
    <img :src="icon" />
  </div>
</template>

<script>
import { useModal } from 'vue-final-modal'
import ExtraAgentsModal from '@/components/modals/ExtraAgentsModal.vue'
// Legacy reused the champions icon for the agents extra — keeping the same
// asset mapping so visuals stay consistent if this component is reactivated.
import icon from '@/assets/extras/champions.png'

export default {
  name: 'AppExtraAgents',
  props: ['value'],
  data() {
    return { icon }
  },
  methods: {
    openAgentsModal() {
      const modal = useModal({
        component: ExtraAgentsModal,
        attrs: {
          extraTitle: 'Extra: Agentes específicos',
          extraDescription: 'O cliente pagou pela restrição de agentes.',
          agents: this.value,
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
  .extra--agents {
    cursor: pointer;
  }
</style>

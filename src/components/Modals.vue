<template>
  <!--
    Render target for every modal opened via `useModal()` from vue-final-modal.
    Mount this once near the root of the logged-in app shell so the modals'
    teleport target exists before any caller invokes `useModal().open()`.
  -->
  <ModalsContainer />
</template>

<script>
import { ModalsContainer } from 'vue-final-modal'

export default {
  name: 'AppModals',
  components: { ModalsContainer },
}
</script>

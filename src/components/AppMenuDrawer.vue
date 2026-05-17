<template>
  <div class="menu-drawer">
    <Transition name="drawer-backdrop">
      <div
        v-if="isOpen"
        class="menu-drawer__backdrop"
        @click="close"
      />
    </Transition>
    <Transition name="drawer-panel">
      <aside
        v-if="isOpen"
        class="menu-drawer__panel"
        @click.stop
      >
        <OverlayScrollbar class="menu-drawer__scroll" defer>
          <!-- Cross-fade between menus while the panel stays mounted. -->
          <Transition name="content-swap" mode="out-in">
            <div :key="openDropdownMenu" class="menu-drawer__body">
              <component :is="contentComponent" v-if="contentComponent" />
            </div>
          </Transition>
        </OverlayScrollbar>
      </aside>
    </Transition>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { mapActions, mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import ServicesQueueMenuContent from './ServicesQueueDropdown.vue'
import MyServicesMenuContent from './MyServicesDropdown.vue'

const CONTENT_REGISTRY = {
  'services-queue': markRaw(ServicesQueueMenuContent),
  'my-services': markRaw(MyServicesMenuContent),
}

export default {
  name: 'AppMenuDrawer',
  computed: {
    ...mapState(useAppStore, ['openDropdownMenu']),
    isOpen() {
      return Boolean(this.openDropdownMenu)
    },
    contentComponent() {
      return CONTENT_REGISTRY[this.openDropdownMenu] ?? null
    },
  },
  watch: {
    '$route.fullPath'() {
      this.close()
    },
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    ...mapActions(useAppStore, ['setOpenDropdownMenu']),
    close() {
      if (this.isOpen) this.setOpenDropdownMenu(null)
    },
    onKeydown(event) {
      if (event.key === 'Escape' && this.isOpen) this.close()
    },
  },
}
</script>

<style lang="scss" scoped>
$drawer-width: 320px;
$panel-bg: rgba(18, 18, 25, 0.96);
$backdrop-bg: rgba(8, 8, 12, 0.55);

// Drawer container: lives inline inside .main-app-area, anchored just to the
// right of the left nav so its slide-in/out animation never visually overlaps it.
// overflow:hidden clips the panel during the leave animation.
.menu-drawer {
  position: absolute;
  top: 0;
  left: 70px;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
}

.menu-drawer__backdrop {
  position: absolute;
  inset: 0;
  background-color: $backdrop-bg;
  backdrop-filter: blur(2px);
  pointer-events: auto;
}

.menu-drawer__panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: $drawer-width;
  background-color: $panel-bg;
  display: flex;
  flex-direction: column;
  color: #fff;
  box-shadow: 8px 0 24px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.menu-drawer__scroll {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  // OverlayScrollbars manages the actual scrolling — host clips overflow so
  // the synthetic scrollbar takes over.
  overflow: hidden;
}

.menu-drawer__body {
  padding: 60px 24px 24px;
}

// Backdrop fade.
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.22s ease;
}
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

// Drawer slide-in with spring-like overshoot easing.
.drawer-panel-enter-active {
  transition: transform 0.36s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.drawer-panel-leave-active {
  transition: transform 0.22s cubic-bezier(0.4, 0, 1, 1);
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(-100%);
}

// Cross-fade when switching active menu while the panel remains open.
.content-swap-enter-active,
.content-swap-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.content-swap-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.content-swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<template>
  <a
    class="menu-trigger"
    :class="{ 'menu-trigger--active': active, 'menu-trigger--open': isOpen }"
    href="javascript:void(0)"
    v-tippy="tooltip ? { placement: 'right', arrow: true } : { trigger: 'manual' }"
    :content="tooltip || null"
    @click="toggle"
  >
    <div class="menu-trigger__active-bar" />
    <ion-icon :name="icon" />
    <!-- Submenu affordance: small chevron on the right edge. Flips horizontally
         while the drawer is open so the user has a quick visual cue that the
         click will collapse the drawer rather than expand it. -->
    <ion-icon class="menu-trigger__caret" name="chevron-forward-outline" />
  </a>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
export default {
  name: 'AppMenuTrigger',
  props: {
    /** Identifier matched against the global `openDropdownMenu` state. */
    name: { type: String, required: true },
    /** Ionicon name displayed on the button. */
    icon: { type: String, required: true },
    /** Whether the trigger should render in its "current page" highlighted state. */
    active: { type: Boolean, default: false },
    /** Optional tooltip label shown on hover (right-side, matching nav links). */
    tooltip: { type: String, default: '' },
  },
  computed: {
    ...mapState(useAppStore, ['openDropdownMenu']),
    isOpen() {
      return this.openDropdownMenu === this.name
    },
  },
  methods: {
    ...mapActions(useAppStore, ['setOpenDropdownMenu']),
    toggle() {
      this.setOpenDropdownMenu(this.isOpen ? null : this.name)
    },
  },
}
</script>

<style lang="scss" scoped>
$accent: rgb(133, 208, 255);

.menu-trigger {
  color: #444444;
  font-size: 21px;
  transition: color 0.3s ease;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  text-decoration: none;

  &__active-bar {
    position: absolute;
    left: -5px;
    top: 0;
    bottom: 0;
    width: 5px;
    background-color: $accent;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    transition: transform 0.3s ease, opacity 0.3s ease;
    opacity: 0;
  }

  &__caret {
    position: absolute;
    right: 6px;
    top: 50%;
    font-size: 11px;
    opacity: 0.55;
    color: inherit;
    transform: translateY(-50%);
    transition: transform 0.3s ease, opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    color: #999999;
  }

  // Compound `&.menu-trigger--X` selectors below bump specificity to 3 classes
  // so they outrank the unscoped `.left-bar .main-nav a` rule from App.vue.

  // Active bar + accent color show when one of the submenu's routes is the
  // current page. `!important` is used because App.vue's unscoped
  // `.left-bar .main-nav a` rule otherwise wins the cascade.
  &.menu-trigger--active {
    color: $accent !important;

    .menu-trigger__active-bar {
      transform: translateX(5px) !important;
      opacity: 1 !important;
    }
  }

  // While the drawer is open AND we're NOT on one of its routes, the trigger
  // renders in the neutral hover state. If we're already on a route from this
  // submenu, the `--active` state wins so the user keeps the visual anchor
  // (accent bar + accent color) even with the drawer open.
  // `!important` is used because App.vue's unscoped `.left-bar .main-nav a`
  // rule has higher specificity than this scoped compound class.
  &.menu-trigger--open:not(.menu-trigger--active) {
    color: #999999 !important;

    .menu-trigger__active-bar {
      transform: none !important;
      opacity: 0 !important;
    }
  }

  // When the drawer is open the caret flips to point back at the bar,
  // signaling that the next click will collapse the drawer.
  &.menu-trigger--open .menu-trigger__caret {
    transform: translateY(-50%) rotate(180deg);
    opacity: 0.85;
  }

  &:hover .menu-trigger__caret {
    opacity: 0.9;
  }
}
</style>

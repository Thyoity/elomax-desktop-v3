import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Rubik font — only the weights the design system uses.
import '@fontsource/rubik/400.css'
import '@fontsource/rubik/500.css'
import '@fontsource/rubik/600.css'
import '@fontsource/rubik/700.css'

import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
// Tippy bundles only the `fade` animation in `tippy.css`. The bouncy
// physics-feel ("inertia") effect comes from `animation: 'shift-away'` +
// `inertia: true` — but `shift-away` needs its own CSS or it silently
// degrades to fade.
import 'tippy.js/animations/shift-away.css'

import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

import VueCountdown from '@chenfengyuan/vue-countdown'

import { createVfm } from 'vue-final-modal'
import 'vue-final-modal/style.css'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import 'overlayscrollbars/overlayscrollbars.css'

import App from './App.vue'
import router from './router'

import BridgePlugin from './plugins/bridge-plugin'
import PusherPlugin from './plugins/pusher'
import ToastPlugin from './plugins/toast'
import DayjsPlugin from './plugins/dayjs'
import SafeHtmlPlugin from './plugins/safe-html'
import EventBusPlugin from './plugins/event-bus'

import GameIcon from '@/components/GameIcon.vue'
import GameButton from '@/components/GameButton.vue'
import ExtraIcon from '@/components/ExtraIcon.vue'

// Helper that wraps GameIcon/GameButton with a fixed `game` prop so existing
// templates that still use the legacy `<AppLeagueOfLegendsIcon />` keep
// working until they're migrated to `<GameIcon game="lol" />`.
const fixedGameComponent = (base: any, game: string) => ({
  name: `${base.name}_${game}`,
  components: { Base: base },
  template: `<base game="${game}" v-bind="$attrs" @click="$emit('click', $event)" />`,
  emits: ['click'],
})

import './assets/styles/default.scss'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(createVfm())

app.use(VueTippy, {
  defaultProps: {
    inertia: true,
    animation: 'shift-away',
  },
  directive: 'tippy',
  component: 'tippy',
})

app.use(BridgePlugin)
app.use(PusherPlugin)
app.use(ToastPlugin)
app.use(DayjsPlugin)
app.use(SafeHtmlPlugin)
app.use(EventBusPlugin)

app.component('VMultiselect', Multiselect)
app.component('VCountdown', VueCountdown)
app.component('AppToggleButton', defineToggleButton())

// New consolidated components.
app.component('GameIcon', GameIcon)
app.component('GameButton', GameButton)
app.component('AppExtra', ExtraIcon)
app.component('OverlayScrollbar', OverlayScrollbarsComponent)

// Legacy aliases: keep old `<app-*-icon />` and `<app-*-button />` tags working
// while bulk-copied views are gradually migrated to the new tags.
app.component('AppLeagueOfLegendsIcon', fixedGameComponent(GameIcon, 'lol'))
app.component('AppValorantIcon', fixedGameComponent(GameIcon, 'valorant'))
app.component('AppWildRiftIcon', fixedGameComponent(GameIcon, 'wild-rift'))
app.component('AppTftIcon', fixedGameComponent(GameIcon, 'tft'))
app.component('AppLeagueOfLegendsButton', fixedGameComponent(GameButton, 'lol'))
app.component('AppWildRiftButton', fixedGameComponent(GameButton, 'wild-rift'))

app.mount('#app')

function defineToggleButton() {
  return {
    name: 'AppToggleButton',
    props: {
      // Legacy `:value` API (Vue 2-era vue-js-toggle-button).
      value: { type: Boolean, default: undefined },
      // Modern `v-model` API.
      modelValue: { type: Boolean, default: undefined },
      color: { type: [String, Object], default: '#3498db' },
      width: { type: Number, default: 50 },
      height: { type: Number, default: 22 },
    },
    emits: ['change', 'input', 'update:modelValue'],
    template: `
      <label class="vue-js-switch" :style="containerStyle" @click.stop="toggle">
        <span class="v-switch-core" :style="coreStyle">
          <span class="v-switch-button" :style="buttonStyle"></span>
        </span>
      </label>
    `,
    computed: {
      // Fully controlled: the parent's prop is the single source of truth.
      isOn(this: any): boolean {
        if (this.modelValue !== undefined) return this.modelValue
        if (this.value !== undefined) return this.value
        return false
      },
      containerStyle(this: any) {
        return {
          width: this.width + 'px',
          height: this.height + 'px',
          display: 'inline-block',
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0,
        }
      },
      coreStyle(this: any) {
        const bg = typeof this.color === 'string' ? this.color : (this.isOn ? this.color.checked : this.color.unchecked)
        return {
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: this.height / 2 + 'px',
          backgroundColor: this.isOn ? bg : (typeof this.color === 'object' ? this.color.unchecked : '#cccccc'),
          transition: 'background-color 0.2s',
          position: 'relative',
        }
      },
      buttonStyle(this: any) {
        const size = this.height - 4
        const translate = this.isOn ? this.width - size - 4 : 0
        return {
          display: 'block',
          width: size + 'px',
          height: size + 'px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '2px',
          left: '2px',
          transition: 'transform 0.2s',
          transform: `translateX(${translate}px)`,
        }
      },
    },
    methods: {
      toggle(this: any) {
        const next = !this.isOn
        // Controlled component: just notify the parent. Parent must update the
        // bound prop for the toggle to visually flip.
        this.$emit('change', { value: next })
        this.$emit('input', next)
        this.$emit('update:modelValue', next)
      },
    },
  }
}

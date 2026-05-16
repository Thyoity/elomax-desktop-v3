<template>
  <div id="app">
    <div class="draggable-container">
      <div class="draggable-area"></div>
    </div>
    <div class="radial-background"></div>
    <div class="particles-background">
      <div v-for="i in 200" :key="i" class="circle-container">
        <div class="circle"></div>
      </div>
    </div>

    <a
      class="app-logo"
      v-tippy="{ placement: 'right', arrow: true }"
      :content="'v' + appVersion"
    >
      <img class="app-logo__img" src="./assets/logo-small.png" />
    </a>

    <div class="app-container">
      <div
        v-if="isCheckingForUpdates || hasNewRelease || isUpdateReadyToInstall || (updateDownloadStatus.transferred !== updateDownloadStatus.total)"
        class="updates-app-area"
      >
        <AppUpdates />
      </div>
      <div v-else-if="!user" class="login-app-area">
        <AppLogin />
      </div>
      <div v-else class="main-app-area">
        <AppModals />
        <AppMenuDrawer />
        <div class="left-bar">
          <div class="main-nav">
            <router-link to="/" v-tippy="{ placement: 'right', arrow: true }" content="Início" @click="closeDropdownMenu">
              <div class="active-bar"></div>
              <ion-icon name="grid-outline" />
            </router-link>
            <AppMenuTrigger name="services-queue" icon="albums-outline" :active="isServicesQueueActive" tooltip="Fila de serviços" />
            <AppMenuTrigger name="my-services" icon="briefcase" :active="isMyServicesActive" tooltip="Meus serviços" />
          </div>
          <div class="nav-spacer"></div>
          <div class="bottom-nav">
            <a
              href="javascript:void(0)"
              v-tippy="{ placement: 'right', arrow: true }"
              content="Sistema online"
              @click.prevent="openExternalSite(); closeDropdownMenu()"
            >
              <div class="active-bar"></div>
              <ion-icon name="open-outline" />
            </a>
            <router-link to="/settings" v-tippy="{ placement: 'right', arrow: true }" content="Configurações" @click="closeDropdownMenu">
              <ion-icon name="settings-outline" />
            </router-link>
            <a
              href="javascript:void(0)"
              v-tippy="{ placement: 'right', arrow: true }"
              content="Sair"
              @click="onLogoutButtonClick($event); closeDropdownMenu()"
            >
              <ion-icon name="power-outline" />
            </a>
          </div>
        </div>
        <AppSubpanel v-if="user" />
        <div class="right-bar">
          <div class="main-panel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL, WEB_BASE_URL } from '@/config/api'
import _ from 'lodash'
import axios from 'axios'
import { useModal } from 'vue-final-modal'
import { mapState, mapMutations } from '@/stores/compat'
import LoLAccountDTO from '@/dtos/lol-account'
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal.vue'
import { suppressTippy } from '@/plugins/tippy-helpers'

export default {
  name: 'App',
  data() {
    return {
      isLoLConnected: false,
      lolConnectionInterval: null,
      // Polls the updater every 10 minutes while the app is open so users
      // who keep the window running for days/weeks still get forced onto
      // newer versions. The check fires the same `ready-for-update-check`
      // bridge channel the startup boot uses — `AppUpdates` then takes
      // over the whole UI as soon as `isCheckingForUpdates` flips true.
      updateCheckInterval: null,
    }
  },
  computed: {
    ...mapState(['appVersion', 'isCheckingForUpdates', 'hasNewRelease', 'updateDownloadStatus', 'isUpdateReadyToInstall']),
    ...mapState('auth', ['token', 'user']),
    ...mapState('settings', ['lolPath', 'lolAutoQueue']),
    ...mapState('lol', ['isLoLAuthenticated', 'summonerName']),
    isServicesQueueActive() {
      return this.$route.path.includes('/services-queue/') || this.$route.path === '/services-queue'
    },
    isMyServicesActive() {
      return this.$route.path.includes('/services/') || this.$route.path === '/services'
    },
  },
  methods: {
    ...mapMutations(['SET_UPDATE_DOWNLOAD_STATUS', 'SET_IS_CHECKING_FOR_UPDATES', 'SET_HAS_NEW_RELEASE', 'SET_UPDATE_READY_TO_INSTALL', 'SET_OPEN_DROPDOWN_MENU']),
    ...mapMutations('lol', ['SET_CONNECTION_DATA', 'SET_IS_LOL_AUTHENTICATED', 'SET_SUMMONER_NAME', 'SET_IMPORTED_DATA']),
    ...mapMutations('auth', ['LOGOUT']),
    ...mapMutations('services', ['RESET_SERVICES_MODULE']),
    ...mapMutations('services-queue', ['RESET_SERVICES_QUEUE_MODULE']),
    ...mapMutations('notifications', ['RESET_NOTIFICATIONS_MODULE']),
    openExternalSite() {
      this.$bridge.send('new-window', `${WEB_BASE_URL}/v2/br`)
    },
    onLoLConnect(_event, result) {
      // DEBUG: temporary log to inspect the LCU payload during the migration.
      console.log('[lol-connect]', JSON.parse(JSON.stringify(result)))
      // Riot ID rollout: new accounts return an empty `displayName` and use
      // `gameName` (+ `tagLine`) instead. Accept either so older and newer
      // accounts both authenticate.
      const summoner = result?.data
      const summonerName = summoner?.gameName || summoner?.displayName
      if (result?.success && summonerName) {
        this.SET_CONNECTION_DATA(result.connectionData)
        this.SET_IS_LOL_AUTHENTICATED(true)
        this.SET_SUMMONER_NAME(summonerName)
      } else {
        this.SET_CONNECTION_DATA(null)
        this.SET_IS_LOL_AUTHENTICATED(false)
        this.SET_SUMMONER_NAME(null)
      }
    },
    onLoLReadyCheck() {
      if (this.lolAutoQueue) {
        this.$bridge.send('lol-accept-ready-check')
      }
    },
    onLoLAccountData(_event, result) {
      if (!this.isLoLAuthenticated) return
      const summoner = result[0]
      const finalResult = {
        level: summoner.summonerLevel,
        summoner: summoner.displayName,
      }
      try {
        _.forEach(result[1], (iteration, index) => {
          if (index === 0) {
            const r = LoLAccountDTO.in(finalResult.summoner, iteration.queues)
            axios.post(
              `${API_BASE_URL}/lol/match-logs`,
              { action: 'event', data: r },
              { headers: { Authorization: `Bearer ${this.token}` } },
            )
          }
        })
        this.SET_IMPORTED_DATA(finalResult)
      } catch {
        this.SET_IMPORTED_DATA(null)
      }
    },
    onCheckingForUpdate() {
      this.SET_IS_CHECKING_FOR_UPDATES(true)
    },
    onUpdateAvailable() {
      this.SET_IS_CHECKING_FOR_UPDATES(false)
      this.SET_HAS_NEW_RELEASE(true)
    },
    onUpdateNotAvailable() {
      this.SET_IS_CHECKING_FOR_UPDATES(false)
      this.SET_HAS_NEW_RELEASE(false)
    },
    onUpdateDownloadProgress(_event, data) {
      this.SET_IS_CHECKING_FOR_UPDATES(false)
      this.SET_UPDATE_DOWNLOAD_STATUS(data)
      this.SET_HAS_NEW_RELEASE(false)
    },
    onUpdateDownloaded() {
      this.SET_IS_CHECKING_FOR_UPDATES(false)
      this.SET_HAS_NEW_RELEASE(false)
      this.SET_UPDATE_READY_TO_INSTALL()
    },
    onDevModeSignal() {
      this.SET_IS_CHECKING_FOR_UPDATES(false)
      this.SET_HAS_NEW_RELEASE(false)
    },
    // Closes the side drawer. Wired on every non-trigger top-level nav link
    // so navigating away (e.g., Início → Configurações) dismisses the drawer
    // even when the click is on the same route the user is already on (the
    // route watcher in AppMenuDrawer doesn't fire in that case).
    closeDropdownMenu() {
      this.SET_OPEN_DROPDOWN_MENU(null)
    },
    onLogoutButtonClick(event) {
      // Confirmation gate — clicking the logout icon by mistake forces a
      // re-login, so show a modal first and only reset state if confirmed.
      // `destroy()` on `closed` keeps repeated logout clicks from piling up
      // detached modal instances in vue-final-modal's internal registry.
      const restoreTippy = suppressTippy(event?.currentTarget)
      const modal = useModal({
        component: LogoutConfirmModal,
        attrs: {
          onConfirm: () => {
            this.RESET_SERVICES_MODULE()
            this.RESET_SERVICES_QUEUE_MODULE()
            this.RESET_NOTIFICATIONS_MODULE()
            this.LOGOUT()
            modal.close()
          },
          onCancel: () => modal.close(),
          onClosed: () => {
            modal.destroy()
            restoreTippy()
          },
        },
      })
      modal.open()
    },
  },
  mounted() {
    // Event-driven LCU sync: a Rust-side filesystem watcher (see
    // `lcu::start_lockfile_watcher` in src-tauri/src/lcu.rs) reacts to the
    // lockfile appearing or disappearing in real time, so we don't poll
    // every few seconds. This 30s heartbeat is a defensive safety net for
    // two cases the watcher can't cover by itself:
    //   1. Users with a custom `lolPath` — the watcher only follows the
    //      default install dir, so we still need an occasional connect()
    //      attempt with the user's path.
    //   2. The native fs-events APIs occasionally drop events (rare, but
    //      possible on rapid create/delete bursts). The heartbeat guarantees
    //      the app heals within ~30s even if that happens.
    if (!this.lolConnectionInterval) {
      this.lolConnectionInterval = setInterval(() => {
        if (!this.isLoLAuthenticated) this.$bridge.send('lol-connect', this.lolPath)
      }, 30000)
    }
    this.$bridge.send('ready-for-update-check')
    // Re-check every 10 minutes. The guard skips ticks where a check is
    // already in flight or an update is already pending — otherwise rapid
    // ticks could stack download requests on top of each other.
    if (!this.updateCheckInterval) {
      this.updateCheckInterval = setInterval(() => {
        if (this.isCheckingForUpdates || this.hasNewRelease || this.isUpdateReadyToInstall) return
        this.$bridge.send('ready-for-update-check')
      }, 10 * 60 * 1000)
    }
    this.$bridge.on('lol-connect', this.onLoLConnect)
    this.$bridge.on('lol-ready-check', this.onLoLReadyCheck)
    this.$bridge.on('lol-account-data', this.onLoLAccountData)
    this.$bridge.on('checking-for-update', this.onCheckingForUpdate)
    this.$bridge.on('update-available', this.onUpdateAvailable)
    this.$bridge.on('update-not-available', this.onUpdateNotAvailable)
    this.$bridge.on('update-download-progress', this.onUpdateDownloadProgress)
    this.$bridge.on('update-downloaded', this.onUpdateDownloaded)
    this.$bridge.on('dev-mode-signal', this.onDevModeSignal)
  },
  unmounted() {
    this.$bridge.removeListener('lol-connect', this.onLoLConnect)
    this.$bridge.removeListener('lol-ready-check', this.onLoLReadyCheck)
    this.$bridge.removeListener('lol-account-data', this.onLoLAccountData)
    this.$bridge.removeListener('checking-for-update', this.onCheckingForUpdate)
    this.$bridge.removeListener('update-available', this.onUpdateAvailable)
    this.$bridge.removeListener('update-not-available', this.onUpdateNotAvailable)
    this.$bridge.removeListener('update-download-progress', this.onUpdateDownloadProgress)
    this.$bridge.removeListener('update-downloaded', this.onUpdateDownloaded)
    this.$bridge.removeListener('dev-mode-signal', this.onDevModeSignal)
    if (this.lolConnectionInterval) clearInterval(this.lolConnectionInterval)
    if (this.updateCheckInterval) clearInterval(this.updateCheckInterval)
  },
}
</script>

<style lang="scss">
@use 'sass:math';

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #3e6082;
  overflow: hidden;
  position: absolute;
  inset: 0;
}

.draggable-container {
  position: absolute;
  pointer-events: none;
  width: 100%;
  height: 100px;
  z-index: 9;
  background: linear-gradient(180deg, rgba(18, 18, 25, 0.7) 0%, rgba(18, 18, 25, 0) 100%);

  .draggable-area {
    -webkit-app-region: drag;
    width: 100%;
    height: 50px;
  }
}

.radial-background {
  position: absolute;
  top: -150%;
  width: 250%;
  height: 250%;
  background: radial-gradient(circle, rgba(58, 57, 75, 1) 0%, rgba(22, 21, 30, 1) 80%);
  z-index: 1;
}

.particles-background {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
  z-index: 2;
  mask-image: radial-gradient(white 0%, white 30%, transparent 80%, transparent);
}

.app-logo {
  position: absolute;
  z-index: 10;
  top: 20px;
  left: 15px;

  &__img {
    width: 40px;
    height: 40px;
  }
}

.circle-container {
  $particle-num: 200;

  position: absolute;
  transform: translateY(-10vh);
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  .circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    mix-blend-mode: screen;
    background-image: radial-gradient(hsl(202, 100%, 76%), hsl(202, 100%, 76%) 10%, hsla(202, 100%, 76%, 0) 56%);
    animation: fade-frames 200ms infinite, scale-frames 5s infinite;
  }

  @keyframes fade-frames {
    0% { opacity: 0.5; }
    50% { opacity: 0.2; }
    100% { opacity: 0.5; }
  }
  @keyframes scale-frames {
    0% { transform: scale3d(0.3, 0.3, 1); }
    50% { transform: scale3d(0.5, 0.5, 1); }
    100% { transform: scale3d(0.3, 0.3, 1); }
  }

  $particle-base-size: 8;
  @for $i from 1 through $particle-num {
    &:nth-child(#{$i}) {
      $circle-size: math.random($particle-base-size);
      width: $circle-size + px;
      height: $circle-size + px;
      $start-position-y: math.random(10) + 100;
      $frames-name: "move-frames-" + $i;
      $move-duration: 100000 + math.random(9000) + ms;
      animation-name: #{$frames-name};
      animation-duration: $move-duration;
      animation-delay: math.random(109000) + ms;

      @keyframes #{$frames-name} {
        from { transform: translate3d(#{math.random(100) + vw}, #{$start-position-y + vh}, 0); }
        to { transform: translate3d(#{math.random(100) + vw}, #{- $start-position-y - math.random(30) + vh}, 0); }
      }
      .circle { animation-delay: math.random(4000) + ms; }
    }
  }
}

.app-container {
  position: absolute;
  inset: 0;
  z-index: 5;

  .login-app-area,
  .updates-app-area {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .main-app-area {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: row;

    .left-bar {
      width: 70px;
      background-color: rgba(18, 18, 25, 0.7);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .main-nav,
      .bottom-nav {
        display: flex;
        flex-direction: column;

        a {
          color: #444444;
          font-size: 21px;
          transition: 1s all;
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          .active-bar {
            position: absolute;
            left: -5px;
            top: 0;
            bottom: 0;
            width: 5px;
            background-color: rgb(133, 208, 255);
            border-top-right-radius: 3px;
            border-bottom-right-radius: 3px;
            transition: 1s all;
            opacity: 0;
          }
        }
        a:hover { color: #999999; }
        a.router-link-exact-active,
        a.router-link-exact-active:hover {
          color: rgb(133, 208, 255);
          .active-bar { transform: translateX(5px); opacity: 1; }
        }
        a:first-child { margin-top: 115px; }
      }

      .nav-spacer { flex-grow: 1; }

      .bottom-nav {
        flex-shrink: 0;
        margin-bottom: 20px;
        a:first-child { margin-top: 0; }
      }
    }

    .right-bar {
      display: flex;
      flex-direction: row;
      flex-grow: 1;
      height: 100%;

      .main-panel {
        width: 100%;
        height: 100%;
        padding-top: 50px;
      }
    }
  }
}
</style>

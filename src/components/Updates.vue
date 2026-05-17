<template>
  <div class="updates">
    <div class="updates__card">
      <div class="updates__logo-wrap">
        <img class="updates__logo" src="@/assets/elomax-icon.png" alt="ELOMAX" />
      </div>

      <Transition name="fade-swap" mode="out-in">
        <!-- 1. Verificando -->
        <div v-if="state === 'checking'" key="checking" class="updates__panel">
          <div class="updates__spinner" />
          <h2 class="updates__title">Verificando atualizações</h2>
          <p class="updates__hint">Estamos conferindo se há uma versão mais nova.</p>
        </div>

        <!-- 2. Baixando (com barra de progresso) -->
        <div v-else-if="state === 'downloading'" key="downloading" class="updates__panel">
          <h2 class="updates__title">Baixando atualização</h2>
          <p v-if="updateVersion" class="updates__version">Versão {{ updateVersion }}</p>
          <div class="updates__progress">
            <div class="updates__progress-track">
              <div
                class="updates__progress-fill"
                :class="{ 'updates__progress-fill--indeterminate': !hasKnownTotal }"
                :style="hasKnownTotal ? { width: downloadProgressPercent + '%' } : null"
              />
            </div>
            <div class="updates__progress-meta">
              <span v-if="hasKnownTotal">{{ downloadProgressPercent.toFixed(0) }}%</span>
              <span v-else>Iniciando…</span>
              <span v-if="hasKnownTotal" class="updates__progress-bytes">
                {{ formatBytes(updateDownloadStatus.transferred) }} / {{ formatBytes(updateDownloadStatus.total) }}
              </span>
            </div>
          </div>
          <p class="updates__hint">Mantenha o app aberto. Vai ser rápido.</p>
        </div>

        <!-- 3. Pronto pra instalar -->
        <div v-else-if="state === 'ready'" key="ready" class="updates__panel">
          <h2 class="updates__title">Atualização pronta</h2>
          <p v-if="updateVersion" class="updates__hint">v{{ appVersion }} &gt; v{{ updateVersion }}</p>
          <button class="updates__button" type="button" @click="onInstallUpdate">
            Instalar agora
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from '@/stores/compat'

export default {
  name: 'AppUpdates',
  data() {
    return {
      updateVersion: null,
    }
  },
  computed: {
    ...mapState([
      'appVersion',
      'isCheckingForUpdates',
      'hasNewRelease',
      'isUpdateReadyToInstall',
      'updateDownloadStatus',
    ]),
    /**
     * Single-string state simplifies the template (single <Transition>) and
     * makes intent explicit instead of having to mentally OR a bunch of
     * booleans together.
     */
    state() {
      if (this.isUpdateReadyToInstall) return 'ready'
      if (this.hasNewRelease || this.downloadProgressPercent > 0) return 'downloading'
      return 'checking'
    },
    hasKnownTotal() {
      return (this.updateDownloadStatus?.total ?? 0) > 0
    },
    downloadProgressPercent() {
      const total = this.updateDownloadStatus?.total || 0
      const transferred = this.updateDownloadStatus?.transferred || 0
      if (!total) return 0
      return Math.min(100, (transferred / total) * 100)
    },
  },
  methods: {
    ...mapMutations(['setIsCheckingForUpdates', 'setHasNewRelease']),
    onInstallUpdate() {
      // Bridge handler triggers `relaunch()` on the Tauri side. After that
      // returns, the app process is replaced so we don't need to do anything
      // else in this component.
      this.$bridge.send('install-update')
    },
    onUpdateAvailable(_event, payload) {
      this.updateVersion = payload?.version ?? null
    },
    formatBytes(bytes) {
      if (!bytes || bytes < 1024) return `${bytes ?? 0} B`
      const kb = bytes / 1024
      if (kb < 1024) return `${kb.toFixed(1)} KB`
      return `${(kb / 1024).toFixed(1)} MB`
    },
  },
  mounted() {
    // App.vue handles the actual updater state transitions via the bridge —
    // we just listen here to capture the new version string for display.
    this.$bridge.on('update-available', this.onUpdateAvailable)
  },
  beforeUnmount() {
    this.$bridge.removeListener('update-available', this.onUpdateAvailable)
  },
}
</script>

<style lang="scss" scoped>
@use 'sass:color';

$accent: #85d0ff;

.updates {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  color: #fff;
  padding: 24px;

  &__card {
    width: 100%;
    max-width: 420px;
    padding: 36px 32px 32px;
    background: rgba(22, 21, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
  }

  &__logo-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(133, 208, 255, 0.18);
  }

  &__logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: center;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    letter-spacing: 0.2px;
  }

  &__version {
    margin: -4px 0 4px;
    font-size: 13px;
    color: $accent;
    font-weight: 500;
  }

  &__hint {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    line-height: 1.5;
  }

  &__spinner {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid rgba(133, 208, 255, 0.15);
    border-top-color: $accent;
    animation: updates-spin 0.9s linear infinite;
    margin-bottom: 4px;
  }

  &__check {
    font-size: 56px;
    color: $accent;
    line-height: 1;
    margin-bottom: -4px;
    filter: drop-shadow(0 4px 12px rgba(133, 208, 255, 0.4));
    ion-icon {
      animation: updates-pop 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
    }
  }

  &__progress {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 4px 0 4px;
  }

  &__progress-track {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6cc3ff 0%, $accent 100%);
    border-radius: 999px;
    transition: width 0.18s ease;
    box-shadow: 0 0 12px rgba(133, 208, 255, 0.4);

    &--indeterminate {
      width: 40%;
      animation: updates-indeterminate 1.4s ease-in-out infinite;
    }
  }

  &__progress-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    font-variant-numeric: tabular-nums;
  }

  &__progress-bytes {
    opacity: 0.8;
  }

  &__button {
    margin-top: 12px;
    padding: 11px 22px;
    background: $accent;
    color: #0a0a10;
    border: 0;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;

    &:hover {
      background: color.adjust($accent, $lightness: 5%);
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(133, 208, 255, 0.35);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(133, 208, 255, 0.25);
    }
  }
}

// Cross-fade between updater states (checking → downloading → ready).
.fade-swap-enter-active,
.fade-swap-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-swap-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes updates-spin {
  to { transform: rotate(360deg); }
}

@keyframes updates-pop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes updates-indeterminate {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(40%); }
  100% { transform: translateX(250%); }
}
</style>

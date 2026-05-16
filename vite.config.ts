import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// Read package.json at config time so the in-app version display tracks
// whatever `npm run release` last bumped. Exposed to the renderer as the
// `__APP_VERSION__` define below.
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))

// Maps legacy `App*`-prefixed component names to the actual filenames where
// the filename doesn't carry the prefix. Lets templates keep using `<AppLogin />`
// without forcing a rename of `Login.vue`.
const LEGACY_NAME_MAP: Record<string, string> = {
  AppLogin: '/src/components/Login.vue',
  AppLoading: '/src/components/Loading.vue',
  AppMiniLoading: '/src/components/MiniLoading.vue',
  AppModals: '/src/components/Modals.vue',
  AppUpdates: '/src/components/Updates.vue',
  AppSubpanel: '/src/Subpanel.vue',
  AppExtra: '/src/components/ExtraIcon.vue',
  AppServicesRealtimeHelper:
    '/src/components/ServicesRealtimeHelper/ServicesRealtimeHelper.vue',
  AppServiceRealtimeHelper:
    '/src/components/ServicesRealtimeHelper/ServiceRealtimeHelper.vue',
  AppAcceptServiceButton: '/src/views/ServicesQueue/AcceptServiceButton.vue',
}

const host = process.env.TAURI_DEV_HOST

export default defineConfig(async () => ({
  plugins: [
    vue({
      template: {
        // Treat <ion-icon ...> (Ionicons web component) as a native custom element so Vue
        // doesn't try to resolve it as a Vue component during template compilation.
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ion-'),
        },
      },
    }),
    // Auto-import every .vue file from the explicit folders below as a global
    // component (by filename). Views are routed and don't need auto-import;
    // the legacy orphan folders (Extras/GameIcons/Buttons) are excluded so
    // their duplicate filenames don't conflict.
    Components({
      // `deep: false` keeps each entry to its direct children only — exactly
      // what we want, otherwise the legacy subfolders inside src/components
      // (Extras / GameIcons / Buttons) would be picked up too.
      dirs: [
        'src/components',
        'src/components/modals',
        'src/components/ServicesRealtimeHelper',
      ],
      extensions: ['vue'],
      deep: false,
      dts: 'src/components.d.ts',
      resolvers: [
        (name) => {
          if (LEGACY_NAME_MAP[name]) return LEGACY_NAME_MAP[name]
          return undefined
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Bulk-copied legacy components still import from 'lodash'; alias to lodash-es for tree-shaking.
      lodash: 'lodash-es',
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
  },
  // Build-time constant injected into the renderer. Used by stores/app.ts
  // so the version shown in the UI always matches package.json (which the
  // release script keeps in sync with tauri.conf.json + Cargo.toml).
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
}))

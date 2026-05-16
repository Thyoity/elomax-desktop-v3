/// <reference types="vite/client" />

// IMPORTANT: this file MUST stay a module (have at least one top-level
// import/export) so the `declare module 'vue'` block below is treated as a
// MODULE AUGMENTATION instead of a wholesale replacement. The empty
// `export {}` at the bottom is what guarantees that. Without it, this file
// is a script and the `declare module 'vue'` shadows Vue's real types,
// breaking imports like `App`, `Component`, `Directive`, `createApp`.
export {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $bridge: import('./plugins/bridge').BridgeAPI extends never ? never : import('./plugins/bridge').default extends never ? never : any
    $electron: { ipcRenderer: { send: (channel: string, arg?: any) => void; on: (channel: string, handler: any) => void; removeListener: (channel: string, handler: any) => void } }
    $pusher: import('./plugins/pusher').PusherClient
    $toast: {
      show: (message: string, title?: string, options?: any) => void
      info: (message: string, title?: string, options?: any) => void
      success: (message: string, title?: string, options?: any) => void
      warning: (message: string, title?: string, options?: any) => void
      error: (message: string, title?: string, options?: any) => void
    }
    $dayjs: typeof import('dayjs').default
    $bus: {
      on: (event: string, handler: (...args: any[]) => void) => void
      off: (event: string, handler: (...args: any[]) => void) => void
      emit: (event: string, ...args: any[]) => void
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WEB_BASE_URL?: string
  readonly VITE_PUSHER_KEY?: string
  readonly VITE_PUSHER_CLUSTER?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}


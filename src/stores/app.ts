import { defineStore } from 'pinia'

interface State {
  appVersion: string
  isAuthenticated: boolean
  summonerName: string | null
  importedData: any
  updateDownloadStatus: {
    progress: any
    bytesPerSecond: number
    percent: number
    transferred: number
    total: number
  }
  isCheckingForUpdates: boolean
  hasNewRelease: boolean
  isUpdateReadyToInstall: boolean
  currentServiceId: any
  currentServiceTab: any
  openDropdownMenu: any
  dropdownMenuIndex: number
  serviceNotificationSound: any
  serviceNotificationSounds: { n1: any; n2: any }
  chatMessageSound: any
  notificationSound: any
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    // Injected by vite.config.ts at build time from package.json's `version`,
    // so the value here always tracks whatever `npm run release` bumped to.
    appVersion: __APP_VERSION__,
    isAuthenticated: false,
    summonerName: null,
    importedData: null,
    updateDownloadStatus: {
      progress: null,
      bytesPerSecond: 0,
      percent: 0,
      transferred: 0,
      total: 0,
    },
    // Auto-update is currently disabled in v4; default to "not checking" so the UI bypasses the updates screen.
    isCheckingForUpdates: false,
    hasNewRelease: false,
    isUpdateReadyToInstall: false,
    currentServiceId: null,
    currentServiceTab: null,
    openDropdownMenu: null,
    dropdownMenuIndex: 50,
    serviceNotificationSound: null,
    serviceNotificationSounds: { n1: null, n2: null },
    chatMessageSound: null,
    notificationSound: null,
  }),
  actions: {
    setIsAuthenticated(value: boolean) {
      this.isAuthenticated = value
    },
    setSummonerName(value: string | null) {
      this.summonerName = value
    },
    setImportedData(data: any) {
      this.importedData = data
    },
    SET_IS_CHECKING_FOR_UPDATES(value: boolean) {
      this.isCheckingForUpdates = value
    },
    SET_HAS_NEW_RELEASE(value: boolean) {
      this.hasNewRelease = value
    },
    SET_UPDATE_DOWNLOAD_STATUS(value: State['updateDownloadStatus']) {
      this.updateDownloadStatus = value
    },
    SET_UPDATE_READY_TO_INSTALL() {
      this.isUpdateReadyToInstall = true
    },
    SET_CURRENT_SERVICE({ serviceId, tab }: { serviceId: any; tab: any }) {
      this.currentServiceId = serviceId
      this.currentServiceTab = tab
    },
    SET_OPEN_DROPDOWN_MENU(name: any) {
      this.openDropdownMenu = name
    },
    INCREMENT_DROPDOWN_MENU_INDEX() {
      this.dropdownMenuIndex += 1
    },
    SET_SERVICE_NOTIFICATION_SOUND(i: any) {
      this.serviceNotificationSound = i
    },
    SET_SERVICE_NOTIFICATION_SOUNDS(obj: { n1: any; n2: any }) {
      this.serviceNotificationSounds = obj
    },
    SET_CHAT_MESSAGE_SOUND(i: any) {
      this.chatMessageSound = i
    },
    SET_NOTIFICATION_SOUND(i: any) {
      this.notificationSound = i
    },
  },
})

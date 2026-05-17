import { defineStore } from 'pinia'

interface State {
  notifyNewServiceInQueue: boolean
  notifyNewWildRiftServiceInQueue: boolean
  leagueOfLegendsNotificationVolume: number
  leagueOfLegendsNotificationSound: string
  valorantNotificationVolume: number
  valorantNotificationSound: string
  wildRiftNotificationVolume: number
  wildRiftNotificationSound: string
  tftNotificationVolume: number
  tftNotificationSound: string
  playSoundOnNewNotification: boolean
  playSoundOnNewChatItem: boolean
  lolAutoQueue: boolean
  lolPath: string | null
  defaultGame: string
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({
    notifyNewServiceInQueue: true,
    notifyNewWildRiftServiceInQueue: true,
    leagueOfLegendsNotificationVolume: 0.5,
    leagueOfLegendsNotificationSound: 'lol',
    valorantNotificationVolume: 0.5,
    valorantNotificationSound: 'valorant',
    wildRiftNotificationVolume: 0.5,
    wildRiftNotificationSound: 'wr',
    tftNotificationVolume: 0.5,
    tftNotificationSound: 'tft',
    playSoundOnNewNotification: true,
    playSoundOnNewChatItem: true,
    lolAutoQueue: false,
    lolPath: null,
    defaultGame: 'leagueOfLegends',
  }),
  actions: {
    setLolPath(lolPath: string | null) {
      this.lolPath = lolPath
    },
    setNotifyNewServiceInQueue(value = true) {
      this.notifyNewServiceInQueue = value
    },
    setPlaySoundOnNewChatItem(value = true) {
      this.playSoundOnNewChatItem = value
    },
    setPlaySoundOnNewNotification(value = true) {
      this.playSoundOnNewNotification = value
    },
    setLeagueOfLegendsNotification({ sound, volume }: { sound: string; volume: number }) {
      this.leagueOfLegendsNotificationVolume = volume
      this.leagueOfLegendsNotificationSound = sound
    },
    setValorantNotification({ sound, volume }: { sound: string; volume: number }) {
      this.valorantNotificationVolume = volume
      this.valorantNotificationSound = sound
    },
    setWildRiftNotification({ sound, volume }: { sound: string; volume: number }) {
      this.wildRiftNotificationVolume = volume
      this.wildRiftNotificationSound = sound
    },
    setTftNotification({ sound, volume }: { sound: string; volume: number }) {
      this.tftNotificationVolume = volume
      this.tftNotificationSound = sound
    },
    setLolAutoQueue(value = false) {
      this.lolAutoQueue = value
    },
    setDefaultGame(game: string) {
      this.defaultGame = game
    },
  },
  persist: true,
})

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
    SET_LOL_PATH(lolPath: string | null) {
      this.lolPath = lolPath
    },
    SET_NOTIFY_NEW_SERVICE_IN_QUEUE(value = true) {
      this.notifyNewServiceInQueue = value
    },
    SET_PLAY_SOUND_ON_NEW_CHAT_ITEM(value = true) {
      this.playSoundOnNewChatItem = value
    },
    SET_PLAY_SOUND_ON_NEW_NOTIFICATION(value = true) {
      this.playSoundOnNewNotification = value
    },
    SET_LEAGUE_OF_LEGENDS_NOTIFICATION({ sound, volume }: { sound: string; volume: number }) {
      this.leagueOfLegendsNotificationVolume = volume
      this.leagueOfLegendsNotificationSound = sound
    },
    SET_VALORANT_NOTIFICATION({ sound, volume }: { sound: string; volume: number }) {
      this.valorantNotificationVolume = volume
      this.valorantNotificationSound = sound
    },
    SET_WILD_RIFT_NOTIFICATION({ sound, volume }: { sound: string; volume: number }) {
      this.wildRiftNotificationVolume = volume
      this.wildRiftNotificationSound = sound
    },
    SET_TFT_NOTIFICATION({ sound, volume }: { sound: string; volume: number }) {
      this.tftNotificationVolume = volume
      this.tftNotificationSound = sound
    },
    SET_LOL_AUTO_QUEUE(value = false) {
      this.lolAutoQueue = value
    },
    SET_DEFAULT_GAME(game: string) {
      this.defaultGame = game
    },
  },
  persist: true,
})

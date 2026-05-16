import { defineStore } from 'pinia'

interface State {
  isLoLAuthenticated: boolean
  summonerName: string | null
  connectionData: { password: string; port: number } | null
  importedData: any
}

export const useLolStore = defineStore('lol', {
  state: (): State => ({
    isLoLAuthenticated: false,
    summonerName: null,
    connectionData: null,
    importedData: null,
  }),
  actions: {
    SET_IS_LOL_AUTHENTICATED(value: boolean) {
      this.isLoLAuthenticated = value
    },
    SET_SUMMONER_NAME(value: string | null) {
      this.summonerName = value
    },
    SET_CONNECTION_DATA(value: { password: string; port: number } | null) {
      this.connectionData = value
    },
    SET_IMPORTED_DATA(value: any) {
      this.importedData = value
    },
  },
})

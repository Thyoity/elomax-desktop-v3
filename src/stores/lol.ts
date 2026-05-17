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
    setIsLolAuthenticated(value: boolean) {
      this.isLoLAuthenticated = value
    },
    setSummonerName(value: string | null) {
      this.summonerName = value
    },
    setConnectionData(value: { password: string; port: number } | null) {
      this.connectionData = value
    },
    setImportedData(value: any) {
      this.importedData = value
    },
  },
})

<template>
  <div class="container" style="height: 100%; display: flex; flex-direction: column; justify-content: center;">
    <!-- <h1 v-show="show" wow bounceInUp>Teste de wow</h1> -->
    <div class="panels">
      <div class="panel full your-online-system">
        <div style="width: 100%; display: flex; flex-direction: row;">
          <span style="color: rgb(255, 255, 255); font-size: 45px; height: 34px; line-height: 47px; margin-right: 30px;">❞</span>
          <div style="display: flex; flex-direction: column; align-items: flex-start; flex-grow: 1;">
            <h3 style="text-align: left; line-height: 100%; margin-bottom: 10px;">Seja bem vindo!</h3>
            <p style="margin: 0; color: #555555; font-size: 15px; text-align: left;">Este é um aplicativo utilitário do booster da ELOMAX.</p>
          </div>
        </div>
        <div class="quick-links" style="flex-direction: row; display: flex; flex-wrap: wrap;">
          <div v-if="isLoLAuthenticated" class="button" style="margin-top: 10px;">
            <span style="color: #85d0ff; font-weight: 600;">
              Conectado no LoL:
              <span style="background-color: green; color: #FFF; padding: 0 5px; margin-left: 3px;" @click="test()">{{ summonerName }}</span>
            </span>
          </div>
          <a v-else class="button" style="margin-top: 10px;" href="javascript:void(0)" @click="test()">
            <span style="color: #85d0ff; font-weight: 600;">Você não está conectado em nenhuma conta.</span>
          </a>
        </div>
      </div>

      <div class="social-links" style="display: flex; flex-direction: row">
        <div class="panel" @click="$bridge.send('new-window', 'https://discord.gg/nGtjs6B')" style="margin-right: 20px;">
          <h2>Discord</h2>
        </div>
        <div class="panel" @click="$bridge.send('new-window', 'https://www.facebook.com/elojobmax/?fref=ts')" style="margin-right: 20px;">
          <h2>Facebook</h2>
        </div>
        <div class="panel" @click="$bridge.send('new-window', 'https://www.instagram.com/elojobmax/?hl=pt-br')">
          <h2>Instagram</h2>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { API_BASE_URL, WEB_BASE_URL } from '@/config/api'
// @ is an alias to /src
import axios from 'axios'
import { mapActions, mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useLolStore } from '@/stores/lol'
import { useServicesStore } from '@/stores/services'
import _ from 'lodash'
import LoLAccountDTO from '@/dtos/lol-account'

export default {
  name: 'Home',
  computed: {
    ...mapState(useAuthStore, ['token']),
    ...mapState(useLolStore, ['isLoLAuthenticated','summonerName','importedData','connectionData'])
  },
  data(){
    return {
      show: false,
      hash: null,
      isImporting: false,
      countdown: 10,
      isGeneratingHash: false,
      timeout: null
    }
  },
  watch: {
    isAuthenticated(value){
      console.log("Mudou para " + value)
      if(!value){
        this.isImporting = false
        if(this.timeout){
          clearTimeout(this.timeout)
        }
      }
    },
    importedData(value){
      if(!value){
        this.isImporting = false
        if(this.timeout){
          clearTimeout(this.timeout)
        }
      }
    }
  },
  methods: {
    ...mapActions(useAppStore, ['setImportedData']),
    ...mapActions(useServicesStore, ['setServices']),
    initializeImport() {
      // Asks the Rust LCU bridge for a fresh summoner + ranked snapshot. The
      // worker emits a `lol-account-data` event that App.vue picks up and
      // pushes to the store (`importedData`).
      this.isImporting = true
      this.$bridge.send('lol-gather-account-data')
      this.timeout = setTimeout(() => {
        if (!this.importedData) this.initializeImport()
      }, 5000)
    },
    async test() {
      this.$bridge.send('elomax-notification')
    },
    onLoLGetRequest(_event, payload) {
      // Generic LCU GET response — currently nothing in Home.vue triggers it,
      // but the handler is kept here as a placeholder for the "manual import"
      // button if it's reintroduced in the future. The Rust bridge emits a
      // payload of shape `{ error, response: { statusCode, req: { path } }, body }`.
      if (!payload?.response?.req) return
      if (payload.response.req.path === '/lol-ranked/v1/current-ranked-stats') {
        const result = LoLAccountDTO.in(this.summonerName, payload.body.queues)
        axios.post(
          `${API_BASE_URL}/lol/match-logs`,
          { action: 'button-press', data: result },
          { headers: { Authorization: `Bearer ${this.token}` } },
        )
      }
    },
  },
  mounted() {
    this.$bridge.on('lol-get-request', this.onLoLGetRequest)
  },
  beforeUnmount() {
    this.$bridge.removeListener('lol-get-request', this.onLoLGetRequest)
    if (this.timeout) clearTimeout(this.timeout)
  },
}
</script>

<style lang="scss">
  .container {
    overflow: auto;
  }
  .panels {
    padding-left: 30px;
    padding-right: 30px;
    padding-bottom: 50px;
    > .panel{
      &:first-child {
        margin-top: 0;
      }
    }
    .panel {
      background: rgba(18,18,25,.5);
      border-radius: 30px;
      display: flex;
      margin-top: 20px;
      min-height: 100px;
      width: 100%;
      table td {
        color: #FFFFFF;
        text-align: left;
      }
    }
  }
  
  .your-online-system {
    display: flex;
    flex-direction: column;
    padding: 40px;
    position: relative;
    h3 {
      color: #FFFFFF;
      margin: 0;
      font-size: 25px;
    }
    .quick-links {
      margin-top: 10px;
      .button {
        height: 30px;
        margin-right: 10px;
        span {
          font-size: 15px;
        }
      }
    }
  }

  .social-links {
    .panel {
      display: flex; 
      align-items: center; 
      justify-content: center;
      transition: .2s all;
      cursor: pointer;
      &:hover {
        transform: scale(1.05);
      }
      h2 {
        color: rgb(133, 208, 255);
        font-size: 17px;
      }
    }
  }
</style>
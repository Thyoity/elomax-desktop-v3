<template>
  <div class="settings--container">
    <h1 style="color: #FFFFFF;">Configurações</h1>
    <OverlayScrollbar class="inner-container">
      <div class="settings-column">
        <h3>Notificações</h3>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Novo serviço de League of Legends na fila:</p>
          <VMultiselect
            :options="lolOptions"
            :style="{ width: 250 + 'px' }"
            placeholder="Selecione"
            label="name"
            track-by="value"
            :searchable="false"
            :model-value="findOption(lolOptions, leagueOfLegendsNotificationSound)"
            :allow-empty="false"
            :show-labels="false"
            @update:model-value="$event && setNotification('leagueOfLegends', 'sound', $event.value)"
          >
            <template #singleLabel="{ option }">{{ option.name }}</template>
          </VMultiselect>
          <div class="mixer">
            <a href="javascript:void(0)" :class="{ active: leagueOfLegendsNotificationVolume === 0 }" @click="setNotification('leagueOfLegends', 'volume', 0)">0%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: leagueOfLegendsNotificationVolume === .1 }" @click="setNotification('leagueOfLegends', 'volume', .1)">10%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: leagueOfLegendsNotificationVolume === .25 }" @click="setNotification('leagueOfLegends', 'volume', .25)">25%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: leagueOfLegendsNotificationVolume === .5 }" @click="setNotification('leagueOfLegends', 'volume', .5)">50%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: leagueOfLegendsNotificationVolume === .75 }" @click="setNotification('leagueOfLegends', 'volume', .75)">75%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: leagueOfLegendsNotificationVolume === 1 }" @click="setNotification('leagueOfLegends', 'volume', 1)">100%</a>
            <a href="javascript:void(0)" class="test" @click="testLeagueOfLegendsNotification()">Testar</a>
          </div>
        </div>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Novo serviço de Valorant na fila:</p>
          <VMultiselect
            :options="valorantOptions"
            :style="{ width: 250 + 'px' }"
            placeholder="Selecione"
            label="name"
            track-by="value"
            :searchable="false"
            :model-value="findOption(valorantOptions, valorantNotificationSound)"
            :allow-empty="false"
            :show-labels="false"
            @update:model-value="$event && setNotification('valorant', 'sound', $event.value)"
          >
            <template #singleLabel="{ option }">{{ option.name }}</template>
          </VMultiselect>
          <div class="mixer">
            <a href="javascript:void(0)" :class="{ active: valorantNotificationVolume === 0 }" @click="setNotification('valorant', 'volume', 0)">0%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: valorantNotificationVolume === .1 }" @click="setNotification('valorant', 'volume', .1)">10%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: valorantNotificationVolume === .25 }" @click="setNotification('valorant', 'volume', .25)">25%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: valorantNotificationVolume === .5 }" @click="setNotification('valorant', 'volume', .5)">50%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: valorantNotificationVolume === .75 }" @click="setNotification('valorant', 'volume', .75)">75%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: valorantNotificationVolume === 1 }" @click="setNotification('valorant', 'volume', 1)">100%</a>
            <a href="javascript:void(0)" class="test" @click="testValorantNotification()">Testar</a>
          </div>
        </div>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Novo serviço de Wild Rift na fila:</p>
          <VMultiselect
            :options="wildRiftOptions"
            :style="{ width: 250 + 'px' }"
            placeholder="Selecione"
            label="name"
            track-by="value"
            :searchable="false"
            :model-value="findOption(wildRiftOptions, wildRiftNotificationSound)"
            :allow-empty="false"
            :show-labels="false"
            @update:model-value="$event && setNotification('wildRift', 'sound', $event.value)"
          >
            <template #singleLabel="{ option }">{{ option.name }}</template>
          </VMultiselect>
          <div class="mixer">
            <a href="javascript:void(0)" :class="{ active: wildRiftNotificationVolume === 0 }" @click="setNotification('wildRift', 'volume', 0)">0%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: wildRiftNotificationVolume === .1 }" @click="setNotification('wildRift', 'volume', .1)">10%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: wildRiftNotificationVolume === .25 }" @click="setNotification('wildRift', 'volume', .25)">25%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: wildRiftNotificationVolume === .5 }" @click="setNotification('wildRift', 'volume', .5)">50%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: wildRiftNotificationVolume === .75 }" @click="setNotification('wildRift', 'volume', .75)">75%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: wildRiftNotificationVolume === 1 }" @click="setNotification('wildRift', 'volume', 1)">100%</a>
            <a href="javascript:void(0)" class="test" @click="testWildRiftNotification()">Testar</a>
          </div>
        </div>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Novo serviço de TFT na fila:</p>
          <VMultiselect
            :options="tftOptions"
            :style="{ width: 250 + 'px' }"
            placeholder="Selecione"
            label="name"
            track-by="value"
            :searchable="false"
            :model-value="findOption(tftOptions, tftNotificationSound)"
            :allow-empty="false"
            :show-labels="false"
            @update:model-value="$event && setNotification('tft', 'sound', $event.value)"
          >
            <template #singleLabel="{ option }">{{ option.name }}</template>
          </VMultiselect>
          <div class="mixer">
            <a href="javascript:void(0)" :class="{ active: tftNotificationVolume === 0 }" @click="setNotification('tft', 'volume', 0)">0%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: tftNotificationVolume === .1 }" @click="setNotification('tft', 'volume', .1)">10%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: tftNotificationVolume === .25 }" @click="setNotification('tft', 'volume', .25)">25%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: tftNotificationVolume === .5 }" @click="setNotification('tft', 'volume', .5)">50%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: tftNotificationVolume === .75 }" @click="setNotification('tft', 'volume', .75)">75%</a>
            <div class="mixer-spacer"></div>
            <a href="javascript:void(0)" :class="{ active: tftNotificationVolume === 1 }" @click="setNotification('tft', 'volume', 1)">100%</a>
            <a href="javascript:void(0)" class="test" @click="testTftNotification()">Testar</a>
          </div>
        </div>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Som ao receber mensagem no chat:</p>
          <AppToggleButton 
            :value="playSoundOnNewChatItem"
            @change="setPlaySoundOnNewChatItem($event.value)"
            :color="{checked: '#85d0ff', unchecked: 'rgb(170, 170, 170)', disabled: 'rgb(102, 102, 102)'}" />
        </div>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Som ao receber notificação:</p>
          <AppToggleButton 
            :value="playSoundOnNewNotification"
            @change="setPlaySoundOnNewNotification($event.value)"
            :color="{checked: '#85d0ff', unchecked: 'rgb(170, 170, 170)', disabled: 'rgb(102, 102, 102)'}" />
        </div>
        <h3>League of Legends</h3>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Aceitar fila automaticamente:</p>
          <AppToggleButton 
            :value="lolAutoQueue"
            @change="setLolAutoQueue($event.value)"
            :color="{checked: '#85d0ff', unchecked: 'rgb(170, 170, 170)', disabled: 'rgb(102, 102, 102)'}" />
        </div>
        <div class="setting-row">
          <p style="color: #FFF; margin-top: 0;">Caminho da pasta do League of Legends:</p>
          <button type="button" class="lol-path-button" @click="pickLoLPath">
            {{ lolPath ? 'Trocar pasta…' : 'Selecionar pasta…' }}
          </button>
          <span style="margin-top: 20px; color: #FFFFFF;" v-if="lolPath">{{ lolPath }}</span>
          <a href="javascript:void(0)" style="margin-top: 20px; color: #FFFFFF;" @click="setLolPath(null)" v-if="lolPath">Limpar</a>
        </div>
      </div>
    </OverlayScrollbar>
  </div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useSettingsStore } from '@/stores/settings'
import { mapActions, mapState } from 'pinia'
import _ from 'lodash'
export default {
  name: 'Home',
  components: {
  },
  data() {
    const buildOptions = (gameLabel, gameValue) => [
      { name: 'Desativar', value: 'disabled' },
      { name: `Google (${gameLabel})`, value: gameValue },
      { name: 'Notificação 1', value: 'n1' },
      { name: 'Notificação 2', value: 'n2' },
    ]
    return {
      lolOptions: buildOptions('LoL', 'lol'),
      valorantOptions: buildOptions('Valorant', 'valorant'),
      wildRiftOptions: buildOptions('Wild Rift', 'wr'),
      tftOptions: buildOptions('TFT', 'tft'),
      notificationSounds: [
        { name: 'Desativar', value: 'disabled' },
        { name: 'Google (LoL)', value: 'lol' },
        { name: 'Google (Valorant)', value: 'valorant' },
        { name: 'Google (Wild Rift)', value: 'wr' },
        { name: 'Google (TFT)', value: 'tft' },
        { name: 'Notificação 1', value: 'n1' },
        { name: 'Notificação 2', value: 'n2' },
      ],
    }
  },
  computed: {
    ...mapState(useAppStore, ['serviceNotificationSounds']),
    ...mapState(useSettingsStore, [
        'notifyNewServiceInQueue', 
        'playSoundOnNewNotification', 
        'playSoundOnNewChatItem', 
        'lolPath', 
        'lolAutoQueue',

        'leagueOfLegendsNotificationVolume',
        'leagueOfLegendsNotificationSound',
        'valorantNotificationVolume',
        'valorantNotificationSound',
        'wildRiftNotificationVolume',
        'wildRiftNotificationSound',
        'tftNotificationVolume',
        'tftNotificationSound'
      ])
  },
  methods: {
    ...mapActions(useSettingsStore, [
      "setLolPath", 
      "setNotifyNewServiceInQueue", 
      "setPlaySoundOnNewChatItem", 
      "setPlaySoundOnNewNotification", 
      "setLolAutoQueue",
      "setLeagueOfLegendsNotification",
      "setValorantNotification",
      "setWildRiftNotification",
      "setTftNotification"
    ]),
    getNotificationLabelByValue(value){
      const found = _.find(this.notificationSounds, { value })
      if (found) return found.name
      return null
    },
    findOption(options, value) {
      return options.find((o) => o.value === value) ?? null
    },
    // Opens the Tauri native directory picker. The legacy version used
    // `<input type="file" webkitdirectory>` which works in Electron (it
    // exposes `.path` on the File object) but in a Tauri webview it
    // recursively lists every file under the chosen folder instead of just
    // returning a path. The dialog plugin gives us the OS-native folder
    // picker behaviour we actually want.
    async pickLoLPath() {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog')
        const selected = await open({ directory: true, multiple: false })
        if (typeof selected === 'string') this.setLolPath(selected)
      } catch {
        // Browser-only dev (plain `vite`) — silently skip.
      }
    },
    setNotification (game, type, value) {
      console.log(value)
      switch (game) {
        case 'leagueOfLegends':
          if (type === 'sound') {
            this.setLeagueOfLegendsNotification({ sound: value, volume: this.leagueOfLegendsNotificationVolume })
          } else if (type === 'volume') {
            this.setLeagueOfLegendsNotification({ sound: this.leagueOfLegendsNotificationSound, volume: value })
          }
          break;
        case 'valorant':
          if (type === 'sound') {
            this.setValorantNotification({ sound: value, volume: this.valorantNotificationVolume })
          } else if (type === 'volume') {
            this.setValorantNotification({ sound: this.valorantNotificationSound, volume: value })
          }
          break;
        case 'wildRift':
          if (type === 'sound') {
            this.setWildRiftNotification({ sound: value, volume: this.wildRiftNotificationVolume })
          } else if (type === 'volume') {
            this.setWildRiftNotification({ sound: this.wildRiftNotificationSound, volume: value })
          }
          break;
        case 'tft':
          if (type === 'sound') {
            this.setTftNotification({ sound: value, volume: this.tftNotificationVolume })
          } else if (type === 'volume') {
            this.setTftNotification({ sound: this.tftNotificationSound, volume: value })
          }
          break;
      }
    },
    testLeagueOfLegendsNotification () {
      if (this.leagueOfLegendsNotificationSound === 'disabled') return
      this.serviceNotificationSounds[this.leagueOfLegendsNotificationSound].volume(this.leagueOfLegendsNotificationVolume).play()
    },
    testValorantNotification () {
      if (this.valorantNotificationSound === 'disabled') return
      this.serviceNotificationSounds[this.valorantNotificationSound].volume(this.valorantNotificationVolume).play()
    },
    testWildRiftNotification () {
      if (this.wildRiftNotificationSound === 'disabled') return
      this.serviceNotificationSounds[this.wildRiftNotificationSound].volume(this.wildRiftNotificationVolume).play()
    },
    testTftNotification () {
      if (this.tftNotificationSound === 'disabled') return
      this.serviceNotificationSounds[this.tftNotificationSound].volume(this.tftNotificationVolume).play()
    }
  },
  mounted(){
  }
}
</script>

<style lang="scss">
  h1 {
    color: #FFF;
  }
  
  .services-menu-link {
    color: #3e6082;
    &.active {
      color: #85d0ff;
    }
  }

  .multiselect {
    height: 40px;
    min-height: auto;
    .multiselect__select::before {
      top: 70%;
    }
  }
  .multiselect .multiselect__tags {
    color: #666;
    box-shadow: inset 0 0 4px #666, 0 0 2px #666;
    cursor: pointer;
    border: 1px solid #666;
    height: 40px;
    min-height: auto;
    padding: 9px 40px 0 8px;
    background-color: transparent;
    .multiselect__input, .multiselect__single {
      color: #FFFFFF;
      background-color: transparent;
      margin-bottom: 0;
    }
    
  }
  .multiselect__content-wrapper {
    background: #444444;
    box-shadow: inset 0 0 4px #666, 0 0 2px #666;
    border: 1px solid #666;
  }

  .multiselect__option {
    color: #999999;
  }
  .multiselect__option--highlight {
    background-color: #85d0ff;
    color: #FFFFFF;
  }

  .settings--container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-right: 0;
    flex-direction: column;
    padding-top: 0px;
    overflow-y: hidden;

    .settings-column {
      display: flex;
      flex-direction: column;
      padding-bottom: 20px;
    }
    
    .inner-container {
      width: 100%;
      height: 100%;
      padding: 0 30px;

      h3 {
        margin-top: 0;
        margin-bottom: 30px;
        padding-top: 30px;
        border-top: 1px solid rgba(255,255,255,.1);
        
        &:first-child {
          border-top: 0;
          margin-top: 20px;
          padding-top: 0;
        }
      }

      .setting-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 30px;

        &:last-child {
          margin-bottom: 30px;
        }

        .lol-path-button {
          background: transparent;
          color: #aaa;
          border: 1px solid #666;
          border-radius: 3px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: .3s all;
          box-shadow: inset 0 0 4px #666, 0 0 2px #666;

          &:hover {
            color: rgb(133, 208, 255);
            border-color: rgb(133, 208, 255);
            box-shadow: inset 0 0 4px rgb(133, 208, 255), 0 0 2px rgb(133, 208, 255);
          }
        }

        .mixer {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-top: 15px;
          a {
            color: #666;
            box-shadow: inset 0 0 4px #666, 0 0 2px #666;
            border: 1px solid #666;
            border-radius: 3px;
            width: 60px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: .3s all;
            font-size: 12px;
            font-weight: 700;
            &.test {
              margin-left: 20px;
            }
            &:hover {
              border: 1px solid rgb(133, 208, 255);
              color: rgb(133, 208, 255);
              box-shadow: inset 0 0 4px rgb(133, 208, 255), 0 0 2px rgb(133, 208, 255);
            }
            &.active {
              border: 1px solid rgb(133, 208, 255);
              color: #FFF;
              background-color: rgb(133, 208, 255);
              box-shadow: inset 0 0 4px rgb(133, 208, 255), 0 0 2px rgb(133, 208, 255);
            }
          }
          .mixer-spacer {
            width: 10px;
            height: 1px;
            background-color: #666;
          }
        }
      }
    }
  }

</style>
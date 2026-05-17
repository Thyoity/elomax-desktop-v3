<template>
  <div class="service-finish--container animated fadeIn">
    
    <form enctype="multipart/form-data" novalidate v-if="service.status !== 'finished' && (isInitial || isSaving)">
      <div class="dropbox">
        <input type="file" :name="uploadFieldName" :disabled="isSaving" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
          accept="image/*" class="input-file">
          <p v-if="isInitial">
            Clique aqui ou arraste a sua imagem de conclusão de serviço dentro desta área
          </p>
          <p v-if="isSaving">
            Carregando arquivo...
          </p>
      </div>
    </form>
    <a href="javascript:void(0)" v-if="uploadedFiles.length && service.status !== 'finished' && !isFinishingService" class="finish-button animated fadeIn" @click="save()"><ion-icon name="checkmark-outline"></ion-icon></a>
    <a href="javascript:void(0)" v-if="uploadedFiles.length && service.status !== 'finished' && isFinishingService" class="finish-button animated fadeIn"><AppMiniLoading :containerWidth="36" :containerHeight="40" :size="4"></AppMiniLoading></a>
    <div v-if="service.status === 'finished'" class="image-upload-result">
      <p>Este serviço está finalizado desde: <strong>{{ service.dateFinished ? service.dateFinished.format('DD/MM/YYYY HH:mm') : 'Sem data' }}</strong></p>
      <div class="thumbnail">
        <img v-if="service.screenshot" :src="'https://elomax.s3-sa-east-1.amazonaws.com/images/screenshots/' + service.screenshot" class="img-responsive img-thumbnail">
        <span v-else>-- SEM SCREENSHOT --</span>
      </div>
    </div>
    <div v-else-if="isSuccess" class="image-upload-result">
      <p>
        <a href="javascript:void(0)" @click="reset()">Carregar outra imagem</a>
      </p>
      <div class="thumbnail">
        <img :src="uploadedFiles[0].url" class="img-responsive img-thumbnail" :alt="uploadedFiles[0].originalName">
      </div>
    </div>
    <!--FAILED-->
    <div v-else-if="isFailed" class="image-upload-result">
      <p>
        <a href="javascript:void(0)" @click="reset()">Tentar novamente</a>
      </p>
      <pre>O carregamento falhou: {{ uploadError }}</pre>
    </div>
  </div>
</template>
<script>
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { API_BASE_URL, WEB_BASE_URL } from '@/config/api'
import { mapActions, mapState } from 'pinia'
import { useServicesStore } from '@/stores/services'
import axios from 'axios'
import { fakeUpload } from './upload-service'
const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3
export default {
  props: ['service'],
    computed: {
    ...mapState(useAuthStore, ['user', 'token']),
    ...mapState(useNotificationsStore, ['notifications']),
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    }
  },
  data () {
    return {
      formData: null,
      isFinishingService: false,

      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'photos'
    }
  },
  methods: {
    ...mapActions(useServicesStore, ['finishService']),
    reset() {
      this.formData = null
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
    },
    async save () {
      if (!this.formData) return 
      this.isFinishingService = true
      try {
        const { data } = await axios.post(`${API_BASE_URL}/services/${this.service.id}/finish`, this.formData, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        console.log({
          service: this.service,
          dateFinished: data.data.date_finished,
          screenshot: data.data.screenshot
        })
        this.finishService({
          service: this.service,
          dateFinished: data.data.date_finished,
          screenshot: data.data.screenshot
        })
        this.isFinishingService = false
      } catch (err) {
        if (err && err.response && err.response.data && !err.response.data.success){
          if (err.response.data.code && err.response.data.code === "PAST_DEADLINE_ERROR") {
            this.$toast.error('O serviço não pode ser finalizado pois o prazo de entrega expirou. Entre em contato com a administração.', 'Ops', {
              position: "topCenter"
            })
          }
        }
        else {
          this.$toast.error('Erro desconhecido ao finalizar o serviço.', 'Ops', {
            position: "topCenter"
          })
        }
        this.isFinishingService = false
      }
    },
    async showThumbnail() {
      this.currentStatus = STATUS_SAVING;
      try {
        const result = await fakeUpload(this.formData, {
          token: this.token,
          serviceId: this.service.id
        })
        this.uploadedFiles = [].concat(result);
        this.currentStatus = STATUS_SUCCESS;
      } catch (err) {
        this.uploadError = err.response
        this.currentStatus = STATUS_FAILED
      }
    },
    filesChange(fieldName, fileList) {

      this.formData = new FormData();

      if (!fileList.length) return;

      Array
        .from(Array(fileList.length).keys())
        .map(x => {
          this.formData.append(fieldName, fileList[x], fileList[x].name);
        });

      this.showThumbnail();
    }
  },
  mounted () {
    this.reset();
  }
}
</script>
<style lang="scss" scoped>
  .service-finish--container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;

    .finish-button {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      position: absolute;
      right: 50px;
      bottom: 50px;
      background-color: #85d0ff;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      color: #FFF;
      box-shadow: inset 0 0 1px #85d0ff, 0 0 3px #85d0ff;
      transition: all .5s;

      &:hover {
        box-shadow: inset 0 0 3px #85d0ff, 0 0 5px #85d0ff;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    
    .dropbox {
      display: flex;
      align-items: center;
      width: 80%;
      outline: 2px dashed grey; /* the dash box */
      outline-offset: -10px;
      background: rgba(255,255,255,.1);
      color: rgba(255,255,255,.5);
      padding: 10px 10px;
      min-height: 370px; /* minimum height */
      position: relative;
      cursor: pointer;
      transition: .3s all;
    }

    .input-file {
      opacity: 0;
      height: 370px;
      position: absolute;
      cursor: pointer;
      left: 0;
      width: 100%;
      top: 0;
    }

    .dropbox:hover {
      background: rgba(255,255,255,.15);
    }

    .dropbox p {
      font-size: 1.2em;
      text-align: center;
      padding: 50px 80px;
      width: 100%;
    }

    .image-upload-result {
      display: flex;
      flex-direction: column;
      align-items: center;

      a {
        color: orange;
      }

      .thumbnail {
        width: 80%;
        height: 316px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0,0,0,.1);
        
        img {
          max-width: 100%;
          max-height: 316px;
        }
      }

    }

    
  }
</style>
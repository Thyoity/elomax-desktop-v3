<template>
  <div class="blog-article--container">
    <div class="page-title animated fadeIn">
      <h1>Editar Publicação #{{$route.params.id}}</h1>
    </div>

    <div v-if="!isLoading" class="page-content">
      <div
        style="
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
        "
      >
        <h3 class="animated fadeIn page-header-menu">
          <a
            href="javascript:void(0)"
            @click="$router.push('/blog-articles')"
          >
            <ion-icon name="arrow-back-circle-outline" style="font-size: 24px; margin-right: 5px;"></ion-icon> Voltar
          </a>
        </h3>
      </div>

      <!--
      League of Legends Services
      -->
      <OverlayScrollbar class="scroll-container">
        <form
          ref="form"
          enctype="multipart/form-data"
          class="service-list"
          v-if="article"
        >
          <div class="input-group">
            <label>Título</label>
            <input type="text" v-model="article.title" />
          </div>
          <div class="input-group">
            <label>Slug</label>
            <input type="text" v-model="article.slug" />
          </div>
          <div class="input-group">
            <label>Palavras-chaves</label>
            <input type="text" v-model="article.keywords" />
          </div>
          <div v-if="article.image_name" class="loaded-image-container">
            <img :src="`https://s3-sa-east-1.amazonaws.com/elomax/images/blog/${article.image_name}`" style="max-width: 100%;" />
          </div>
          <div v-if="article.image_name" class="input-group" style="margin-bottom: 30px;">
            <label>Mudar imagem</label>
            <input type="file" name="image" />
          </div>
          <div v-else class="input-group">
            <label>Imagem</label>
            <input type="file" name="image" />
          </div>
          <div class="editor-group">
            <ckeditor
              :editor="editor"
              :config="editorConfig"
              v-model="article.article"
            ></ckeditor>
          </div>
          <div class="input-group">
            <label>Categoria</label>
            <VMultiselect v-model="article.category"
              :options="articleCategories"
              :style="{ width: 250 + 'px' }"
              placeholder="Selecione"
              :searchable="false"
              :allow-empty="false"
              :show-labels="false"
            ></VMultiselect>
          </div>
          <a
            href="javascript:void(0)"
            class="button"
            v-if="!isSaving"
            style="margin-top: 20px; width: 230px; align-self: center"
            @click="save()"
            >Salvar Artigo</a
          >
          <a
            href="javascript:void(0)"
            class="button"
            style="margin-top: 20px; width: 250px; align-self: center"
            v-else
            >Salvando Artigo...</a
          >
        </form>
      </OverlayScrollbar>
    </div>
    <div
      v-else
      class="page-content"
      style="display: flex; align-items: center; justify-content: center"
    >
      <AppLoading
        class="animated fadeIn"
        :text="'Carregando artigo...'"
      ></AppLoading>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useAuthStore } from "@/stores/auth";
import CKEditor from "@ckeditor/ckeditor5-vue2";

import InlineEditor from "@ckeditor/ckeditor5-editor-inline/src/inlineeditor";
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import SimpleUploadAdapterPlugin from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter'
import RemoveFormatPlugin from '@ckeditor/ckeditor5-remove-format/src/removeformat'
import HighlightPlugin from '@ckeditor/ckeditor5-highlight/src/highlight'

import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import ListPlugin from '@ckeditor/ckeditor5-list/src/list'
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image'
import ImageUploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload'
import ImageCaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption'

import _ from "lodash";
import axios from "axios";

export default {
  name: "Article",
  components: {
    ckeditor: CKEditor.component,
  },
  data() {
    return {
      isLoading: true,
      isSaving: false,
      article: null,
      editor: InlineEditor,
      editorConfig: {
        plugins: [
            EssentialsPlugin,
            HeadingPlugin,
            BoldPlugin,
            ItalicPlugin,
            LinkPlugin,
            ParagraphPlugin,
            SimpleUploadAdapterPlugin,
            RemoveFormatPlugin,
            HighlightPlugin,
            BlockQuotePlugin,
            ListPlugin,
            ImagePlugin,
            ImageUploadPlugin,
            ImageCaptionPlugin
        ],
        toolbar: {
          items: [
            "heading",
            "|",
            "highlight",
            "|",
            "removeFormat",
            "bold",
            "italic",
            "link",
            "|",
            "uploadImage",
            "blockQuote",
            "|",
            "bulletedList",
            "numberedList",
          ],
        },
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Parágrafo",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Subtítulo",
              class: "ck-heading_heading3",
            },
          ],
        },
        highlight: {
          options: [
            {
              model: "marker",
              class: "highlight",
              title: "Azul ELOMAX",
              color: "#f0faff",
              type: "marker",
            },
          ],
        },
        simpleUpload: {
            // The URL that the images are uploaded to.
            uploadUrl: 'https://elojobmax.com.br/api/blog-articles/upload-image'
        }
      },
      articleCategories: ["League of Legends", "Wild Rift", "TFT", "Valorant"],
    };
  },
  computed: {
    ...mapState(useAuthStore, ["token"]),
  },
  methods: {
    async loadBlogArticle() {
      this.isLoading = true;
      try {
        const { data } = await axios.get(
          `https://elojobmax.com.br/api/user/blog-articles/${this.$route.params.id}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.originalArticle = JSON.stringify(data.data);
        this.article = data.data;
        this.isLoading = false;
      } catch (err) {
        this.$toast.error(
          "Erro ao adquirir as informações do artigo.",
          "Ops",
          {
            position: "topCenter",
          }
        );
        this.$router.push('/blog-articles')
        return
      }
    },
    getArticleDescription(article) {
      return _.truncate(article.replace(/<\/?[^>]+(>|$)/g, ""), {
        length: 200, // maximum 30 characters
        separator: /,?\.* +/, // separate by spaces, including preceding commas and periods
      });
    },
    async save() {
      const form = this.$refs.form;
      const formData = new FormData(form);
      formData.append('title',this.article.title)
      formData.append('slug',this.article.slug)
      formData.append('keywords',this.article.keywords)
      formData.append('article',this.article.article)
      formData.append('category',this.article.category)
      formData.append('status','pending')
      this.isSaving = true
      try {
        const { data } = await axios.post(
          `https://elojobmax.com.br/api/user/blog-articles/${this.$route.params.id}/update/form-data`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        this.$toast.success('Artigo salvo e enviado para análise.', 'Sucesso', {
          position: "topCenter"
        })
        this.$router.push('/blog-articles')
      } catch (err) {
        this.$toast.error(
          "Erro ao salvar artigo.",
          "Ops",
          {
            position: "topCenter",
          }
        );
        this.isSaving = false
      }
    },
  },
  mounted() {
    this.loadBlogArticle();
  },
};
</script>

<style lang="scss" scoped>
.blog-article--container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: 0;
  flex-direction: column;
  padding-top: 0px;
  overflow-y: hidden;

  .page-header-menu {
    height: 26px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    a {
      margin: 0 7px;
      color: #fff;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .refresh-button {
      font-size: 30px;
      margin-left: 20px;
      color: #fff;
      transition: 0.3s all;
      &:hover {
        color: #85d0ff;
      }
    }
  }
  h3 {
    position: relative;
    color: #ffffff;
    .description-icon {
      position: absolute;
      top: -10px;
      right: -18px;
      font-size: 15px;
    }
  }
  > div.page-content {
    width: 100%;
    height: 100%;
    .editor-group {
      margin: 0 60px;
      margin-bottom: 20px;
      border: 1px solid rgba(255,255,255,.1);
      outline: 0;
      .ck-content {
        outline: 0;
        border: 0;
        letter-spacing: .3px;
        color: #fff;
        font-size: 14px;
      }
    }
    .input-group {
      padding: 0 60px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
      &:last-child {
        margin-bottom: 0;
      }
      label {
        width: 200px;
        text-align: right;
        padding-right: 20px;
        flex-shrink: 0;
      }
      input {
        width: 100%;
        height: 40px;
        background-color: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        padding: 0 12px;
        font-size: 14px;
        color: #fff;
        letter-spacing: 0.3px;
        &:focus {
          outline: 0;
        }
      }
      input[type=file] {
        width: 100%;
        height: auto;
        background-color: transparent;
        padding: 0;
        font-size: 14px;
        color: #fff;
        letter-spacing: 0.3px;
        border: 0;
        &:focus {
          outline: 0;
        }
      }
    }
    .loaded-image-container {
      max-width: 650px;
      margin: 0 auto;
      margin-top: 10px;
      margin-bottom: 5px;
    }
  }
  .scroll-container {
    height: calc(100% - 100px) !important;
  }
  .service-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow-x: hidden;
    flex-grow: 1;
    .article {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      background: rgba(18, 18, 25, 0.5);
      margin-bottom: 20px;
      border-top-left-radius: 30px;
      border-bottom-left-radius: 30px;
      padding: 20px 30px;
      &:last-child {
        margin-bottom: 0;
      }
      h3 {
        margin-top: 0;
        line-height: 100%;
        text-align: left;
      }
      h5 {
        margin-top: 5px;
        margin-bottom: 0;
        &.server {
        }
        &.plan {
          margin-top: 0;
        }
        &.client {
          margin-top: 0;
        }
      }
      p {
        margin: 0;
        text-align: left;
      }

      > div {
        flex-grow: 1;
        padding-right: 30px;
        margin-right: 30px;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }
      span {
        color: #aaaaaa;
        font-size: 13px;
      }
    }
  }

  div.page-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 85.88px !important;
    .game-icon {
      margin-right: 10px;
      &.league-of-legends {
        margin-right: 10px;
      }
      &.wild-rift {
        margin-right: 15px;
      }
    }
    h1 {
      color: #fff;
    }
  }

  h1 {
    color: #fff;
  }

  .services-menu-link {
    color: #3e6082;
    position: relative;
    &.active {
      color: #85d0ff;
    }
    .count-label {
      font-size: 12px;
      width: 15px;
      height: 15px;
      background-color: #3e6082;
      color: #85d0ff;
      border-radius: 50%;
      padding: 0 5px;
      position: relative;
      top: -1px;
      margin-left: 5px;
    }
  }

  .panels {
    > .panel {
      &:first-child {
        margin-top: 0;
      }
    }
    .panel {
      background: rgba(18, 18, 25, 0.5);
      border-radius: 30px;
      display: flex;
      margin-top: 20px;
      min-height: 100px;
      width: 100%;
    }
  }

  .your-online-system {
    display: flex;
    flex-direction: column;
    padding: 40px;
    position: relative;
    h3 {
      color: #ffffff;
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
      transition: 0.2s all;
      &:hover {
        transform: scale(1.05);
      }
      h2 {
        color: rgb(133, 208, 255);
        font-size: 17px;
      }
    }
  }
}
</style>
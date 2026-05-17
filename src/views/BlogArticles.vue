<template>
  <div class="blog-articles--container">
    <div class="page-title animated fadeIn">
      <h1>Minhas Publicações</h1>
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
          <router-link v-if="false" :to="`/blog-articles/new`">
            <ion-icon name="add" style="font-size: 24px; margin-right: 2px" />
            Adicionar artigo
          </router-link>
          <a
            href="javascript:void(0)"
            @click="loadBlogArticles()"
            class="refresh-button"
          >
            <ion-icon name="sync-outline"></ion-icon>
          </a>
        </h3>
      </div>

      <!--
      League of Legends Services
      -->
      <OverlayScrollbar class="scroll-container">
        <div class="service-list" v-if="articles && articles.length > 0">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article animated fadeIn"
          >
            <div class="image-container">
              <img v-if="article.image_name"
                :src="`https://s3-sa-east-1.amazonaws.com/elomax/images/blog/${article.image_name}`"
              />
            </div>
            <div>
              <h3 class="article-title">
                <a href="javascript:void(0)" @click="openArticle(article)">{{
                  article.title
                }}</a>
                <router-link v-if="false" class="edit" :to="`/blog-articles/${article.id}`">
                  <ion-icon name="create-outline"></ion-icon>
                </router-link>
              </h3>
              <p style="margin-bottom: 10px">
                Status:
                <strong
                  :style="{
                    color:
                      article.status === 'activated'
                        ? 'limegreen'
                        : article.status === 'pending'
                        ? 'orange'
                        : article.status === 'reproved'
                        ? '#ffcccc'
                        : '',
                  }"
                  >{{ getArticleStatus(article.status) }}</strong
                >
              </p>
              <p
                v-if="article.status === 'reproved'"
                style="margin-bottom: 10px"
              >
                Motivo da reprovação:
                <strong>{{ article.reproved_reason }}</strong>
              </p>
              <p v-safe-html="getArticleDescription(article.article)"></p>
            </div>
            <span
              ><strong>Rendimento:</strong> R$
              {{ article.earned_amount.replace(".", ",") }}</span
            >
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
    </div>
    <div
      v-else
      class="page-content"
      style="display: flex; align-items: center; justify-content: center"
    >
      <AppLoading
        class="animated fadeIn"
        :text="'Carregando meus artigos...'"
      ></AppLoading>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL, WEB_BASE_URL } from '@/config/api'
import { mapState } from "pinia";
import { useAuthStore } from "@/stores/auth";
import _ from "lodash";
import axios from "axios";

export default {
  name: "BlogArticles",
    data() {
    return {
      isLoading: true,
      articles: [{}],
    };
  },

  computed: {
    ...mapState(useAuthStore, ["token"]),
  },
  methods: {
    openArticle(article) {
      if (article.status === 'activated') {
        this.$electron.ipcRenderer.send('new-window', `${WEB_BASE_URL}/blog/${article.slug}`)
      } else {
        this.$toast.error('Somente artigos publicados podem ser vistos no site.', 'Ops', {
          position: "topCenter"
        })
      }
    },
    getArticleStatus(status) {
      switch (status) {
        case "activated":
          return "Publicado";
          break;
        case "pending":
          return "Pendente";
          break;
        case "reproved":
          return "Reprovado";
          break;
        case "deactivated":
          return "Desativado";
          break;
      }
    },
    async loadBlogArticles() {
      this.isLoading = true;
      const { data } = await axios.get(
        `${API_BASE_URL}/user/blog-articles`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      this.articles = data.data;
      this.isLoading = false;
    },
    getArticleDescription(article) {
      return _.truncate(article.replace(/<\/?[^>]+(>|$)/g, ""), {
        length: 200, // maximum 30 characters
        separator: /,?\.* +/, // separate by spaces, including preceding commas and periods
      });
    },
  },
  mounted() {
    this.loadBlogArticles();
  },
};
</script>

<style lang="scss" scoped>
.blog-articles--container {
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
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      background: rgba(18, 18, 25, 0.5);
      margin-bottom: 20px;
      border-top-left-radius: 30px;
      border-bottom-left-radius: 30px;
      padding: 20px 30px 20px 200px;
      .image-container {
        position: absolute;
        left: 0px;
        top: 0px;
        bottom: 0px;
        width: 160px;
        background-color: rgba(0,0,0,.3);
        overflow: hidden;
        border-top-left-radius: 30px;
        border-bottom-left-radius: 30px;
        padding: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 0;
        img {
          max-height: 140px;
        }
      }
      .article-title {
        .edit {
          margin-left: 7px;
          position: relative;
          top: 3px;
          color: #fff;
        }
      }
      &:last-child {
        margin-bottom: 0;
      }
      h3 {
        margin-top: 0;
        line-height: 130%;
        text-align: left;
        margin-bottom: 15px;
        a {
          color: #85d0ff;
        }
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
        white-space: nowrap;
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
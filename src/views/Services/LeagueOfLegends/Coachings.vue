<template>
  <div class="services--container my-services">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Meus Coachings</h1>
    </div>
    <div v-if="!isLoadingServices" class="page-content">
      <div
        style="
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
        "
      >
        <h3 class="animated fadeIn service-categories">
          <a
            href="javascript:void(0)"
            @click="$bus.emit('reload-in-progress-services')"
            class="refresh-servies-button"
          >
            <ion-icon name="sync-outline"></ion-icon>
          </a>
        </h3>
      </div>
      <OverlayScrollbar v-if="inProgressCoachings && inProgressCoachings.length> 0"
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="coaching in inProgressCoachings"
            :key="coaching.id"
            class="service animated fadeIn"
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                flex-shrink: 0;
              "
            >
              <h3 style="margin-bottom: 3px">
                Serviço #{{ coaching.id }}
                <span class="description-icon" v-if="coaching.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="coaching.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="coaching.details.server">
                Servidor: {{ coaching.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">
                Cliente: {{ coaching.client.username }}
                <div
                  class="user-status"
                  :class="{ online: coaching.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(coaching)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary" style="flex-direction: column;">
              <div style="display: flex; flex-direction: row;">
                <div class="start-point">
                  <img :src="elos[coaching.details.current_tier]" />
                  <span v-if="coaching.details.current_tier !== 'unranked' && coaching.details.current_tier !== 'master' && 
                  coaching.details.current_tier !== 'grandmaster' && coaching.details.current_tier !== 'challenger'" style="white-space: nowrap">
                    <small>{{ coaching.details.current_division.toUpperCase() }}</small>
                  </span>
                </div>
                <div class="spacer"></div>
                <div class="destination-point">
                  <span
                    class="initial-type"
                    >{{ coaching.details.class_count }} aula(s)</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.type === 'classic'"
                    >Modelo: Clássico</span
                  >
                  <span
                    class="initial-type"
                    v-else-if="coaching.details.type === 'monochampion'"
                    >Modelo: Mono-champion</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.primary_route"
                    >Rota 1ª: {{ coaching.details.primary_route.toUpperCase() }}</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.secondary_route"
                    >Rota 2ª: {{ coaching.details.secondary_route.toUpperCase() }}</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.details"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="coaching.details.details"
                    >Dificuldades <ion-icon name="alert-circle-outline"></ion-icon></span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.time"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="coaching.details.time"
                    >Horários <ion-icon name="alert-circle-outline"></ion-icon></span
                  >
                </div>
              </div>
              <div v-if="coaching.details.type === 'classic'" class="coaching-champions">
                <ul>
                  <li v-for="selectedChampion in JSON.parse(coaching.details.coaching_form).selectedChampions" :key="selectedChampion">
                    <img :src="championImageUrl(selectedChampion)" />
                  </li>
                </ul>
              </div>
              <div v-else-if="coaching.details.type === 'monochampion'" class="coaching-champions">
                <ul>
                  <li>
                    <img :src="championImageUrl(JSON.parse(coaching.details.coaching_form).selectedChampion)" />
                  </li>
                </ul>
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="coaching.boosterAmount"
                    >R$ {{ coaching.boosterAmount.replace(".", ",") }}</span
                  >
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </OverlayScrollbar>
      <p v-else class="animated fadeIn">
        Nenhum serviço encontrado neste seção...
      </p>
    </div>
    <div
      v-else
      class="page-content"
      style="display: flex; align-items: center; justify-content: center"
    >
      <AppLoading
        class="animated fadeIn"
        :text="loadingServicesText"
      ></AppLoading>
    </div>
  </div>
</template>

<script>
import { useServicesStore } from '@/stores/services'
import { mapActions, mapState } from 'pinia'
import { badgeUrl } from '@/config/assets'
import { API_BASE_URL, championImageUrl } from '@/config/api'
;
export default {
  name: "Services",
    data() {
    return {
      activeTab: "inProgress",
      elos: {
        unranked: badgeUrl('unranked'),
        iron: badgeUrl('iron'),
        bronze: badgeUrl('bronze'),
        silver: badgeUrl('silver'),
        gold: badgeUrl('gold'),
        platinum: badgeUrl('platinum'),
        emerald: badgeUrl('emerald'),
        diamond: badgeUrl('diamond'),
        master: badgeUrl('master'),
        grandmaster: badgeUrl('grandmaster'),
        challenger: badgeUrl('challenger'),
      },
    };
  },
  computed: {
    ...mapState(useServicesStore, ["isLoadingServices", "loadingServicesText"]),
    ...mapState(useServicesStore, ["inProgressCoachings"]),
  },
  methods: {
    openService(service) {
      this.$router.push("/services/" + service.id);
    },
  },
};
</script>

<style scoped lang="scss">
@use "../services.scss";
  .coaching-champions {
    margin-top: 24px;
    ul {
      display: flex;
      flex-direction: row;
      margin: 0 auto;
      margin-top: 24px;
      flex-wrap: wrap;
      align-items: center;
      padding: 0;
      justify-content: center;
      margin-top: -3px;
      margin-bottom: -3px;
      width: 250px;
      li {
        list-style: none;
        margin: 3px;
      }
    }
    img {
      width: 38px;
      height: 38px;
    }
  }
</style>
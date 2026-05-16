<template>
  <div class="services--container my-services">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Minhas Análises de Replay</h1>
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
      <OverlayScrollbar v-if="inProgressReplayAnalyses && inProgressReplayAnalyses.length> 0"
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="replayAnalysis in inProgressReplayAnalyses"
            :key="replayAnalysis.id"
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
                Serviço #{{ replayAnalysis.id }}
                <span class="description-icon" v-if="replayAnalysis.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="replayAnalysis.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="replayAnalysis.details.server">
                Servidor: {{ replayAnalysis.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">
                Cliente: {{ replayAnalysis.client.username }}
                <div
                  class="user-status"
                  :class="{ online: replayAnalysis.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(replayAnalysis)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[replayAnalysis.details.tier]" />
                <span v-if="replayAnalysis.details.tier !== 'unranked' && replayAnalysis.details.tier !== 'master' && replayAnalysis.details.tier !== 'grandmaster' && replayAnalysis.details.tier !== 'challenger'" style="white-space: nowrap">
                  <small>{{ replayAnalysis.details.division.toUpperCase() }}</small>
                </span>
              </div>
              <div class="spacer"></div>
              <div class="destination-point">
                <img style="margin-bottom: 8px;" :src="championImageUrl(replayAnalysis.details.id_champion)" />
                <span
                  class="initial-type"
                  >Rota: {{ replayAnalysis.details.route.toUpperCase() }}</span
                >
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="replayAnalysis.boosterAmount"
                    >R$ {{ replayAnalysis.boosterAmount.replace(".", ",") }}</span
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
import { badgeUrl } from '@/config/assets'
import { API_BASE_URL, championImageUrl } from '@/config/api'
import { mapState, mapMutations, mapGetters } from "@/stores/compat";
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
    ...mapState("services", ["isLoadingServices", "loadingServicesText"]),
    ...mapGetters("services", ["inProgressReplayAnalyses"]),
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
</style>
<template>
  <div class="services--container my-services">
    <div class="page-title animated fadeIn">
      <AppTftIcon class="game-icon"></AppTftIcon>
      <h1>Minhas Md5's</h1>
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
      <OverlayScrollbar v-if=" inProgressTftPlacements && inProgressTftPlacements.length> 0
        "
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="service in inProgressTftPlacements"
            :key="service.id"
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
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ service: 'right', arrow: true }"
                    :content="service.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">
                Servidor: {{ service.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">
                Cliente: {{ service.client.username }}
                <div
                  class="user-status"
                  :class="{ online: service.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(service)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[service.details.initial_tier]" />
                <span style="white-space: nowrap">Elo anterior</span>
              </div>
              <div class="spacer"></div>
              <div class="destination-point">
                <span class="initial-type" style="white-space: nowrap"
                  >{{ service.details.games }} vitórias</span
                >
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong
                    ><ion-icon name="hourglass-outline"></ion-icon
                  ></strong>
                  <span v-if="service.details.date_deadline"
                    >Até {{ formatDate(service.details.date_deadline) }}</span
                  >
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="service.boosterAmount"
                    >R$ {{ service.boosterAmount.replace(".", ",") }}</span
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
;
import dayjs from "dayjs";
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
    ...mapState(useServicesStore, ["inProgressTftPlacements"]),
  },
  methods: {
    formatDate(dateDeadline) {
      return dayjs(dateDeadline).format("DD/MM/YY HH:mm");
    },
    openService(service) {
      this.$router.push("/services/" + service.id);
    },
    hasDivision(tier) {
      return (
        tier !== "unranked" &&
        tier !== "master" &&
        tier !== "grandmaster" &&
        tier !== "challenger"
      );
    },
  },
};
</script>

<style scoped lang="scss">
@use "../services.scss";
</style>
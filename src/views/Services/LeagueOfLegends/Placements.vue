<template>
  <div class="services--container my-services">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Minhas Classificatórias</h1>
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
      <OverlayScrollbar v-if="inProgressPlacements && inProgressPlacements.length> 0"
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="placement in inProgressPlacements"
            :key="placement.id"
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
                Serviço #{{ placement.id }}
                <span class="description-icon" v-if="placement.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="placement.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="placement.details.server">
                Servidor: {{ placement.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">
                Cliente: {{ placement.client.username }}
                <div
                  class="user-status"
                  :class="{ online: placement.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(placement)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[placement.details.initial_tier]" />
                <span
                  v-if="hasDivision(placement.details.initial_tier)"
                  style="white-space: nowrap"
                  >{{ placement.details.initial_division.toUpperCase() }}</span
                >
              </div>
              <div class="spacer"></div>
              <div class="destination-point">
                <span
                  class="initial-type"
                  v-if="placement.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span
                  class="initial-type"
                  v-else-if="placement.details.queue === 'flex'"
                  >Flex</span
                >
                <span
                  class="initial-type"
                  v-if="placement.details.type === 'duo'"
                  style="white-space: nowrap"
                  >Duo Boost</span
                >
                <span class="initial-type" v-else style="white-space: nowrap"
                  >Boost</span
                >
                <span class="initial-type" style="white-space: nowrap"
                  >{{ placement.details.games }} vitórias</span
                >
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong
                    ><ion-icon name="hourglass-outline"></ion-icon
                  ></strong>
                  <span v-if="placement.details.date_deadline"
                    >Até {{ formatDate(placement.details.date_deadline) }}</span
                  >
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="placement.boosterAmount"
                    >R$ {{ placement.boosterAmount.replace(".", ",") }}</span
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
import { mapState, mapMutations, mapGetters } from "@/stores/compat";
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
    ...mapState("services", ["isLoadingServices", "loadingServicesText"]),
    ...mapGetters("services", ["inProgressPlacements"]),
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
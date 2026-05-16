<template>
  <div class="services--container my-services">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Meus Win Boosts</h1>
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
      <OverlayScrollbar v-if="inProgressWinBoosts && inProgressWinBoosts.length> 0"
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="winBoost in inProgressWinBoosts"
            :key="winBoost.id"
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
                Serviço #{{ winBoost.id }}
                <span class="description-icon" v-if="winBoost.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="winBoost.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="winBoost.details.server">
                Servidor: {{ winBoost.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">
                Cliente: {{ winBoost.client.username }}
                <div
                  class="user-status"
                  :class="{ online: winBoost.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(winBoost)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[winBoost.details.initial_tier]" />
                <span style="white-space: nowrap">
                  <strong v-if="hasDivision(winBoost.details.initial_tier)">{{
                    winBoost.details.initial_division.toUpperCase()
                  }}</strong>
                  <small v-if="winBoost.details.initial_tier !== 'unranked'"
                    >({{
                      winBoost.details.initial_lp
                        ? winBoost.details.initial_lp
                        : 0
                    }}
                    LP's)</small
                  >
                </span>
              </div>
              <div class="spacer"></div>
              <div class="destination-point">
                <span
                  class="initial-type"
                  v-if="winBoost.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span
                  class="initial-type"
                  v-else-if="winBoost.details.queue === 'flex'"
                  >Flex</span
                >
                <span class="initial-type" style="white-space: nowrap"
                  >{{ winBoost.details.desired_victories }} vitórias</span
                >
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong
                    ><ion-icon name="hourglass-outline"></ion-icon
                  ></strong>
                  <span v-if="winBoost.details.date_deadline"
                    >Até {{ formatDate(winBoost.details.date_deadline) }}</span
                  >
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="winBoost.boosterAmount"
                    >R$ {{ winBoost.boosterAmount.replace(".", ",") }}</span
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
    ...mapGetters("services", ["inProgressWinBoosts"]),
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
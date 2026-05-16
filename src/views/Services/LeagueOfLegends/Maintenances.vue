<template>
  <div class="services--container my-services">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Minhas Manutenções de Elo</h1>
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
      <OverlayScrollbar v-if="inProgressMaintenances && inProgressMaintenances.length> 0"
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="maintenance in inProgressMaintenances"
            :key="maintenance.id"
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
                Serviço #{{ maintenance.id }}
                <span class="description-icon" v-if="maintenance.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="maintenance.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="maintenance.details.server">
                Servidor: {{ maintenance.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">
                Cliente: {{ maintenance.client.username }}
                <div
                  class="user-status"
                  :class="{ online: maintenance.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(maintenance)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[maintenance.details.tier]" />
                <span style="white-space: nowrap">
                  <small>({{ maintenance.details.lp }} LP's)</small>
                </span>
              </div>
              <div class="spacer"></div>
              <div class="destination-point">
                <span
                  class="initial-type"
                  v-if="maintenance.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span
                  class="initial-type"
                  v-else-if="maintenance.details.queue === 'flex'"
                  >Flex</span
                >
                <span
                  class="initial-type"
                  >{{ maintenance.details.weeks }} semana(s)</span
                >
                <span
                  class="initial-type"
                  >{{ maintenance.details.decay_days }} dia(s) para decaimento</span
                >
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="maintenance.boosterAmount"
                    >R$ {{ maintenance.boosterAmount.replace(".", ",") }}</span
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
    ...mapGetters("services", ["inProgressMaintenances"]),
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
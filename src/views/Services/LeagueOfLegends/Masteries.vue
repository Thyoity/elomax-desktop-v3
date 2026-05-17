<template>
  <div class="services--container my-services masteries">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Meus Serviços de Maestria</h1>
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
      <OverlayScrollbar v-if="inProgressMasteries && inProgressMasteries.length> 0"
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="mastery in inProgressMasteries"
            :key="mastery.id"
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
                Serviço #{{ mastery.id }}
                <span class="description-icon" v-if="mastery.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="mastery.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="mastery.details.server">
                Servidor: {{ mastery.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">
                Cliente: {{ mastery.client.username }}
                <div
                  class="user-status"
                  :class="{ online: mastery.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(mastery)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary">
              <div v-for="championToMaster in mastery.details.services" :key="championToMaster.champion" class="mastery-champion">
                <img :src="championImageUrl(championToMaster.champion)" />
                <span>{{ championToMaster.initial_mastery }}</span>
                <div class="arrow-icon">
                  <ion-icon name="arrow-forward-outline"></ion-icon>
                </div>
                <span>{{ championToMaster.desired_mastery }}</span>
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong
                    ><ion-icon name="hourglass-outline"></ion-icon
                  ></strong>
                  <span v-if="mastery.details.date_deadline"
                    >Até {{ formatDate(mastery.details.date_deadline) }}</span
                  >
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="mastery.boosterAmount"
                    >R$ {{ mastery.boosterAmount.replace(".", ",") }}</span
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
    ...mapState(useServicesStore, ["inProgressMasteries"]),
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
  mounted() {
    console.log(this.inProgressMasteries)
  }
};
</script>

<style scoped lang="scss">
@use "../services.scss";
.services--container.my-services.masteries {
  .service .service-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .mastery-champion {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0px;
      }
      img {
        margin-right: 20px;
      }
    }
  }
}
</style>
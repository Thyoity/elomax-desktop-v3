<template>
  <div class="services--container my-services">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Meus Duo Boosts</h1>
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
      <OverlayScrollbar v-if="inProgressDuoBoosts && inProgressDuoBoosts.length> 0"
        style="height: calc(100% - 100px)"
      >
        <div class="service-list">
          <div
            v-for="duoBoost in inProgressDuoBoosts"
            :key="duoBoost.id"
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
                Serviço #{{ duoBoost.id }}
                <span class="description-icon" v-if="duoBoost.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="duoBoost.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="duoBoost.details.server">
                Servidor: {{ duoBoost.details.server.toUpperCase() }}
              </h5>
              <h5
                class="plan"
                v-if="
                  duoBoost.details.plan && parseInt(duoBoost.details.plan) === 1
                "
              >
                Plano: Básico
              </h5>
              <h5
                class="plan"
                v-else-if="
                  duoBoost.details.plan && parseInt(duoBoost.details.plan) === 2
                "
              >
                Plano: Estendido
              </h5>
              <h5
                class="plan"
                v-else-if="
                  duoBoost.details.plan && parseInt(duoBoost.details.plan) === 3
                "
              >
                Plano: Premium
              </h5>
              <h5 class="play-time" v-if="duoBoost.details.play_time" style="margin-top: 0;" v-tippy="{ placement: 'right', arrow: true }" :content="duoBoost.details.play_time">Horário: <span class="description-icon" style="margin-left: 3px;" >
                <ion-icon style="top: 2px; position: relative;" name="time-outline"></ion-icon>
              </span></h5>
              <h5 class="client">
                Cliente: {{ duoBoost.client.username }}
                <div
                  class="user-status"
                  :class="{ online: duoBoost.client.isOnline }"
                ></div>
              </h5>
              <button @click="openService(duoBoost)" class="open-service">
                Acompanhar
              </button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[duoBoost.details.initial_tier]" />
                <span style="white-space: nowrap">
                  <strong v-if="hasDivision(duoBoost.details.initial_tier)">{{
                    duoBoost.details.initial_division.toUpperCase()
                  }}</strong>
                  <small v-if="duoBoost.details.initial_tier !== 'unranked'"
                    >({{
                      duoBoost.details.initial_lp
                        ? duoBoost.details.initial_lp
                        : 0
                    }}
                    LP's)</small
                  >
                </span>
              </div>
              <div
                v-if="duoBoost.details.type === 'division'"
                class="arrow-icon"
              >
                <span v-if="duoBoost.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span v-else-if="duoBoost.details.queue === 'flex'">Flex</span>
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
              <div v-else class="spacer"></div>
              <div
                v-if="duoBoost.details.type === 'division'"
                class="destination-point"
              >
                <img :src="elos[duoBoost.details.desired_tier]" />
                <span
                  v-if="hasDivision(duoBoost.details.desired_tier)"
                  style="white-space: nowrap"
                  >{{ duoBoost.details.desired_division.toUpperCase() }}</span
                >
              </div>
              <div v-else class="destination-point">
                <span
                  class="initial-type"
                  v-if="duoBoost.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span
                  class="initial-type"
                  v-else-if="duoBoost.details.queue === 'flex'"
                  >Flex</span
                >
                <span class="initial-type" style="white-space: nowrap"
                  >{{ duoBoost.details.desired_victories }} vitórias</span
                >
              </div>
            </div>
            <div class="service-details">
              <ul>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="duoBoost.boosterAmount"
                    >R$ {{ duoBoost.boosterAmount.replace(".", ",") }}</span
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
    ...mapGetters("services", ["inProgressDuoBoosts"]),
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
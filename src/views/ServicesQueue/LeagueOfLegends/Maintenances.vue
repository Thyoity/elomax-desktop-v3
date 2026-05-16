<template>
  <div class="services-queue--container services-queue">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Manutenções de Elo na Fila</h1>
    </div>
    <div v-if="!isLoadingServicesQueue" class="page-content">
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
            @click="$bus.emit('reload-services-queue')"
            class="refresh-servies-button"
          >
            <ion-icon name="sync-outline"></ion-icon>
          </a>
        </h3>
      </div>
      <OverlayScrollbar v-if="queueMaintenances && queueMaintenances.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="maintenance in queueMaintenances"
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
              <h5 class="client">Cliente: {{ maintenance.client.username }}</h5>
              <AppAcceptServiceButton
                :modal-params="{
                  serviceId: maintenance.id,
                  dateAcceptable: maintenance.dateAcceptable,
                }"
              ></AppAcceptServiceButton>
            </div>
            <div class="service-details">
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

            <div class="extras-list">
              <ul
                v-if="maintenance.details.extras && maintenance.details.extras.length"
              >
                <li v-for="extra in maintenance.details.extras" :key="extra.type">
                  <AppExtra
                    class="extra"
                    :type="extra.type"
                    :value="extra.value"
                  ></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos</p>
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
        :text="loadingServicesQueueText"
      ></AppLoading>
    </div>
  </div>
</template>

<script>
import { badgeUrl } from '@/config/assets'
import { mapState, mapMutations } from "@/stores/compat";
export default {
  name: "ServicesQueue",
    data() {
    return {
      activeTab: "maintenances",
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
    ...mapState("services-queue", [
      "isLoadingServicesQueue",
      "loadingServicesQueueText",
      "queueMaintenances",
    ]),
  },
  methods: {
    ...mapMutations("settings", ["SET_DEFAULT_GAME"]),
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
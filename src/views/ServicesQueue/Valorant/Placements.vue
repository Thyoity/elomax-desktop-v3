<template>
  <div class="services-queue--container services-queue">
    <div class="page-title animated fadeIn">
      <AppValorantIcon class="game-icon"></AppValorantIcon>
      <h1>Md5's na Fila</h1>
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
      <OverlayScrollbar v-if="queueValorantPlacements && queueValorantPlacements.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="service in queueValorantPlacements"
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
              <h5 class="client">Cliente: {{ service.client.username }}</h5>
              <AppAcceptServiceButton
                :modal-params="{
                  serviceId: service.id,
                  dateAcceptable: service.dateAcceptable,
                }"
              ></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[service.details.initial_tier]" />
                <span
                  v-if="hasDivision(service.details.initial_tier)"
                  style="white-space: nowrap"
                  >{{ service.details.initial_division.toUpperCase() }}</span
                >
              </div>
              <div class="spacer"></div>
              <div class="destination-point">
                <span class="initial-type" style="white-space: nowrap"
                  >{{ service.details.games }} vitórias</span
                >
              </div>
            </div>

            <div class="extras-list">
              <ul
                v-if="service.details.extras && service.details.extras.length"
              >
                <li v-for="extra in service.details.extras" :key="extra.type">
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
import { valorantBadgeUrl } from '@/config/assets'
import { mapState, mapMutations } from "@/stores/compat";
export default {
  name: "ServicesQueue",
    data() {
    return {
      activeTab: "eloBoosts",
      elos: {
        unranked: valorantBadgeUrl('unranked'),
        iron: valorantBadgeUrl('iron'),
        bronze: valorantBadgeUrl('bronze'),
        silver: valorantBadgeUrl('silver'),
        gold: valorantBadgeUrl('gold'),
        platinum: valorantBadgeUrl('platinum'),
        diamond: valorantBadgeUrl('diamond'),
        ascendant: valorantBadgeUrl('ascendant'),
        immortal: valorantBadgeUrl('immortal'),
        radiant: valorantBadgeUrl('radiant'),
      },
    };
  },
  computed: {
    ...mapState("services-queue", [
      "isLoadingServicesQueue",
      "loadingServicesQueueText",
      "queueValorantPlacements",
    ]),
  },
  methods: {
    ...mapMutations("settings", ["setDefaultGame"]),
    hasDivision(tier) {
      return (
        tier !== "unranked" &&
        tier !== "radiant"
      );
    },
  },
};
</script>

<style scoped lang="scss">
@use "../services.scss";
</style>
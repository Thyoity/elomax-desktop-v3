<template>
  <div class="services-queue--container services-queue">
    <div class="page-title animated fadeIn">
      <AppTftIcon class="game-icon"></AppTftIcon>
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
      <OverlayScrollbar v-if="queueTftPlacements && queueTftPlacements.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="service in queueTftPlacements"
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
                <span style="white-space: nowrap">Elo anterior</span>
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
import { badgeUrl } from '@/config/assets'
import { mapState } from "pinia";
import { useServicesQueueStore } from "@/stores/services-queue";
export default {
  name: "ServicesQueue",
    data() {
    return {
      activeTab: "eloBoosts",
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
    ...mapState(useServicesQueueStore, [
      "isLoadingServicesQueue",
      "loadingServicesQueueText",
      "queueTftPlacements",
    ]),
  },
};
</script>

<style scoped lang="scss">
@use "../services.scss";
</style>
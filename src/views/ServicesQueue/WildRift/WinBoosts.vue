<template>
  <div class="services-queue--container services-queue">
    <div class="page-title animated fadeIn">
      <AppWildRiftIcon class="game-icon"></AppWildRiftIcon>
      <h1>Win Boosts na Fila</h1>
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
      <OverlayScrollbar v-if="queueWildRiftWinBoosts && queueWildRiftWinBoosts.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="service in queueWildRiftWinBoosts"
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
                    v-tippy="{ placement: 'right', arrow: true }"
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
                <span style="white-space: nowrap">
                  <strong v-if="hasDivision(service.details.initial_tier)">{{
                    service.details.initial_division.toUpperCase()
                  }}</strong>
                  <small v-if="service.details.initial_tier !== 'unranked'"
                    >({{
                      service.details.initial_lp
                        ? service.details.initial_lp
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
                  v-if="service.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span
                  class="initial-type"
                  v-else-if="service.details.queue === 'flex'"
                  >Flex</span
                >
                <span class="initial-type" style="white-space: nowrap"
                  >{{ service.details.desired_victories }} vitórias</span
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
import { useSettingsStore } from '@/stores/settings'
import { useServicesQueueStore } from '@/stores/services-queue'
import { mapActions, mapState } from 'pinia'
import { badgeUrl } from '@/config/assets'
;
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
      "queueWildRiftWinBoosts",
    ]),
  },
  methods: {
    ...mapActions(useSettingsStore, ["setDefaultGame"]),
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
<template>
  <div class="services-queue--container services-queue">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Elo Boosts na Fila</h1>
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
      <OverlayScrollbar v-if="queueEloBoosts && queueEloBoosts.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="eloBoost in queueEloBoosts"
            :key="eloBoost.id"
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
                Serviço #{{ eloBoost.id }}
                <span class="description-icon" v-if="eloBoost.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="eloBoost.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="eloBoost.details.server">
                Servidor: {{ eloBoost.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">Cliente: {{ eloBoost.client.username }}</h5>
              <AppAcceptServiceButton
                :modal-params="{
                  serviceId: eloBoost.id,
                  dateAcceptable: eloBoost.dateAcceptable,
                }"
              ></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[eloBoost.details.initial_tier]" />
                <span style="white-space: nowrap">
                  <strong v-if="hasDivision(eloBoost.details.initial_tier)">{{
                    eloBoost.details.initial_division.toUpperCase()
                  }}</strong>
                  <small v-if="eloBoost.details.initial_tier !== 'unranked'"
                    >({{
                      eloBoost.details.initial_lp
                        ? eloBoost.details.initial_lp
                        : 0
                    }}
                    LP's)</small
                  >
                </span>
              </div>
              <div class="arrow-icon">
                <span v-if="eloBoost.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span v-else-if="eloBoost.details.queue === 'flex'">Flex</span>
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
              <div class="destination-point">
                <img :src="elos[eloBoost.details.desired_tier]" />
                <span
                  v-if="hasDivision(eloBoost.details.desired_tier)"
                  style="white-space: nowrap"
                  >{{ eloBoost.details.desired_division.toUpperCase() }}</span
                >
              </div>
            </div>

            <div class="extras-list">
              <ul
                v-if="eloBoost.details.extras && eloBoost.details.extras.length"
              >
                <li v-for="extra in eloBoost.details.extras" :key="extra.type">
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
      "queueEloBoosts",
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
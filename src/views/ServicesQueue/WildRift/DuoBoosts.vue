<template>
  <div class="services-queue--container services-queue">
    <div class="page-title animated fadeIn">
      <AppWildRiftIcon class="game-icon"></AppWildRiftIcon>
      <h1>Duo Boosts na Fila</h1>
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
      <OverlayScrollbar v-if="queueWildRiftDuoBoosts && queueWildRiftDuoBoosts.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="service in queueWildRiftDuoBoosts"
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
              <h5
                class="plan"
                v-if="
                  service.details.plan && parseInt(service.details.plan) === 1
                "
              >
                Plano: Básico
              </h5>
              <h5
                class="plan"
                v-else-if="
                  service.details.plan && parseInt(service.details.plan) === 2
                "
              >
                Plano: Estendido
              </h5>
              <h5
                class="plan"
                v-else-if="
                  service.details.plan && parseInt(service.details.plan) === 3
                "
              >
                Plano: Premium
              </h5>
              <h5 class="play-time" v-if="service.details.play_time" style="margin-top: 0;" v-tippy="{ placement: 'right', arrow: true }" :content="service.details.play_time">Horário: <span class="description-icon" >
                <ion-icon style="top: 2px; position: relative;" name="time-outline"></ion-icon>
              </span></h5>
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
              <div
                v-if="service.details.type === 'division'"
                class="arrow-icon"
              >
                <span v-if="service.details.queue === 'solo_duo'"
                  >Solo / Duo</span
                >
                <span v-else-if="service.details.queue === 'flex'">Flex</span>
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
              <div v-else class="spacer"></div>
              <div
                v-if="service.details.type === 'division'"
                class="destination-point"
              >
                <img :src="elos[service.details.desired_tier]" />
                <span
                  v-if="hasDivision(service.details.desired_tier)"
                  style="white-space: nowrap"
                  >{{ service.details.desired_division.toUpperCase() }}</span
                >
              </div>
              <div v-else class="destination-point">
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
import { badgeUrl } from '@/config/assets'
import { mapState, mapMutations } from "@/stores/compat";
export default {
  name: "ServicesQueue",
    data() {
    return {
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
      "queueWildRiftDuoBoosts",
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
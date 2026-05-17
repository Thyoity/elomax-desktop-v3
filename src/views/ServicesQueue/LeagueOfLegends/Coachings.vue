<template>
  <div class="services-queue--container services-queue">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Coachings na Fila</h1>
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
      <OverlayScrollbar v-if="queueCoachings && queueCoachings.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="coaching in queueCoachings"
            :key="coaching.id"
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
                Serviço #{{ coaching.id }}
                <span class="description-icon" v-if="coaching.description">
                  <ion-icon
                    name="alert-circle-outline"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="coaching.description"
                  ></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="coaching.details.server">
                Servidor: {{ coaching.details.server.toUpperCase() }}
              </h5>
              <h5 class="client">Cliente: {{ coaching.client.username }}</h5>
              <AppAcceptServiceButton
                :modal-params="{
                  serviceId: coaching.id,
                  dateAcceptable: coaching.dateAcceptable,
                }"
              ></AppAcceptServiceButton>
            </div>
            <div class="service-details" style="flex-direction: column;">
              <div style="display: flex; flex-direction: row;">
                <div class="start-point">
                  <img :src="elos[coaching.details.current_tier]" />
                  <span v-if="coaching.details.current_tier !== 'unranked' && coaching.details.current_tier !== 'master' && 
                  coaching.details.current_tier !== 'grandmaster' && coaching.details.current_tier !== 'challenger'" style="white-space: nowrap">
                    <small>{{ coaching.details.current_division.toUpperCase() }}</small>
                  </span>
                </div>
                <div class="spacer"></div>
                <div class="destination-point">
                  <span
                    class="initial-type"
                    >{{ coaching.details.class_count }} aula(s)</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.type === 'classic'"
                    >Modelo: Clássico</span
                  >
                  <span
                    class="initial-type"
                    v-else-if="coaching.details.type === 'monochampion'"
                    >Modelo: Mono-champion</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.primary_route"
                    >Rota 1ª: {{ coaching.details.primary_route.toUpperCase() }}</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.secondary_route"
                    >Rota 2ª: {{ coaching.details.secondary_route.toUpperCase() }}</span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.details"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="coaching.details.details"
                    >Dificuldades <ion-icon name="alert-circle-outline"></ion-icon></span
                  >
                  <span
                    class="initial-type"
                    v-if="coaching.details.time"
                    v-tippy="{ placement: 'right', arrow: true }"
                    :content="coaching.details.time"
                    >Horários <ion-icon name="alert-circle-outline"></ion-icon></span
                  >
                </div>
              </div>
              <div v-if="coaching.details.type === 'classic'" class="coaching-champions">
                <ul>
                  <li v-for="selectedChampion in JSON.parse(coaching.details.coaching_form).selectedChampions" :key="selectedChampion">
                    <img :src="championImageUrl(selectedChampion)" />
                  </li>
                </ul>
              </div>
              <div v-else-if="coaching.details.type === 'monochampion'" class="coaching-champions">
                <ul>
                  <li>
                    <img :src="championImageUrl(JSON.parse(coaching.details.coaching_form).selectedChampion)" />
                  </li>
                </ul>
              </div>
            </div>

            <div class="extras-list">
              <ul
                v-if="coaching.details.extras && coaching.details.extras.length"
              >
                <li v-for="extra in coaching.details.extras" :key="extra.type">
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
import { API_BASE_URL, championImageUrl } from '@/config/api'
import { mapState, mapMutations } from "@/stores/compat";
export default {
  name: "ServicesQueue",
    data() {
    return {
      activeTab: "coachings",
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
      "queueCoachings",
    ]),
  },
  methods: {
    ...mapMutations("settings", ["setDefaultGame"]),
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
  .coaching-champions {
    margin-top: 24px;
    ul {
      display: flex;
      flex-direction: row;
      margin: 0 auto;
      margin-top: 24px;
      flex-wrap: wrap;
      align-items: center;
      padding: 0;
      justify-content: center;
      margin-top: -3px;
      margin-bottom: -3px;
      width: 250px;
      li {
        list-style: none;
        margin: 3px;
      }
    }
    img {
      width: 38px;
      height: 38px;
    }
  }
</style>
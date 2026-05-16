<template>
  <div class="services-queue--container services-queue masteries">
    <div class="page-title animated fadeIn">
      <AppLeagueOfLegendsIcon
        class="game-icon"
      ></AppLeagueOfLegendsIcon>
      <h1>Serviços de Maestria na Fila</h1>
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
      <OverlayScrollbar v-if="queueMasteries && queueMasteries.length> 0"
        class="scroll-container"
      >
        <div class="service-list">
          <div
            v-for="mastery in queueMasteries"
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
              <h5 class="client">Cliente: {{ mastery.client.username }}</h5>
              <AppAcceptServiceButton
                :modal-params="{
                  serviceId: mastery.id,
                  dateAcceptable: mastery.dateAcceptable,
                }"
              ></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div v-for="championToMaster in mastery.details.services" :key="championToMaster.champion" class="mastery-champion">
                <img :src="championImageUrl(championToMaster.champion)" />
                <span>{{ championToMaster.initial_mastery }}</span>
                <div class="arrow-icon">
                  <ion-icon name="arrow-forward-outline"></ion-icon>
                </div>
                <span>{{ championToMaster.desired_mastery }}</span>
              </div>
            </div>

            <div class="extras-list">
              <ul
                v-if="mastery.details.extras && mastery.details.extras.length"
              >
                <li v-for="extra in mastery.details.extras" :key="extra.type">
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
      activeTab: "masteries",
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
      "queueMasteries",
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
.services-queue--container.services-queue.masteries {
  .service .service-details {
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
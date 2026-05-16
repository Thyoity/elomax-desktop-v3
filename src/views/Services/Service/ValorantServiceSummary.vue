<template>
  <div>
    <div
      v-if="service.type === 'valorantEloBoost'"
      class="tab-row service-details animated fadeIn"
      style="animation-delay: 0.15s"
    >
      <h3>
        Elo Boost ({{
          service.details.server
            ? service.details.server.toUpperCase()
            : "BR"
        }})
      </h3>
      <div class="road">
        <div class="start-point">
          <img :src="eloImgs[service.details.initial_tier]" />
          <span style="white-space: nowrap">
            <strong v-if="hasDivision(service.details.initial_tier)">{{
              service.details.initial_division.toUpperCase()
            }}</strong>
            <small v-if="service.details.initial_tier !== 'unranked'"
              >({{ service.details.initial_lp }} LP's)</small
            >
          </span>
        </div>
        <div class="arrow-icon">
          <ion-icon name="arrow-forward-outline"></ion-icon>
        </div>
        <div class="destination-point">
          <img :src="eloImgs[service.details.desired_tier]" />
          <span
            v-if="hasDivision(service.details.desired_tier)"
            style="white-space: nowrap"
            >{{ service.details.desired_division.toUpperCase() }}</span
          >
        </div>
      </div>
    </div>
    <div
      v-else-if="service.type === 'valorantPlacement'"
      class="tab-row service-details animated fadeIn"
      style="animation-delay: 0.15s"
    >
      <h3>
        Md5 ({{
          service.details.server
            ? service.details.server.toUpperCase()
            : "BR"
        }})
      </h3>
      <div class="road">
        <div class="start-point">
          <img :src="eloImgs[service.details.initial_tier]" />
          <span
            v-if="hasDivision(service.details.initial_tier)"
            style="white-space: nowrap"
            >{{ service.details.initial_division.toUpperCase() }}</span
          >
        </div>
        <div class="spacer"></div>
        <div class="destination-point">
          <span class="initial-type" style="white-space: nowrap"
            >{{ service.details.games }} partidas</span
          >
        </div>
      </div>
    </div>
    <div
      v-else-if="service.type === 'valorantDuoBoost'"
      class="tab-row service-details animated fadeIn"
      style="animation-delay: 0.15s"
    >
      <h3>
        Duo Boost
        <span
          v-if="service.details.plan === 'basic'"
          >(Básico)</span
        ><span
          v-else-if="
            service.details.plan === 'premium'
          "
          >(Premium)</span
        >
        ({{
          service.details.server
            ? service.details.server.toUpperCase()
            : "BR"
        }})
      </h3>
      <div class="road">
        <div class="start-point">
          <img :src="eloImgs[service.details.initial_tier]" />
          <span style="white-space: nowrap">
            <strong v-if="hasDivision(service.details.initial_tier)">{{
              service.details.initial_division.toUpperCase()
            }}</strong>
            <small v-if="service.details.initial_tier !== 'unranked'"
              >({{
                service.details.initial_lp ? service.details.initial_lp : 0
              }}
              LP's)</small
            >
          </span>
        </div>
        <div v-if="service.details.type === 'division'" class="arrow-icon">
          <ion-icon name="arrow-forward-outline"></ion-icon>
        </div>
        <div v-else class="spacer"></div>
        <div
          v-if="service.details.type === 'division'"
          class="destination-point"
        >
          <img :src="eloImgs[service.details.desired_tier]" />
          <span
            v-if="hasDivision(service.details.desired_tier)"
            style="white-space: nowrap"
            >{{ service.details.desired_division.toUpperCase() }}</span
          >
        </div>
        <div v-else class="destination-point">
          <span class="initial-type" style="white-space: nowrap"
            >{{ service.details.desired_victories }} vitórias</span
          >
        </div>
      </div>
    </div>
    <div
      v-else-if="service.type === 'valorantWinBoost'"
      class="tab-row service-details animated fadeIn"
      style="animation-delay: 0.15s"
    >
      <h3>
        Win Boost ({{
          service.details.server
            ? service.details.server.toUpperCase()
            : "BR"
        }})
      </h3>
      <div class="road">
        <div class="start-point">
          <img :src="eloImgs[service.details.initial_tier]" />
          <span style="white-space: nowrap">
            <strong v-if="hasDivision(service.details.initial_tier)">{{
              service.details.initial_division.toUpperCase()
            }}</strong>
            <small v-if="service.details.initial_tier !== 'unranked'"
              >({{
                service.details.initial_lp ? service.details.initial_lp : 0
              }}
              LP's)</small
            >
          </span>
        </div>
        <div class="spacer"></div>
        <div class="destination-point">
          <span class="initial-type" style="white-space: nowrap"
            >{{ service.details.desired_victories }} vitórias</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { valorantBadgeUrl } from '@/config/assets'
export default {
  props: ["service"],
  computed: {},
  data() {
    return {
      eloImgs: {
        unranked: valorantBadgeUrl('unranked'),
        iron: valorantBadgeUrl('iron'),
        bronze: valorantBadgeUrl('bronze'),
        silver: valorantBadgeUrl('silver'),
        gold: valorantBadgeUrl('gold'),
        platinum: valorantBadgeUrl('platinum'),
        diamond: valorantBadgeUrl('diamond'),
        ascendant: valorantBadgeUrl('ascendant'),
        immortal: valorantBadgeUrl('immortal'),
        radiant: valorantBadgeUrl('radiant')
      },
    };
  },
  methods: {
    hasDivision(tier) {
      return (
        tier !== "unranked" &&
        tier !== "radiant"
      );
    },
  },
  mounted() {
    console.log(this.service.details)
  },
  beforeUnmount() {},
};
</script>
<style lang="scss" scoped>
</style>
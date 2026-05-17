<template>
  <div>
    <div
      v-if="service.type === 'tftPass'"
      class="tab-row service-details animated fadeIn"
      style="animation-delay: 0.15s"
    >
      <h3>
        Passe ({{
          service.details.server ? service.details.server.toUpperCase() : "BR"
        }})
      </h3>
      <div class="road">
        <div class="start-point">
          <img :src="tftPassImg" />
          <span style="white-space: nowrap">
            Nv. {{ service.details.initial_level }}
          </span>
        </div>
        <div class="arrow-icon">
          <ion-icon name="arrow-forward-outline"></ion-icon>
        </div>
        <div class="destination-point">
          <img :src="tftPassImg" />
          <span style="white-space: nowrap">
            Nv. {{ service.details.desired_level }}
          </span>
        </div>
      </div>
    </div>
    <div
      v-if="service.type === 'tftEloBoost'"
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
      v-else-if="service.type === 'tftPlacement'"
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
          <span style="white-space: nowrap">Elo anterior</span
          >
        </div>
        <div class="spacer"></div>
        <div class="destination-point">
          <span class="initial-type" style="white-space: nowrap"
            >{{ service.details.games }} vitórias</span
          >
        </div>
      </div>
    </div>
    <div
      v-else-if="service.type === 'tftWinBoost'"
      class="tab-row service-details animated fadeIn"
      style="animation-delay: 0.15s"
    >
      <h3>
        Win Boost ({{
          service.details.server ? service.details.server.toUpperCase() : "BR"
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
import { badgeUrl, imageUrl } from '@/config/assets'
import axios from "axios";
export default {
  props: ["service"],
  computed: {},
  data() {
    return {
      tftPassImg: imageUrl('tft-pass'),
      eloImgs: {
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
  methods: {
    hasDivision(tier) {
      return (
        tier !== "unranked" &&
        tier !== "master" &&
        tier !== "grandmaster" &&
        tier !== "challenger"
      );
    },
  },
  mounted() {},
  beforeUnmount() {},
};
</script>
<style lang="scss" scoped>
</style>
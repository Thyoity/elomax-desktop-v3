<template>
  <div>
    <h1 class="my-services-title">Meus Serviços</h1>
    <section class="my-services-section">
      <h3 class="my-services-section__title">
        League of Legends
        <span v-if="inProgressLeagueOfLegendsServicesCount">({{ inProgressLeagueOfLegendsServicesCount }})</span>
      </h3>
      <ul class="my-services-list">
        <li
          v-for="item in leagueOfLegendsItems"
          :key="item.path"
          :class="{ 'my-services-list__item--active': $route.path.includes(item.path) }"
          class="my-services-list__item"
          @click="goToRoute(item.path)"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </li>
      </ul>
    </section>

    <section class="my-services-section">
      <h3 class="my-services-section__title">
        Valorant
        <span v-if="inProgressValorantServicesCount">({{ inProgressValorantServicesCount }})</span>
      </h3>
      <ul class="my-services-list">
        <li
          v-for="item in valorantItems"
          :key="item.path"
          :class="{ 'my-services-list__item--active': $route.path.includes(item.path) }"
          class="my-services-list__item"
          @click="goToRoute(item.path)"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </li>
      </ul>
    </section>

    <section class="my-services-section">
      <h3 class="my-services-section__title">
        Wild Rift
        <span v-if="inProgressWildRiftServicesCount">({{ inProgressWildRiftServicesCount }})</span>
      </h3>
      <ul class="my-services-list">
        <li
          v-for="item in wildRiftItems"
          :key="item.path"
          :class="{ 'my-services-list__item--active': $route.path.includes(item.path) }"
          class="my-services-list__item"
          @click="goToRoute(item.path)"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </li>
      </ul>
    </section>

    <section class="my-services-section">
      <h3 class="my-services-section__title">
        Teamfight Tactics
        <span v-if="inProgressTftServicesCount">({{ inProgressTftServicesCount }})</span>
      </h3>
      <ul class="my-services-list">
        <li
          v-for="item in tftItems"
          :key="item.path"
          :class="{ 'my-services-list__item--active': $route.path.includes(item.path) }"
          class="my-services-list__item"
          @click="goToRoute(item.path)"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useServicesStore } from '@/stores/services'
const SERVICES_BASE = '/services'

export default {
  name: 'MyServicesMenuContent',
  computed: {
    ...mapState(useServicesStore, [
      'inProgressEloBoosts',
      'inProgressPlacements',
      'inProgressDuoBoosts',
      'inProgressWinBoosts',
      'inProgressMasteries',
      'inProgressMaintenances',
      'inProgressCoachings',
      'inProgressReplayAnalyses',
      'inProgressValorantEloBoosts',
      'inProgressValorantPlacements',
      'inProgressValorantDuoBoosts',
      'inProgressValorantWinBoosts',
      'inProgressWildRiftEloBoosts',
      'inProgressWildRiftPlacements',
      'inProgressWildRiftDuoBoosts',
      'inProgressWildRiftWinBoosts',
      'inProgressTftEloBoosts',
      'inProgressTftPlacements',
      'inProgressTftWinBoosts',
      'inProgressTftPasses',
    ]),
    leagueOfLegendsItems() {
      return [
        { path: `${SERVICES_BASE}/league-of-legends/elo-boosts`, label: 'Elo Boosts', count: this.inProgressEloBoosts.length },
        { path: `${SERVICES_BASE}/league-of-legends/placements`, label: 'Classificatórias', count: this.inProgressPlacements.length },
        { path: `${SERVICES_BASE}/league-of-legends/win-boosts`, label: 'Vitórias', count: this.inProgressWinBoosts.length },
        { path: `${SERVICES_BASE}/league-of-legends/duo-boosts`, label: 'Duo Boosts', count: this.inProgressDuoBoosts.length },
        { path: `${SERVICES_BASE}/league-of-legends/masteries`, label: 'Maestria', count: this.inProgressMasteries.length },
        { path: `${SERVICES_BASE}/league-of-legends/maintenances`, label: 'Manutenção de Elo', count: this.inProgressMaintenances.length },
        { path: `${SERVICES_BASE}/league-of-legends/coachings`, label: 'Coachings', count: this.inProgressCoachings.length },
        { path: `${SERVICES_BASE}/league-of-legends/replay-analyses`, label: 'Análises de Replay', count: this.inProgressReplayAnalyses.length },
      ]
    },
    valorantItems() {
      return [
        { path: `${SERVICES_BASE}/valorant/elo-boosts`, label: 'Elo Boosts', count: this.inProgressValorantEloBoosts.length },
        { path: `${SERVICES_BASE}/valorant/placements`, label: "Md5's", count: this.inProgressValorantPlacements.length },
        { path: `${SERVICES_BASE}/valorant/win-boosts`, label: 'Vitórias', count: this.inProgressValorantWinBoosts.length },
        { path: `${SERVICES_BASE}/valorant/duo-boosts`, label: 'Duo Boosts', count: this.inProgressValorantDuoBoosts.length },
      ]
    },
    wildRiftItems() {
      return [
        { path: `${SERVICES_BASE}/wild-rift/elo-boosts`, label: 'Elo Boosts', count: this.inProgressWildRiftEloBoosts.length },
        { path: `${SERVICES_BASE}/wild-rift/placements`, label: 'Classificatórias', count: this.inProgressWildRiftPlacements.length },
        { path: `${SERVICES_BASE}/wild-rift/win-boosts`, label: 'Vitórias', count: this.inProgressWildRiftWinBoosts.length },
        { path: `${SERVICES_BASE}/wild-rift/duo-boosts`, label: 'Duo Boosts', count: this.inProgressWildRiftDuoBoosts.length },
      ]
    },
    tftItems() {
      return [
        { path: `${SERVICES_BASE}/tft/elo-boosts`, label: 'Elo Boosts', count: this.inProgressTftEloBoosts.length },
        { path: `${SERVICES_BASE}/tft/placements`, label: 'Classificatórias', count: this.inProgressTftPlacements.length },
        { path: `${SERVICES_BASE}/tft/win-boosts`, label: 'Vitórias', count: this.inProgressTftWinBoosts.length },
        { path: `${SERVICES_BASE}/tft/passes`, label: 'Passes', count: this.inProgressTftPasses.length },
      ]
    },
    inProgressLeagueOfLegendsServicesCount() {
      return (
        this.inProgressEloBoosts.length +
        this.inProgressPlacements.length +
        this.inProgressDuoBoosts.length +
        this.inProgressWinBoosts.length +
        this.inProgressMasteries.length +
        this.inProgressMaintenances.length +
        this.inProgressCoachings.length +
        this.inProgressReplayAnalyses.length
      )
    },
    inProgressValorantServicesCount() {
      return (
        this.inProgressValorantEloBoosts.length +
        this.inProgressValorantPlacements.length +
        this.inProgressValorantDuoBoosts.length +
        this.inProgressValorantWinBoosts.length
      )
    },
    inProgressWildRiftServicesCount() {
      return (
        this.inProgressWildRiftEloBoosts.length +
        this.inProgressWildRiftPlacements.length +
        this.inProgressWildRiftDuoBoosts.length +
        this.inProgressWildRiftWinBoosts.length
      )
    },
    inProgressTftServicesCount() {
      return (
        this.inProgressTftEloBoosts.length +
        this.inProgressTftPlacements.length +
        this.inProgressTftWinBoosts.length +
        this.inProgressTftPasses.length
      )
    },
  },
  methods: {
    goToRoute(path) {
      if (this.$route.path !== path) this.$router.push({ path })
    },
  },
}
</script>

<style lang="scss" scoped>
.my-services-title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.my-services-section {
  margin-top: 24px;

  &:first-child {
    margin-top: 0;
  }

  &__title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 8px;

    span {
      margin-left: 4px;
      color: rgb(133, 208, 255);
    }
  }
}

.my-services-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    transition: background-color 0.15s ease, color 0.15s ease;

    span {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      background-color: rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 10px;
    }

    &:hover {
      background-color: rgba(133, 208, 255, 0.1);
      color: #fff;
    }

    &--active {
      background-color: rgba(133, 208, 255, 0.15);
      color: rgb(133, 208, 255);

      span {
        color: rgb(133, 208, 255);
        background-color: rgba(133, 208, 255, 0.15);
      }
    }
  }
}
</style>

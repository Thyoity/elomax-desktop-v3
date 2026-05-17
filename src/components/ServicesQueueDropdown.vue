<template>
  <div>
    <h1 class="queue-title">Fila de Serviços</h1>
    <section class="queue-section">
      <h3 class="queue-section__title">
        League of Legends
        <span v-if="queueLeagueOfLegendsServicesCount">({{ queueLeagueOfLegendsServicesCount }})</span>
      </h3>
      <ul class="queue-list">
        <li
          v-for="item in leagueOfLegendsItems"
          :key="item.path"
          :class="{ 'queue-list__item--active': $route.path.includes(item.path) }"
          class="queue-list__item"
          @click="goToRoute(item.path)"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </li>
      </ul>
    </section>

    <section class="queue-section">
      <h3 class="queue-section__title">
        Valorant
        <span v-if="queueValorantServicesCount">({{ queueValorantServicesCount }})</span>
      </h3>
      <ul class="queue-list">
        <li
          v-for="item in valorantItems"
          :key="item.path"
          :class="{ 'queue-list__item--active': $route.path.includes(item.path) }"
          class="queue-list__item"
          @click="goToRoute(item.path)"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </li>
      </ul>
    </section>

    <section class="queue-section">
      <h3 class="queue-section__title">
        Wild Rift
        <span v-if="queueWildRiftServicesCount">({{ queueWildRiftServicesCount }})</span>
      </h3>
      <ul class="queue-list">
        <li
          v-for="item in wildRiftItems"
          :key="item.path"
          :class="{ 'queue-list__item--active': $route.path.includes(item.path) }"
          class="queue-list__item"
          @click="goToRoute(item.path)"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </li>
      </ul>
    </section>

    <section class="queue-section">
      <h3 class="queue-section__title">
        Teamfight Tactics
        <span v-if="queueTftServicesCount">({{ queueTftServicesCount }})</span>
      </h3>
      <ul class="queue-list">
        <li
          v-for="item in tftItems"
          :key="item.path"
          :class="{ 'queue-list__item--active': $route.path.includes(item.path) }"
          class="queue-list__item"
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
import { useServicesQueueStore } from '@/stores/services-queue'
const QUEUE_BASE = '/services-queue'

export default {
  name: 'ServicesQueueMenuContent',
  computed: {
    ...mapState(useServicesQueueStore, [
      'queueEloBoosts',
      'queuePlacements',
      'queueDuoBoosts',
      'queueWinBoosts',
      'queueMasteries',
      'queueMaintenances',
      'queueCoachings',
      'queueReplayAnalyses',
      'queueValorantEloBoosts',
      'queueValorantPlacements',
      'queueValorantDuoBoosts',
      'queueValorantWinBoosts',
      'queueWildRiftEloBoosts',
      'queueWildRiftPlacements',
      'queueWildRiftDuoBoosts',
      'queueWildRiftWinBoosts',
      'queueTftEloBoosts',
      'queueTftPlacements',
      'queueTftWinBoosts',
      'queueTftPasses',
    ]),
    leagueOfLegendsItems() {
      return [
        { path: `${QUEUE_BASE}/league-of-legends/elo-boosts`, label: 'Elo Boosts', count: this.queueEloBoosts.length },
        { path: `${QUEUE_BASE}/league-of-legends/placements`, label: 'Classificatórias', count: this.queuePlacements.length },
        { path: `${QUEUE_BASE}/league-of-legends/win-boosts`, label: 'Vitórias', count: this.queueWinBoosts.length },
        { path: `${QUEUE_BASE}/league-of-legends/duo-boosts`, label: 'Duo Boosts', count: this.queueDuoBoosts.length },
        { path: `${QUEUE_BASE}/league-of-legends/masteries`, label: 'Maestria', count: this.queueMasteries.length },
        { path: `${QUEUE_BASE}/league-of-legends/maintenances`, label: 'Manutenção de Elo', count: this.queueMaintenances.length },
        { path: `${QUEUE_BASE}/league-of-legends/coachings`, label: 'Coachings', count: this.queueCoachings.length },
        { path: `${QUEUE_BASE}/league-of-legends/replay-analyses`, label: 'Análises de Replay', count: this.queueReplayAnalyses.length },
      ]
    },
    valorantItems() {
      return [
        { path: `${QUEUE_BASE}/valorant/elo-boosts`, label: 'Elo Boosts', count: this.queueValorantEloBoosts.length },
        { path: `${QUEUE_BASE}/valorant/placements`, label: "Md5's", count: this.queueValorantPlacements.length },
        { path: `${QUEUE_BASE}/valorant/win-boosts`, label: 'Vitórias', count: this.queueValorantWinBoosts.length },
        { path: `${QUEUE_BASE}/valorant/duo-boosts`, label: 'Duo Boosts', count: this.queueValorantDuoBoosts.length },
      ]
    },
    wildRiftItems() {
      return [
        { path: `${QUEUE_BASE}/wild-rift/elo-boosts`, label: 'Elo Boosts', count: this.queueWildRiftEloBoosts.length },
        { path: `${QUEUE_BASE}/wild-rift/placements`, label: 'Classificatórias', count: this.queueWildRiftPlacements.length },
        { path: `${QUEUE_BASE}/wild-rift/win-boosts`, label: 'Vitórias', count: this.queueWildRiftWinBoosts.length },
        { path: `${QUEUE_BASE}/wild-rift/duo-boosts`, label: 'Duo Boosts', count: this.queueWildRiftDuoBoosts.length },
      ]
    },
    tftItems() {
      return [
        { path: `${QUEUE_BASE}/tft/elo-boosts`, label: 'Elo Boosts', count: this.queueTftEloBoosts.length },
        { path: `${QUEUE_BASE}/tft/placements`, label: 'Classificatórias', count: this.queueTftPlacements.length },
        { path: `${QUEUE_BASE}/tft/win-boosts`, label: 'Vitórias', count: this.queueTftWinBoosts.length },
        { path: `${QUEUE_BASE}/tft/passes`, label: 'Passes', count: this.queueTftPasses.length },
      ]
    },
    queueLeagueOfLegendsServicesCount() {
      return (
        this.queueEloBoosts.length +
        this.queuePlacements.length +
        this.queueDuoBoosts.length +
        this.queueWinBoosts.length +
        this.queueMasteries.length +
        this.queueMaintenances.length +
        this.queueCoachings.length +
        this.queueReplayAnalyses.length
      )
    },
    queueValorantServicesCount() {
      return (
        this.queueValorantEloBoosts.length +
        this.queueValorantPlacements.length +
        this.queueValorantDuoBoosts.length +
        this.queueValorantWinBoosts.length
      )
    },
    queueWildRiftServicesCount() {
      return (
        this.queueWildRiftEloBoosts.length +
        this.queueWildRiftPlacements.length +
        this.queueWildRiftDuoBoosts.length +
        this.queueWildRiftWinBoosts.length
      )
    },
    queueTftServicesCount() {
      return (
        this.queueTftEloBoosts.length +
        this.queueTftPlacements.length +
        this.queueTftWinBoosts.length +
        this.queueTftPasses.length
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
.queue-title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.queue-section {
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

.queue-list {
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

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') },
  { path: '/blog-articles', name: 'BlogArticles', component: () => import('@/views/BlogArticles.vue') },

  { path: '/services/league-of-legends/elo-boosts', name: 'LeagueOfLegendsEloBoosts', component: () => import('@/views/Services/LeagueOfLegends/EloBoosts.vue') },
  { path: '/services/league-of-legends/win-boosts', name: 'LeagueOfLegendsWinBoosts', component: () => import('@/views/Services/LeagueOfLegends/WinBoosts.vue') },
  { path: '/services/league-of-legends/duo-boosts', name: 'LeagueOfLegendsDuoBoosts', component: () => import('@/views/Services/LeagueOfLegends/DuoBoosts.vue') },
  { path: '/services/league-of-legends/placements', name: 'LeagueOfLegendsPlacements', component: () => import('@/views/Services/LeagueOfLegends/Placements.vue') },
  { path: '/services/league-of-legends/masteries', name: 'LeagueOfLegendsMasteries', component: () => import('@/views/Services/LeagueOfLegends/Masteries.vue') },
  { path: '/services/league-of-legends/maintenances', name: 'LeagueOfLegendsMaintenances', component: () => import('@/views/Services/LeagueOfLegends/Maintenances.vue') },
  { path: '/services/league-of-legends/coachings', name: 'LeagueOfLegendsCoachings', component: () => import('@/views/Services/LeagueOfLegends/Coachings.vue') },
  { path: '/services/league-of-legends/replay-analyses', name: 'LeagueOfLegendsReplayAnalyses', component: () => import('@/views/Services/LeagueOfLegends/ReplayAnalyses.vue') },

  { path: '/services/valorant/elo-boosts', name: 'ValorantEloBoosts', component: () => import('@/views/Services/Valorant/EloBoosts.vue') },
  { path: '/services/valorant/win-boosts', name: 'ValorantWinBoosts', component: () => import('@/views/Services/Valorant/WinBoosts.vue') },
  { path: '/services/valorant/duo-boosts', name: 'ValorantDuoBoosts', component: () => import('@/views/Services/Valorant/DuoBoosts.vue') },
  { path: '/services/valorant/placements', name: 'ValorantPlacements', component: () => import('@/views/Services/Valorant/Placements.vue') },

  { path: '/services/wild-rift/elo-boosts', name: 'WildRiftEloBoosts', component: () => import('@/views/Services/WildRift/EloBoosts.vue') },
  { path: '/services/wild-rift/win-boosts', name: 'WildRiftWinBoosts', component: () => import('@/views/Services/WildRift/WinBoosts.vue') },
  { path: '/services/wild-rift/duo-boosts', name: 'WildRiftDuoBoosts', component: () => import('@/views/Services/WildRift/DuoBoosts.vue') },
  { path: '/services/wild-rift/placements', name: 'WildRiftPlacements', component: () => import('@/views/Services/WildRift/Placements.vue') },

  { path: '/services/tft/elo-boosts', name: 'TftEloBoosts', component: () => import('@/views/Services/TeamfightTactics/EloBoosts.vue') },
  { path: '/services/tft/win-boosts', name: 'TftWinBoosts', component: () => import('@/views/Services/TeamfightTactics/WinBoosts.vue') },
  { path: '/services/tft/placements', name: 'TftPlacements', component: () => import('@/views/Services/TeamfightTactics/Placements.vue') },
  { path: '/services/tft/passes', name: 'TftPasses', component: () => import('@/views/Services/TeamfightTactics/Passes.vue') },

  { path: '/services/:id', name: 'Service', component: () => import('@/views/Services/Service/Service.vue') },
  { path: '/services-queue', name: 'ServicesQueue', component: () => import('@/views/ServicesQueue/ServicesQueue.vue') },

  { path: '/services-queue/league-of-legends/elo-boosts', name: 'LeagueOfLegendsEloBoostsInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/EloBoosts.vue') },
  { path: '/services-queue/league-of-legends/win-boosts', name: 'LeagueOfLegendsWinBoostsInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/WinBoosts.vue') },
  { path: '/services-queue/league-of-legends/duo-boosts', name: 'LeagueOfLegendsDuoBoostsInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/DuoBoosts.vue') },
  { path: '/services-queue/league-of-legends/placements', name: 'LeagueOfLegendsPlacementsInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/Placements.vue') },
  { path: '/services-queue/league-of-legends/masteries', name: 'LeagueOfLegendsMasteriesInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/Masteries.vue') },
  { path: '/services-queue/league-of-legends/maintenances', name: 'LeagueOfLegendsMaintenancesInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/Maintenances.vue') },
  { path: '/services-queue/league-of-legends/coachings', name: 'LeagueOfLegendsCoachingsInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/Coachings.vue') },
  { path: '/services-queue/league-of-legends/replay-analyses', name: 'LeagueOfLegendsReplayAnalysesInQueue', component: () => import('@/views/ServicesQueue/LeagueOfLegends/ReplayAnalyses.vue') },

  { path: '/services-queue/valorant/elo-boosts', name: 'ValorantEloBoostsInQueue', component: () => import('@/views/ServicesQueue/Valorant/EloBoosts.vue') },
  { path: '/services-queue/valorant/win-boosts', name: 'ValorantWinBoostsInQueue', component: () => import('@/views/ServicesQueue/Valorant/WinBoosts.vue') },
  { path: '/services-queue/valorant/duo-boosts', name: 'ValorantDuoBoostsInQueue', component: () => import('@/views/ServicesQueue/Valorant/DuoBoosts.vue') },
  { path: '/services-queue/valorant/placements', name: 'ValorantPlacementsInQueue', component: () => import('@/views/ServicesQueue/Valorant/Placements.vue') },

  { path: '/services-queue/wild-rift/elo-boosts', name: 'WildRiftEloBoostsInQueue', component: () => import('@/views/ServicesQueue/WildRift/EloBoosts.vue') },
  { path: '/services-queue/wild-rift/win-boosts', name: 'WildRiftWinBoostsInQueue', component: () => import('@/views/ServicesQueue/WildRift/WinBoosts.vue') },
  { path: '/services-queue/wild-rift/duo-boosts', name: 'WildRiftDuoBoostsInQueue', component: () => import('@/views/ServicesQueue/WildRift/DuoBoosts.vue') },
  { path: '/services-queue/wild-rift/placements', name: 'WildRiftPlacementsInQueue', component: () => import('@/views/ServicesQueue/WildRift/Placements.vue') },

  { path: '/services-queue/tft/elo-boosts', name: 'TftEloBoostsInQueue', component: () => import('@/views/ServicesQueue/TeamfightTactics/EloBoosts.vue') },
  { path: '/services-queue/tft/win-boosts', name: 'TftWinBoostsInQueue', component: () => import('@/views/ServicesQueue/TeamfightTactics/WinBoosts.vue') },
  { path: '/services-queue/tft/placements', name: 'TftPlacementsInQueue', component: () => import('@/views/ServicesQueue/TeamfightTactics/Placements.vue') },
  { path: '/services-queue/tft/passes', name: 'TftPassesInQueue', component: () => import('@/views/ServicesQueue/TeamfightTactics/Passes.vue') },

  { path: '/tools', name: 'Tools', component: () => import('@/views/Tools.vue') },
  { path: '/settings', name: 'Settings', component: () => import('@/views/Settings.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})

export default {
  in(summonerName: string, accountRankedQueues: any[]) {
    const processed: Record<string, any> = {}
    accountRankedQueues.forEach((q: any) => {
      let iter: string | null = null
      if (q && q.queueType === 'RANKED_SOLO_5x5') iter = 'soloDuo'
      if (q && q.queueType === 'RANKED_FLEX_SR') iter = 'flex'
      if (q && (iter === 'soloDuo' || iter === 'flex')) {
        processed[iter] = {}
        processed[iter].isProvisional = q.isProvisional
        processed[iter].tier = q.tier.toLowerCase()
        processed[iter].division = q.division.toLowerCase()
        if (processed[iter].tier === 'none' || processed[iter].tier === 'na') processed[iter].tier = 'unranked'
        if (processed[iter].division === 'none' || processed[iter].division === 'na') processed[iter].division = null
        processed[iter].leaguePoints = q.leaguePoints
        processed[iter].losses = q.losses
        processed[iter].wins = q.wins
        if (q.miniSeriesProgress && q.miniSeriesProgress.length === 5) {
          processed[iter].isPlayingMiniSeries = true
          processed[iter].miniSeriesProgress = q.miniSeriesProgress.map((c: string) =>
            c === 'N' ? null : c.toLowerCase(),
          )
        } else {
          processed[iter].isPlayingMiniSeries = false
        }
      }
    })
    return { summonerName, ...processed }
  },
}

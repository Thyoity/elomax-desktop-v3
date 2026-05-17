<template>
  <div class="services-queue--container">
    <h1>Fila de serviços</h1>

    <div v-if="!isLoadingServicesQueue">
      <div style="display: flex; flex-direction: row; align-items: center; justify-content: center;">
        <ul class="animated fadeIn game-list">
          <li>
            <AppLeagueOfLegendsButton :active="defaultGame === 'leagueOfLegends'" @click="setDefaultGame('leagueOfLegends')"></AppLeagueOfLegendsButton>
            <span v-if="queueLeagueOfLegendsServicesCount > 0" class="count-label">{{ queueLeagueOfLegendsServicesCount }}</span>
          </li>
          <li>
            <AppWildRiftButton :active="defaultGame === 'wildRift'" @click="setDefaultGame('wildRift')"></AppWildRiftButton>
            <span v-if="queueWildRiftServicesCount > 0" class="count-label">{{ queueWildRiftServicesCount }}</span>
          </li>
        </ul>
        <h3 class="animated fadeIn service-categories">
          <!--
            League of Legends Services
          -->
          <div v-if="defaultGame === 'leagueOfLegends'" style="display: flex; flex-direction: row;">
            <a class="services-menu-link" :class="{'active': activeTab === 'eloBoosts'}" href="javascript: void(0)" @click="activeTab = 'eloBoosts'">
              Elo Boosts<span class="count-label" v-if="queueEloBoosts && queueEloBoosts.length > 0">{{ queueEloBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'placements'}" href="javascript: void(0)" @click="activeTab = 'placements'">
              Md10's<span class="count-label" v-if="queuePlacements && queuePlacements.length > 0">{{ queuePlacements.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'winBoosts'}" href="javascript: void(0)" @click="activeTab = 'winBoosts'">
              Vitórias<span class="count-label" v-if="queueWinBoosts && queueWinBoosts.length > 0">{{ queueWinBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'duoBoosts'}" href="javascript: void(0)" @click="activeTab = 'duoBoosts'">
              Duo Boosts<span class="count-label" v-if="queueDuoBoosts && queueDuoBoosts.length > 0">{{ queueDuoBoosts.length }}</span>
            </a>
          </div>
          <!--
            Wild Rift Services
          -->
          <div v-if="defaultGame === 'wildRift'" style="display: flex; flex-direction: row;">
            <a class="services-menu-link" :class="{'active': activeTab === 'eloBoosts'}" href="javascript: void(0)" @click="activeTab = 'eloBoosts'">
              Elo Boosts<span class="count-label" v-if="queueWildRiftEloBoosts && queueWildRiftEloBoosts.length > 0">{{ queueWildRiftEloBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'placements'}" href="javascript: void(0)" @click="activeTab = 'placements'">
              Md10's<span class="count-label" v-if="queueWildRiftPlacements && queueWildRiftPlacements.length > 0">{{ queueWildRiftPlacements.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'winBoosts'}" href="javascript: void(0)" @click="activeTab = 'winBoosts'">
              Vitórias<span class="count-label" v-if="queueWildRiftWinBoosts && queueWildRiftWinBoosts.length > 0">{{ queueWildRiftWinBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'duoBoosts'}" href="javascript: void(0)" @click="activeTab = 'duoBoosts'">
              Duo Boosts<span class="count-label" v-if="queueWildRiftDuoBoosts && queueWildRiftDuoBoosts.length > 0">{{ queueWildRiftDuoBoosts.length }}</span>
            </a>
          </div>

          <a href="javascript:void(0)" @click="$bus.emit('reload-services-queue')" class="refresh-servies-button">
            <ion-icon name="sync-outline"></ion-icon>
          </a>
        </h3>
      </div>

      <!--
      League of Legends Services
      -->
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'eloBoosts' && queueEloBoosts && queueEloBoosts.length> 0" class="scroll-container">
        <div class="service-list" v-if="queueEloBoosts && queueEloBoosts.length > 0">
          <div v-for="eloBoost in queueEloBoosts" :key="eloBoost.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ eloBoost.id }}
                <span class="description-icon" v-if="eloBoost.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="eloBoost.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="eloBoost.details.server">Servidor: {{ eloBoost.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ eloBoost.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: eloBoost.id, dateAcceptable: eloBoost.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[eloBoost.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(eloBoost.details.initial_tier)">{{eloBoost.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="eloBoost.details.initial_tier !== 'unranked'">({{ eloBoost.details.initial_lp ? eloBoost.details.initial_lp : 0 }} LP's)</small>
                </span>
              </div>
              <div class="arrow-icon">
                <span v-if="eloBoost.details.queue === 'solo_duo'">Solo / Duo</span>
                <span v-else-if="eloBoost.details.queue === 'flex'">Flex</span>
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
              <div class="destination-point">
                <img :src="elos[eloBoost.details.desired_tier]" />
                <span v-if="hasDivision(eloBoost.details.desired_tier)" style="white-space: nowrap;">{{eloBoost.details.desired_division.toUpperCase()}}</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="eloBoost.details.extras && eloBoost.details.extras.length">
                <li v-for="extra in eloBoost.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos.</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'eloBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'placements' && queuePlacements && queuePlacements.length> 0" class="scroll-container">
        <div class="service-list" v-if="queuePlacements && queuePlacements.length > 0">
          <div v-for="placement in queuePlacements" :key="placement.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ placement.id }}
                <span class="description-icon" v-if="placement.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="placement.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="placement.details.server">Servidor: {{ placement.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ placement.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: placement.id, dateAcceptable: placement.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[placement.details.initial_tier]" />
                <span v-if="hasDivision(placement.details.initial_tier)" style="white-space: nowrap;">{{placement.details.initial_division.toUpperCase()}}</span>
              </div>
              <div class="spacer">
              </div>
              <div class="destination-point">
                <span class="initial-type" v-if="placement.details.queue === 'solo_duo'">Solo / Duo</span>
                <span class="initial-type" v-else-if="placement.details.queue === 'flex'">Flex</span>
                <span class="initial-type" v-if="placement.details.type === 'duo'" style="white-space: nowrap;">Duo Boost</span>
                <span class="initial-type" v-else style="white-space: nowrap;">Boost</span>
                <span class="initial-type" style="white-space: nowrap;">{{placement.details.games}} vitórias</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="placement.details.extras && placement.details.extras.length">
                <li v-for="extra in placement.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos.</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'placements'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'winBoosts' && queueWinBoosts && queueWinBoosts.length> 0" class="scroll-container">
        <div class="service-list" v-if="queueWinBoosts && queueWinBoosts.length > 0">
          <div v-for="winBoost in queueWinBoosts" :key="winBoost.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ winBoost.id }}
                <span class="description-icon" v-if="winBoost.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="winBoost.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="winBoost.details.server">Servidor: {{ winBoost.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ winBoost.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: winBoost.id, dateAcceptable: winBoost.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[winBoost.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(winBoost.details.initial_tier)">{{winBoost.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="winBoost.details.initial_tier !== 'unranked'">({{ winBoost.details.initial_lp ? winBoost.details.initial_lp : 0 }} LP's)</small>
                </span>
              </div>
              <div class="spacer">
              </div>
              <div class="destination-point">
                <span class="initial-type" v-if="winBoost.details.queue === 'solo_duo'">Solo / Duo</span>
                <span class="initial-type" v-else-if="winBoost.details.queue === 'flex'">Flex</span>
                <span class="initial-type" style="white-space: nowrap;">{{winBoost.details.desired_victories}} vitórias</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="winBoost.details.extras && winBoost.details.extras.length">
                <li v-for="extra in winBoost.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos.</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'winBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'duoBoosts' && queueDuoBoosts && queueDuoBoosts.length> 0" class="scroll-container">
        <div class="service-list" v-if="queueDuoBoosts && queueDuoBoosts.length > 0">
          <div v-for="duoBoost in queueDuoBoosts" :key="duoBoost.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ duoBoost.id }}
                <span class="description-icon" v-if="duoBoost.description">
                  <ion-icon name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="duoBoost.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="duoBoost.details.server">Servidor: {{ duoBoost.details.server.toUpperCase() }}</h5>
              <h5 class="plan" v-if="duoBoost.details.plan && parseInt(duoBoost.details.plan) === 1">Plano: Básico</h5>
              <h5 class="plan" v-else-if="duoBoost.details.plan && parseInt(duoBoost.details.plan) === 2">Plano: Estendido</h5>
              <h5 class="plan" v-else-if="duoBoost.details.plan && parseInt(duoBoost.details.plan) === 3">Plano: Premium</h5>
              <h5 class="client">Cliente: {{ duoBoost.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: duoBoost.id, dateAcceptable: duoBoost.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[duoBoost.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(duoBoost.details.initial_tier)">{{duoBoost.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="duoBoost.details.initial_tier !== 'unranked'">({{ duoBoost.details.initial_lp ? duoBoost.details.initial_lp : 0 }} LP's)</small>
                </span>
              </div>
              <div v-if="duoBoost.details.type === 'division'" class="arrow-icon">
                <span v-if="duoBoost.details.queue === 'solo_duo'">Solo / Duo</span>
                <span v-else-if="duoBoost.details.queue === 'flex'">Flex</span>
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
              <div v-else class="spacer"></div>
              <div v-if="duoBoost.details.type === 'division'" class="destination-point">
                <img :src="elos[duoBoost.details.desired_tier]" />
                <span v-if="hasDivision(duoBoost.details.desired_tier)" style="white-space: nowrap;">{{duoBoost.details.desired_division.toUpperCase()}}</span>
              </div>
              <div v-else class="destination-point">
                <span class="initial-type" v-if="duoBoost.details.queue === 'solo_duo'">Solo / Duo</span>
                <span class="initial-type" v-else-if="duoBoost.details.queue === 'flex'">Flex</span>
                <span class="initial-type" style="white-space: nowrap;">{{duoBoost.details.desired_victories}} vitórias</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="duoBoost.details.extras && duoBoost.details.extras.length">
                <li v-for="extra in duoBoost.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos .</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'duoBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>

      <!--
      Wild Rift Services
      -->
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'eloBoosts' && queueWildRiftEloBoosts && queueWildRiftEloBoosts.length> 0" class="scroll-container">
        <div class="service-list" v-if="queueWildRiftEloBoosts && queueWildRiftEloBoosts.length > 0">
          <div v-for="service in queueWildRiftEloBoosts" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ service.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: service.id, dateAcceptable: service.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[service.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(service.details.initial_tier)">{{service.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="service.details.initial_tier !== 'unranked'">({{ service.details.initial_lp ? service.details.initial_lp : 0 }} LP's)</small>
                </span>
              </div>
              <div class="arrow-icon">
                <span v-if="service.details.queue === 'solo_duo'">Solo / Duo</span>
                <span v-else-if="service.details.queue === 'flex'">Flex</span>
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
              <div class="destination-point">
                <img :src="elos[service.details.desired_tier]" />
                <span v-if="hasDivision(service.details.desired_tier)" style="white-space: nowrap;">{{service.details.desired_division.toUpperCase()}}</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="service.details.extras && service.details.extras.length">
                <li v-for="extra in service.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos.</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'eloBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'placements' && queueWildRiftPlacements && queueWildRiftPlacements.length> 0" class="scroll-container">
        <div class="service-list" v-if="queueWildRiftPlacements && queueWildRiftPlacements.length > 0">
          <div v-for="service in queueWildRiftPlacements" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ service: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ service.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: service.id, dateAcceptable: service.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[service.details.initial_tier]" />
                <span v-if="hasDivision(service.details.initial_tier)" style="white-space: nowrap;">{{service.details.initial_division.toUpperCase()}}</span>
              </div>
              <div class="spacer">
              </div>
              <div class="destination-point">
                <span class="initial-type" v-if="service.details.queue === 'solo_duo'">Solo / Duo</span>
                <span class="initial-type" v-else-if="service.details.queue === 'flex'">Flex</span>
                <span class="initial-type" v-if="service.details.type === 'duo'" style="white-space: nowrap;">Duo Boost</span>
                <span class="initial-type" v-else style="white-space: nowrap;">Boost</span>
                <span class="initial-type" style="white-space: nowrap;">{{service.details.games}} vitórias</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="service.details.extras && service.details.extras.length">
                <li v-for="extra in service.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos.</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'placements'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'winBoosts' && queueWildRiftWinBoosts && queueWildRiftWinBoosts.length> 0" class="scroll-container">
        <div class="service-list" v-if="queueWildRiftWinBoosts && queueWildRiftWinBoosts.length > 0">
          <div v-for="service in queueWildRiftWinBoosts" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ service.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: service.id, dateAcceptable: service.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[service.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(service.details.initial_tier)">{{service.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="service.details.initial_tier !== 'unranked'">({{ service.details.initial_lp ? service.details.initial_lp : 0 }} LP's)</small>
                </span>
              </div>
              <div class="spacer">
              </div>
              <div class="destination-point">
                <span class="initial-type" v-if="service.details.queue === 'solo_duo'">Solo / Duo</span>
                <span class="initial-type" v-else-if="service.details.queue === 'flex'">Flex</span>
                <span class="initial-type" style="white-space: nowrap;">{{service.details.desired_victories}} vitórias</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="service.details.extras && service.details.extras.length">
                <li v-for="extra in service.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos.</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'winBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'duoBoosts' && queueWildRiftDuoBoosts && queueWildRiftDuoBoosts.length> 0" class="scroll-container">
        <div class="service-list" v-if="queueWildRiftDuoBoosts && queueWildRiftDuoBoosts.length > 0">
          <div v-for="service in queueWildRiftDuoBoosts" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="plan" v-if="service.details.plan && parseInt(service.details.plan) === 1">Plano: Básico</h5>
              <h5 class="plan" v-else-if="service.details.plan && parseInt(service.details.plan) === 2">Plano: Estendido</h5>
              <h5 class="plan" v-else-if="service.details.plan && parseInt(service.details.plan) === 3">Plano: Premium</h5>
              <h5 class="client">Cliente: {{ service.client.username }}</h5>
              <AppAcceptServiceButton :modal-params="{ serviceId: service.id, dateAcceptable: service.dateAcceptable }"></AppAcceptServiceButton>
            </div>
            <div class="service-details">
              <div class="start-point">
                <img :src="elos[service.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(service.details.initial_tier)">{{service.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="service.details.initial_tier !== 'unranked'">({{ service.details.initial_lp ? service.details.initial_lp : 0 }} LP's)</small>
                </span>
              </div>
              <div v-if="service.details.type === 'division'" class="arrow-icon">
                <span v-if="service.details.queue === 'solo_duo'">Solo / Duo</span>
                <span v-else-if="service.details.queue === 'flex'">Flex</span>
                <ion-icon name="arrow-forward-outline"></ion-icon>
              </div>
              <div v-else class="spacer"></div>
              <div v-if="service.details.type === 'division'" class="destination-point">
                <img :src="elos[service.details.desired_tier]" />
                <span v-if="hasDivision(service.details.desired_tier)" style="white-space: nowrap;">{{service.details.desired_division.toUpperCase()}}</span>
              </div>
              <div v-else class="destination-point">
                <span class="initial-type" v-if="service.details.queue === 'solo_duo'">Solo / Duo</span>
                <span class="initial-type" v-else-if="service.details.queue === 'flex'">Flex</span>
                <span class="initial-type" style="white-space: nowrap;">{{service.details.desired_victories}} vitórias</span>
              </div>
            </div>
            
            <div class="extras-list">
              <ul v-if="service.details.extras && service.details.extras.length">
                <li v-for="extra in service.details.extras" :key="extra.type">
                  <AppExtra class="extra" :type="extra.type" :value="extra.value"></AppExtra>
                </li>
              </ul>
              <p v-else>Sem extras inclusos .</p>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'duoBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>

    </div>
    <div v-else style="display: flex; align-items: center; justify-content: center;">
      <AppLoading class="animated fadeIn" :text="loadingServicesQueueText"></AppLoading>
    </div>
  </div>
</template>

<script>
import { badgeUrl } from '@/config/assets'
import { mapActions, mapState } from 'pinia'
import { useServicesQueueStore } from '@/stores/services-queue'
import { useSettingsStore } from '@/stores/settings'
import LeagueOfLegendsButtonComponent from '@/components/Buttons/LeagueOfLegends.vue'
import WildRiftButtonComponent from '@/components/Buttons/WildRift.vue'

export default {
  name: 'ServicesQueue',
  components: {
    "AppLeagueOfLegendsButton": LeagueOfLegendsButtonComponent,
    "AppWildRiftButton": WildRiftButtonComponent,
  },
  data(){
    return {
      activeTab: 'eloBoosts',
      elos: {
        'unranked': badgeUrl('unranked'),
        'iron': badgeUrl('iron'),
        'bronze': badgeUrl('bronze'),
        'silver': badgeUrl('silver'),
        'gold': badgeUrl('gold'),
        'platinum': badgeUrl('platinum'),
        'emerald': badgeUrl('emerald'),
        'diamond': badgeUrl('diamond'),
        'master': badgeUrl('master'),
        'grandmaster': badgeUrl('grandmaster'),
        'challenger': badgeUrl('challenger')
      }
    }
  },
  computed: {
    ...mapState(useSettingsStore, ['defaultGame']),
    ...mapState(useServicesQueueStore, [
      'isLoadingServicesQueue', 
      'loadingServicesQueueText', 

      /**
       * League of Legends Queue Services
       */
      'queueEloBoosts', 
      'queuePlacements', 
      'queueDuoBoosts', 
      'queueWinBoosts',

      /**
       * League of Legends Queue Services
       */
      'queueWildRiftEloBoosts', 
      'queueWildRiftPlacements', 
      'queueWildRiftDuoBoosts', 
      'queueWildRiftWinBoosts',
    ]),
    queueLeagueOfLegendsServicesCount(){
      return this.queueEloBoosts.length + this.queuePlacements.length + this.queueDuoBoosts.length + this.queueWinBoosts.length
    },
    queueWildRiftServicesCount(){
      return this.queueWildRiftEloBoosts.length + this.queueWildRiftPlacements.length + this.queueWildRiftDuoBoosts.length + this.queueWildRiftWinBoosts.length
    }
  },
  methods: {
    ...mapActions(useSettingsStore, ['setDefaultGame']),
    hasDivision (tier) {
      return tier !== 'unranked' && tier !== 'master' && tier !== 'grandmaster' && tier !== 'challenger'
    }
  }
}
</script>

<style lang="scss">
  @use "./services.scss";
</style>
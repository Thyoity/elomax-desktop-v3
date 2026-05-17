<template>
  <div class="services--container">
    <h1 class="animated fadeIn">Serviços em progresso</h1>
    <div class="page-content" v-if="!isLoadingServices">
      <div style="display: flex; flex-direction: row; align-items: center; justify-content: center;">
        <ul class="animated fadeIn game-list">
          <li>
            <AppLeagueOfLegendsButton :active="defaultGame === 'leagueOfLegends'" @click="setDefaultGame('leagueOfLegends')"></AppLeagueOfLegendsButton>
            <span v-if="inProgressLeagueOfLegendsServicesCount > 0" class="count-label">{{ inProgressLeagueOfLegendsServicesCount }}</span>
          </li>
          <li>
            <AppWildRiftButton :active="defaultGame === 'wildRift'" @click="setDefaultGame('wildRift')"></AppWildRiftButton>
            <span v-if="inProgressWildRiftServicesCount > 0" class="count-label">{{ inProgressWildRiftServicesCount }}</span>
          </li>
        </ul>
        <h3 class="animated fadeIn service-categories">
          <!--
            League of Legends Services
          -->
          <div v-if="defaultGame === 'leagueOfLegends'" style="display: flex; flex-direction: row;">
            <a class="services-menu-link" :class="{'active': activeTab === 'eloBoosts'}" href="javascript: void(0)" @click="activeTab = 'eloBoosts'">
              Elo Boosts<span class="count-label" v-if="inProgressEloBoosts && inProgressEloBoosts.length > 0">{{ inProgressEloBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'placements'}" href="javascript: void(0)" @click="activeTab = 'placements'">
              Classificatórias<span class="count-label" v-if="inProgressPlacements && inProgressPlacements.length > 0">{{ inProgressPlacements.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'winBoosts'}" href="javascript: void(0)" @click="activeTab = 'winBoosts'">
              Vitórias<span class="count-label" v-if="inProgressWinBoosts && inProgressWinBoosts.length > 0">{{ inProgressWinBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'duoBoosts'}" href="javascript: void(0)" @click="activeTab = 'duoBoosts'">
              Duo Boosts<span class="count-label" v-if="inProgressDuoBoosts && inProgressDuoBoosts.length > 0">{{ inProgressDuoBoosts.length }}</span>
            </a>
          </div>
          <!--
            Wild Rift Services
          -->
          <div v-if="defaultGame === 'wildRift'" style="display: flex; flex-direction: row;">
            <a class="services-menu-link" :class="{'active': activeTab === 'eloBoosts'}" href="javascript: void(0)" @click="activeTab = 'eloBoosts'">
              Elo Boosts<span class="count-label" v-if="inProgressWildRiftEloBoosts && inProgressWildRiftEloBoosts.length > 0">{{ inProgressWildRiftEloBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'placements'}" href="javascript: void(0)" @click="activeTab = 'placements'">
              Classificatórias<span class="count-label" v-if="inProgressWildRiftPlacements && inProgressWildRiftPlacements.length > 0">{{ inProgressWildRiftPlacements.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'winBoosts'}" href="javascript: void(0)" @click="activeTab = 'winBoosts'">
              Vitórias<span class="count-label" v-if="inProgressWildRiftWinBoosts && inProgressWildRiftWinBoosts.length > 0">{{ inProgressWildRiftWinBoosts.length }}</span>
            </a> - 
            <a class="services-menu-link" :class="{'active': activeTab === 'duoBoosts'}" href="javascript: void(0)" @click="activeTab = 'duoBoosts'">
              Duo Boosts<span class="count-label" v-if="inProgressWildRiftDuoBoosts && inProgressWildRiftDuoBoosts.length > 0">{{ inProgressWildRiftDuoBoosts.length }}</span>
            </a>
          </div>
          <a href="javascript:void(0)" @click="$bus.emit('reload-in-progress-services')" class="refresh-servies-button">
            <ion-icon name="sync-outline"></ion-icon>
          </a>
          
        </h3>
      </div>

      <!--
      League of Legends Services
      -->
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'eloBoosts' && inProgressEloBoosts && inProgressEloBoosts.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressEloBoosts && inProgressEloBoosts.length > 0">
          <div v-for="eloBoost in inProgressEloBoosts" :key="eloBoost.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ eloBoost.id }}
                <span class="description-icon" v-if="eloBoost.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="eloBoost.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="eloBoost.details.server">Servidor: {{ eloBoost.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ eloBoost.client.username }} <div class="user-status" :class="{online: eloBoost.client.isOnline}"></div></h5>
              <button @click="openService(eloBoost)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[eloBoost.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(eloBoost.details.initial_tier)">{{eloBoost.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="eloBoost.details.initial_tier !== 'unranked'">({{eloBoost.details.initial_lp}} LP's)</small>
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="eloBoost.details.date_deadline">Até {{ formatDate(eloBoost.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="eloBoost.boosterAmount">R$ {{ eloBoost.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'eloBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'placements' && inProgressPlacements && inProgressPlacements.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressPlacements && inProgressPlacements.length > 0">
          <div v-for="placement in inProgressPlacements" :key="placement.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ placement.id }}
                <span class="description-icon" v-if="placement.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="placement.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="placement.details.server">Servidor: {{ placement.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ placement.client.username }} <div class="user-status" :class="{online: placement.client.isOnline}"></div></h5>
              <button @click="openService(placement)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="placement.details.date_deadline">Até {{ formatDate(placement.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="placement.boosterAmount">R$ {{ placement.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'placements'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'winBoosts' && inProgressWinBoosts && inProgressWinBoosts.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressWinBoosts && inProgressWinBoosts.length > 0">
          <div v-for="winBoost in inProgressWinBoosts" :key="winBoost.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ winBoost.id }}
                <span class="description-icon" v-if="winBoost.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="winBoost.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="winBoost.details.server">Servidor: {{ winBoost.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ winBoost.client.username }} <div class="user-status" :class="{online: winBoost.client.isOnline}"></div></h5>
              <button @click="openService(winBoost)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="winBoost.details.date_deadline">Até {{ formatDate(winBoost.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="winBoost.boosterAmount">R$ {{ winBoost.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'winBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'leagueOfLegends' && activeTab === 'duoBoosts' && inProgressDuoBoosts && inProgressDuoBoosts.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressDuoBoosts && inProgressDuoBoosts.length > 0">
          <div v-for="duoBoost in inProgressDuoBoosts" :key="duoBoost.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ duoBoost.id }}
                <span class="description-icon" v-if="duoBoost.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="duoBoost.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="duoBoost.details.server">Servidor: {{ duoBoost.details.server.toUpperCase() }}</h5>
              <h5 class="plan" v-if="duoBoost.details.plan && parseInt(duoBoost.details.plan) === 1">Plano: Básico</h5>
              <h5 class="plan" v-else-if="duoBoost.details.plan && parseInt(duoBoost.details.plan) === 2">Plano: Estendido</h5>
              <h5 class="plan" v-else-if="duoBoost.details.plan && parseInt(duoBoost.details.plan) === 3">Plano: Premium</h5>
              <h5 class="client">Cliente: {{ duoBoost.client.username }} <div class="user-status" :class="{online: duoBoost.client.isOnline}"></div></h5>
              <button @click="openService(duoBoost)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="duoBoost.details.date_deadline">Até {{ formatDate(duoBoost.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="duoBoost.boosterAmount">R$ {{ duoBoost.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'leagueOfLegends' && activeTab === 'duoBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>

      <!--
      League of Legends Services
      -->
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'eloBoosts' && inProgressWildRiftEloBoosts && inProgressWildRiftEloBoosts.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressWildRiftEloBoosts && inProgressWildRiftEloBoosts.length > 0">
          <div v-for="service in inProgressWildRiftEloBoosts" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ service.client.username }} <div class="user-status" :class="{online: service.client.isOnline}"></div></h5>
              <button @click="openService(service)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
              <div class="start-point">
                <img :src="elos[service.details.initial_tier]" />
                <span style="white-space: nowrap;">
                  <strong v-if="hasDivision(service.details.initial_tier)">{{service.details.initial_division.toUpperCase()}}</strong>
                  <small v-if="service.details.initial_tier !== 'unranked'">({{service.details.initial_lp}} LP's)</small>
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="service.details.date_deadline">Até {{ formatDate(service.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="service.boosterAmount">R$ {{ service.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'eloBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'placements' && inProgressWildRiftPlacements && inProgressWildRiftPlacements.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressWildRiftPlacements && inProgressWildRiftPlacements.length > 0">
          <div v-for="service in inProgressWildRiftPlacements" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ service: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ service.client.username }} <div class="user-status" :class="{online: service.client.isOnline}"></div></h5>
              <button @click="openService(service)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="service.details.date_deadline">Até {{ formatDate(service.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="service.boosterAmount">R$ {{ service.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'placements'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'winBoosts' && inProgressWildRiftWinBoosts && inProgressWildRiftWinBoosts.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressWildRiftWinBoosts && inProgressWildRiftWinBoosts.length > 0">
          <div v-for="service in inProgressWildRiftWinBoosts" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="client">Cliente: {{ service.client.username }} <div class="user-status" :class="{online: service.client.isOnline}"></div></h5>
              <button @click="openService(service)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="service.details.date_deadline">Até {{ formatDate(service.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="service.boosterAmount">R$ {{ service.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'winBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
      <OverlayScrollbar v-if="defaultGame === 'wildRift' && activeTab === 'duoBoosts' && inProgressWildRiftDuoBoosts && inProgressWildRiftDuoBoosts.length> 0" style="height: calc(100% - 100px)">
        <div class="service-list" v-if="inProgressWildRiftDuoBoosts && inProgressWildRiftDuoBoosts.length > 0">
          <div v-for="service in inProgressWildRiftDuoBoosts" :key="service.id" class="service animated fadeIn">
            <div style="display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0;">
              <h3 style="margin-bottom: 3px;">
                Serviço #{{ service.id }}
                <span class="description-icon" v-if="service.description">
                  <ion-icon  name="alert-circle-outline" v-tippy="{ placement: 'right', arrow: true }" :content="service.description"></ion-icon>
                </span>
              </h3>
              <h5 class="server" v-if="service.details.server">Servidor: {{ service.details.server.toUpperCase() }}</h5>
              <h5 class="plan" v-if="service.details.plan && parseInt(service.details.plan) === 1">Plano: Básico</h5>
              <h5 class="plan" v-else-if="service.details.plan && parseInt(service.details.plan) === 2">Plano: Estendido</h5>
              <h5 class="plan" v-else-if="service.details.plan && parseInt(service.details.plan) === 3">Plano: Premium</h5>
              <h5 class="client">Cliente: {{ service.client.username }} <div class="user-status" :class="{online: service.client.isOnline}"></div></h5>
              <button @click="openService(service)" class="open-service">Acompanhar</button>
            </div>
            <div class="service-summary">
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
            <div class="service-details">
              <ul>
                <li class="detail deadline">
                  <strong><ion-icon name="hourglass-outline"></ion-icon></strong>
                  <span v-if="service.details.date_deadline">Até {{ formatDate(service.details.date_deadline) }}</span>
                  <span v-else>---</span>
                </li>
                <li class="detail earning">
                  <strong><ion-icon name="wallet-outline"></ion-icon></strong>
                  <span v-if="service.boosterAmount">R$ {{ service.boosterAmount.replace('.',',') }}</span>
                  <span v-else>---</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else>Nenhum serviço encontrado neste seção...</p>
      </OverlayScrollbar>
      <div v-else-if="defaultGame === 'wildRift' && activeTab === 'duoBoosts'">
        <p>Nenhum serviço encontrado neste seção...</p>
      </div>
    </div>
    <div class="page-content" v-else style="display: flex; align-items: center; justify-content: center;">
      <AppLoading class="animated fadeIn" :text="loadingServicesText"></AppLoading>
    </div>
  </div>
</template>

<script>
import { badgeUrl } from '@/config/assets'
import { mapState, mapMutations, mapGetters } from '@/stores/compat'
import dayjs from 'dayjs'
import LeagueOfLegendsButtonComponent from '@/components/Buttons/LeagueOfLegends.vue'
import WildRiftButtonComponent from '@/components/Buttons/WildRift.vue'

export default {
  name: 'Services',
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
    ...mapState('settings', ['defaultGame']),
    ...mapState('services', ['isLoadingServices', 'loadingServicesText']),
    ...mapGetters('services', [
      'inProgressEloBoosts', 'inProgressPlacements', 'inProgressDuoBoosts', 'inProgressWinBoosts',
      'inProgressWildRiftEloBoosts', 'inProgressWildRiftPlacements', 'inProgressWildRiftDuoBoosts', 'inProgressWildRiftWinBoosts'
    ]),
    inProgressLeagueOfLegendsServicesCount(){
      return this.inProgressEloBoosts.length + this.inProgressPlacements.length + this.inProgressDuoBoosts.length + this.inProgressWinBoosts.length
    },
    inProgressWildRiftServicesCount(){
      return this.inProgressWildRiftEloBoosts.length + this.inProgressWildRiftPlacements.length + this.inProgressWildRiftDuoBoosts.length + this.inProgressWildRiftWinBoosts.length
    }
  },
  methods: {
    ...mapMutations('settings', ['setDefaultGame']),
    formatDate (dateDeadline) {
      return dayjs(dateDeadline).format("DD/MM/YY HH:mm")
    },
    openService (eloBoost) {
      this.$router.push('/services/' + eloBoost.id)
    },
    hasDivision (tier) {
      return tier !== 'unranked' && tier !== 'master' && tier !== 'grandmaster' && tier !== 'challenger'
    }
  }
}
</script>

<style lang="scss">
  h1 {
    color: #FFF;
  }
  
  .services-menu-link {
    color: #3e6082;
    &.active {
      color: #85d0ff;
    }
    .count-label {
      font-size: 12px;
      width: 15px;
      height: 15px;
      background-color: #3e6082;
      color: #85d0ff;
      border-radius: 50%;
      padding: 0 5px;
      position: relative;
      top: -1px;
      margin-left: 5px;
    }
  }

  .services--container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-right: 0;
    flex-direction: column;
    padding-top: 0px;
    overflow-y: hidden;

    ul.game-list {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
      height: 26px;
      margin-top: 18.72px;
      margin-bottom: 30px;
      margin-right: 8px;
      padding-right: 10px;
      border-right: 1px solid #FFFFFF;
      
      li {
        margin: 0;
        list-style: none;
        display: flex;
        flex-direction: row;
        align-items: center;
        position: relative;
        .count-label {
          position: absolute;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background-color: rgba(0,0,0,.8);
          color: #85d0ff;
          border-radius: 50%;
          padding: 0 5px;
          top: -10px;
          right: 20px;
          pointer-events: none;
        }
        &:last-child .count-label {
          right: -5px;
        }
        .svg-container {
          position: relative;
          top: 5px;
        }
        &:after {
          content: "-";
          margin-right: 7px;
          margin-left: 4px;
          color: #FFFFFF;
          font-size: 18.72px;
          font-weight: 700;
        }
        &:last-child {
          margin-right: 0;
          &:after {
            content: "";
            margin-left: 0;
            margin-right: 0;
          }
        }
      }
    }

    .service-categories {
      height: 26px;
      margin-bottom: 30px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      a {
        margin: 0 7px;
      }
      .refresh-servies-button {
        font-size: 30px;
        position: relative;
        top: 5px;
        margin-left: 7px;
        color: #FFF;
        transition: .3s all;
        &:hover {
          color: #85d0ff;;
        }
      }
    }
    h3 {
      position: relative;
      color: #FFFFFF;
      .description-icon {
        position: absolute;
        top: -10px;
        right: -18px;
        font-size: 15px;
      }
    }
    > div.page-content {
      width: 100%;
      height: 100%;
    }
    .service-list {
      display: flex;
      flex-direction: column;
      width: 100%;
      overflow-x: hidden;
      flex-grow: 1;
      .service {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        background: rgba(18,18,25,.5);
        margin-bottom: 20px;
        border-top-left-radius: 30px;
        border-bottom-left-radius: 30px;
        padding-left: 30px;
        padding-top: 20px;
        padding-bottom: 20px;
        &:last-child {
          margin-bottom: 0;
        }
        h3 {
          margin-top: 0;
          line-height: 100%;
        }
        h5 {
          margin-top: 5px;
          margin-bottom: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          &.server {
          }
          &.plan {
            margin-top: 0;
          }
          &.client {
            margin-top: 0;
          }
          div.user-status {
            width: 7px;
            height: 7px;
            border-radius: 7px;
            background-color: rgb(102, 102, 102);
            margin-left: 5px;
            transition: 2s all;
            &.online {
              background-color: lime;
              box-shadow: inset 0 0 1px lime, 0 0 3px lime;
            }
          }
        }
        button.open-service {
          margin-top: 20px;
          background: transparent;
          padding: 8px 12px;
          border: 1px solid #85d0ff;
          color: #85d0ff;
          border-radius: 5px;
          transition: 1s all;
          cursor: pointer;
          &:hover {
            border: 1px solid #FFF;
            color: #FFF;
            background-color: rgba(255,255,255,.1);
          }
        }
        .service-summary {
          margin-left: 30px;
          display: flex;
          flex-direction: row;
          padding-left: 30px;
          border-left: 1px solid rgba(255,255,255,.1);
          align-self: stretch;
          align-items: center;

          .start-point {
            display: flex;
            position: relative;
            align-items: center;
            justify-content: center;
            span {
              bottom: 3px;
              position: absolute;
              padding: 0px 7px;
              background-color: rgba(255,255,255,.8);
              font-size: 12px;
              font-weight: 800;
              border-radius: 5px;
              strong {
                margin-right: 3px;
              }
            }
          }

          .arrow-icon {
            display: flex;
            align-items: center;
            flex-direction: column;
            font-size: 20px;
            margin: 0 20px;
            color: #FFF;
            font-size: 20px;
            span {
              font-size: 11px;
              margin-bottom: 3px;
              white-space: nowrap;
              font-weight: 800;
              color: rgb(170, 170, 170);
            }
          }

          .spacer {
            width: 30px;
          }

          .destination-point {
            display: flex;
            position: relative;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            span {
              bottom: 3px;
              position: absolute;
              padding: 0px 7px;
              background-color: rgba(255,255,255,.8);
              font-weight: 800;
              border-radius: 5px;
              font-size: 12px;
              color: #3e6082;
              strong {
                margin-right: 3px;
              }
              &.initial-type {
                position: initial;
                margin-bottom: 5px;
                background-color: transparent;
                padding: 0;
                color: #FFFFFF;
                &:last-child {
                  margin-bottom: 0;
                }
              }
            }
          }
        }
        .service-details {
          border-left: 1px solid rgba(255,255,255,.1);
          margin-left: 30px;
          padding-left: 30px;
          padding-right: 30px;
          flex-grow: 1;
          align-self: stretch;
          display: flex;
          align-items: center;
          .extra {
            outline: 0;
          }
          p {
            font-size: 14px;
            width: 100%;
            text-align: center;
          }
          ul {
            display: flex;
            flex-direction: column;
            margin-left: 0;
            padding-left: 0;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
            li.detail {
              list-style: none;
              display: flex;
              flex-direction: row;
              align-items: center; justify-content: center;
              margin-bottom: 5px;
              font-size: 13px;
              color: rgb(170, 170, 170);
              &.earning {
                strong {
                  top: 2px;
                }
              }
              strong {
                position: relative;
                top: 1px;
                font-size: 15px;
                margin-right: 5px;
              }
              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }
  .panels {
    > .panel{
      &:first-child {
        margin-top: 0;
      }
    }
    .panel {
      background: rgba(18,18,25,.5);
      border-radius: 30px;
      display: flex;
      margin-top: 20px;
      min-height: 100px;
      width: 100%;
    }
  }
  
  .your-online-system {
    display: flex;
    flex-direction: column;
    padding: 40px;
    position: relative;
    h3 {
      color: #FFFFFF;
      margin: 0;
      font-size: 25px;
    }
    .quick-links {
      margin-top: 10px;
      .button {
        height: 30px;
        margin-right: 10px;
        span {
          font-size: 15px;
        }
      }
    }
  }

  .social-links {
    .panel {
      display: flex; 
      align-items: center; 
      justify-content: center;
      transition: .2s all;
      &:hover {
        transform: scale(1.05);
      }
      h2 {
        color: rgb(133, 208, 255);
        font-size: 17px;
      }
    }
  }
</style>
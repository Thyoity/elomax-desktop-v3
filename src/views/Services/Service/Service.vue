<template>
  <div v-if="service" class="service--container">
    <div class="service-title animated fadeIn">
      <a class="back" href="javascript:void(0)" @click="$router.back()"
        ><ion-icon name="arrow-back-circle-outline"></ion-icon
        ><span>Voltar</span></a
      >
      <h1>Serviço #{{ $route.params.id }}</h1>
    </div>
    <h3 class="animated fadeIn service-categories">
      <a
        class="services-menu-link"
        :class="{ active: activeTab === 'summary' }"
        href="javascript: void(0)"
        @click="changeTab('summary')"
        >Detalhes</a
      >
      -
      <a
        class="services-menu-link"
        :class="{ active: activeTab === 'chat' }"
        href="javascript: void(0)"
        @click="changeTab('chat')"
        >Chat</a
      >
      -
      <a
        class="services-menu-link"
        :class="{ active: activeTab === 'finish' }"
        href="javascript: void(0)"
        @click="changeTab('finish')"
        >Finalizar</a
      >
    </h3>
    <OverlayScrollbar v-if="activeTab === 'summary'" style="height: calc(100% - 160px)">
      <AppTftServiceSummary v-if="service.type.includes('tft')" :service="service"></AppTftServiceSummary>
      <AppValorantServiceSummary v-if="service.type.includes('valorant')" :service="service"></AppValorantServiceSummary>
      <div v-else>
        <div
          v-if="service.type === 'eloBoost'"
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
          v-if="service.type === 'maintenance'"
          class="tab-row service-details animated fadeIn"
          style="animation-delay: 0.15s"
        >
          <h3>
            Manutenção de Elo ({{
              service.details.server
                ? service.details.server.toUpperCase()
                : "BR"
            }})
          </h3>
          <div class="road">
            <div class="start-point">
              <img :src="eloImgs[service.details.tier]" />
              <span style="white-space: nowrap">
                <small>({{ service.details.lp }} LP's)</small>
              </span>
            </div>
            <div class="spacer"></div>
            <div class="destination-point">
              <span
                class="initial-type"
                v-if="service.details.queue === 'solo_duo'"
                >Solo / Duo</span
              >
              <span
                class="initial-type"
                v-else-if="service.details.queue === 'flex'"
                >Flex</span
              >
              <span
                class="initial-type"
                >{{ service.details.weeks }} semana(s)</span
              >
              <span
                class="initial-type"
                >{{ service.details.decay_days }} dia(s) para decaimento</span
              >
            </div>
          </div>
        </div>
        <div
          v-if="service.type === 'coaching'"
          class="tab-row service-details animated fadeIn"
          style="animation-delay: 0.15s"
        >
          <h3>
            Coaching
          </h3>
          <div class="road">
            <div class="start-point">
              <img :src="eloImgs[service.details.current_tier]" />
              <span v-if="service.details.current_division && service.details.current_tier !== 'unranked' && 
              service.details.current_tier !== 'master' && service.details.current_tier !== 'grandmaster' && 
              service.details.current_tier !== 'challenger'" style="white-space: nowrap">
                <small>({{ service.details.current_division.toUpperCase() }})</small>
              </span>
            </div>
            <div class="spacer"></div>
            <div class="destination-point">
              <span
                class="initial-type"
                >{{ service.details.class_count }} aula(s)</span
              >
              <span
                class="initial-type"
                v-if="service.details.type === 'classic'"
                >Modelo: Clássico</span
              >
              <span
                class="initial-type"
                v-else-if="service.details.type === 'monochampion'"
                >Modelo: Mono-champion</span
              >
              <span
                class="initial-type"
                v-if="service.details.primary_route"
                >Rota 1ª: {{ service.details.primary_route.toUpperCase() }}</span
              >
              <span
                class="initial-type"
                v-if="service.details.secondary_route"
                >Rota 2ª: {{ service.details.secondary_route.toUpperCase() }}</span
              >
            </div>
          </div>
          <div v-if="service.details.type === 'classic'" class="coaching-champions">
            <h3>
              Campeões selecionados
            </h3>
            <ul>
              <li v-for="selectedChampion in JSON.parse(service.details.coaching_form).selectedChampions" :key="selectedChampion">
                <img :src="championImageUrl(selectedChampion)" />
              </li>
            </ul>
          </div>
          <div v-else-if="service.details.type === 'monochampion'" class="coaching-champions">
            <h3>
              Campeão selecionado
            </h3>
            <ul>
              <li>
                <img :src="championImageUrl(JSON.parse(service.details.coaching_form).selectedChampion)" />
              </li>
            </ul>
          </div>
          <div
            v-if="service.details.details"
            style="margin-top: 20px;"
          >
            <h3>Dificuldades do cliente</h3>
            <p>{{ service.details.details }}</p>
          </div>
          <div
            v-if="service.details.time"
            style="margin-top: 20px;"
          >
            <h3>Horários do cliente</h3>
            <p>{{ service.details.time }}</p>
          </div>
        </div>
        <div
          v-if="service.type === 'replayAnalysis'"
          class="tab-row service-details animated fadeIn"
          style="animation-delay: 0.15s"
        >
          <h3>
            Análise de Replay
          </h3>
          <div class="road">
            <div class="start-point">
              <img :src="eloImgs[service.details.tier]" />
              <span v-if="service.details.division && service.details.tier !== 'unranked' && 
              service.details.tier !== 'master' && service.details.tier !== 'grandmaster' && 
              service.details.tier !== 'challenger'" style="white-space: nowrap">
                <small>({{ service.details.division.toUpperCase() }})</small>
              </span>
            </div>
            <div class="spacer"></div>
            <div class="destination-point">
              <img :src="championImageUrl(service.details.id_champion)" style="margin-bottom: 8px;" />
              <span
                class="initial-type"
                v-if="service.details.route"
                >Rota: {{ service.details.route.toUpperCase() }}</span
              >
            </div>
          </div>
          <a class="button" :href="`${WEB_BASE_URL}/files/replays/${service.details.file_name}`" target="_blank" download style="width: 240px; margin: 0 auto; margin-top: 20px;">Ver imagem do Replay</a>
          <div class="coach-review-form">
            <h3>
              Avaliação do Coach
            </h3>
            <div v-for="(coachReviewFormItem, index) in coachReviewForm" :key="index" class="coach-review-form-group">
              <label>{{ coachReviewFormItem.title }}</label>
              <textarea :placeholder="coachReviewFormItem.placeholder" v-model="coachReviewFormItem.text"></textarea>
            </div>
            <a
              href="javascript:void(0)"
              class="button"
              style="margin: 0 auto; margin-top: 8px; width: 200px;"
              @click="saveReplayAnalysisCoachReview()"
              v-if="!isSavingCoachReview"
              >Salvar</a
            >
            <a
              href="javascript:void(0)"
              class="button"
              style="margin: 0 auto; margin-top: 8px; width: 200px;"
              v-else
              >Salvando avaliação...</a
            >
          </div>
        </div>
        <div
          v-else-if="service.type === 'placement'"
          class="tab-row service-details animated fadeIn"
          style="animation-delay: 0.15s"
        >
          <h3>
            Classificatória ({{
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
              <span
                class="initial-type"
                v-if="service.details.queue === 'solo_duo'"
                >Solo / Duo</span
              >
              <span
                class="initial-type"
                v-else-if="service.details.queue === 'flex'"
                >Flex</span
              >
              <span
                class="initial-type"
                v-if="service.details.type === 'duo'"
                style="white-space: nowrap"
                >Duo Boost</span
              >
              <span class="initial-type" v-else style="white-space: nowrap"
                >Boost</span
              >
              <span class="initial-type" style="white-space: nowrap"
                >{{ service.details.games }} vitórias</span
              >
            </div>
          </div>
        </div>
        <div
          v-else-if="service.type === 'mastery'"
          class="tab-row service-details animated fadeIn"
          style="animation-delay: 0.15s"
        >
          <h3>
            Maestria ({{
              service.details.server
                ? service.details.server.toUpperCase()
                : "BR"
            }})
          </h3>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Inicial</th>
                <th>Destino</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="championMastery in service.details.services"
                :key="championMastery.champion"
              >
                <td>
                  <img
                    :src="championImageUrl(championMastery.champion)"
                  />
                </td>
                <td>
                  {{ championMastery.initial_mastery }}
                </td>
                <td>
                  {{ championMastery.desired_mastery }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else-if="service.type === 'winBoost'"
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
              <span
                class="initial-type"
                v-if="service.details.queue === 'solo_duo'"
                >Solo / Duo</span
              >
              <span
                class="initial-type"
                v-else-if="service.details.queue === 'flex'"
                >Flex</span
              >
              <span class="initial-type" style="white-space: nowrap"
                >{{ service.details.desired_victories }} vitórias</span
              >
            </div>
          </div>
        </div>
        <div
          v-else-if="service.type === 'duoBoost'"
          class="tab-row service-details animated fadeIn"
          style="animation-delay: 0.15s"
        >
          <h3>
            Duo Boost
            <span
              v-if="service.details.plan && parseInt(service.details.plan) === 1"
              >(Básico)</span
            ><span
              v-else-if="
                service.details.plan && parseInt(service.details.plan) === 2
              "
              >(Estendido)</span
            ><span
              v-else-if="
                service.details.plan && parseInt(service.details.plan) === 3
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
              <span v-if="service.details.queue === 'solo_duo'">Solo / Duo</span>
              <span v-else-if="service.details.queue === 'flex'">Flex</span>
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
              <span
                class="initial-type"
                v-if="service.details.queue === 'solo_duo'"
                >Solo / Duo</span
              >
              <span
                class="initial-type"
                v-else-if="service.details.queue === 'flex'"
                >Flex</span
              >
              <span class="initial-type" style="white-space: nowrap"
                >{{ service.details.desired_victories }} vitórias</span
              >
            </div>
          </div>
        </div>
      </div>
      

      <div
        class="tab-row extras-list animated fadeIn"
        style="animation-delay: 0.3s"
      >
        <h3>Extras pagos</h3>
        <ul v-if="service.details.extras && service.details.extras.length">
          <li v-for="extra in service.details.extras" :key="extra.type">
            <AppExtra
              class="extra"
              :type="extra.type"
              :value="extra.value"
            ></AppExtra>
          </li>
        </ul>
        <p v-else>Sem extras inclusos.</p>
      </div>
      <div
        v-if="
          service.type === 'eloBoost' ||
          service.type === 'placement' ||
          service.type === 'winBoost' ||
          service.type === 'mastery' ||
          service.type === 'maintenance' ||
          service.type === 'coaching' ||
          (service.type === 'duoBoost' && service.details.type === 'victory') ||

          service.type === 'valorantEloBoost' ||
          service.type === 'valorantWinBoost' ||
          service.type === 'valorantPlacement' ||
          (service.type === 'valorantDuoBoost' && service.details.type === 'win') ||

          service.type === 'tftEloBoost' ||
          service.type === 'tftWinBoost' ||
          service.type === 'tftPlacement' ||
          service.type === 'tftPass'
        "
        class="tab-row controls animated fadeIn"
        style="animation-delay: 0.45s"
      >
        <h3>Controles</h3>
        <div style="display: flex; flex-direction: row">
          <div
            v-if="
              service.type === 'winBoost' ||
              (service.type === 'duoBoost' && service.details.type === 'victory') ||
              service.type === 'valorantWinBoost' ||
              (service.type === 'valorantDuoBoost' && service.details.type === 'win') ||
              service.type === 'tftWinBoost'
            "
            class="control win-balance"
          >
            <h3>
              {{ service.details.current_victories }} /
              {{ service.details.desired_victories }}
            </h3>
            <div class="victory-defeat-pad-controls">
              <a
                href="javascript:void(0)"
                @click="updateWinBalanceCount('add')"
                class="victory-button"
                style="margin-bottom: 5px"
                ><ion-icon name="add-circle-outline"></ion-icon
              ></a>
              <a
                href="javascript:void(0)"
                @click="updateWinBalanceCount('remove')"
                class="victory-button"
                ><ion-icon name="remove-circle-outline"></ion-icon
              ></a>
            </div>
          </div>
          <div
            v-if="service.type === 'coaching'"
            class="control win-balance"
          >
            <h3>
              {{ service.details.current_class_count }} /
              {{ service.details.class_count }}
            </h3>
            <div class="victory-defeat-pad-controls">
              <a
                href="javascript:void(0)"
                @click="updateClassCount('add')"
                class="victory-button"
                style="margin-bottom: 5px"
                ><ion-icon name="add-circle-outline"></ion-icon
              ></a>
              <a
                href="javascript:void(0)"
                @click="updateClassCount('remove')"
                class="victory-button"
                ><ion-icon name="remove-circle-outline"></ion-icon
              ></a>
            </div>
          </div>
          <div
            v-if="service.type === 'placement' || service.type === 'valorantPlacement' || service.type === 'tftPlacement'"
            class="control victory-defeat-pad"
          >
            <div class="victory-defeat-pad-numbers">
              <h3>{{ service.details.victories }}</h3>
              <h3>{{ service.details.defeats }}</h3>
            </div>
            <div class="victory-defeat-pad-controls">
              <div style="display: flex; flex-direction: row">
                <a
                  href="javascript:void(0)"
                  @click="updateServiceVictoriesDefeats('add-victory')"
                  class="victory-button"
                  style="margin-bottom: 5px"
                  ><ion-icon name="add-circle-outline"></ion-icon
                ></a>
                <a
                  href="javascript:void(0)"
                  @click="updateServiceVictoriesDefeats('remove-victory')"
                  class="victory-button"
                  ><ion-icon name="remove-circle-outline"></ion-icon
                ></a>
              </div>
              <div style="display: flex; flex-direction: row">
                <a
                  href="javascript:void(0)"
                  @click="updateServiceVictoriesDefeats('add-defeat')"
                  class="victory-button"
                  ><ion-icon name="add-circle-outline"></ion-icon
                ></a>
                <a
                  href="javascript:void(0)"
                  @click="updateServiceVictoriesDefeats('remove-defeat')"
                  class="victory-button"
                  ><ion-icon name="remove-circle-outline"></ion-icon
                ></a>
              </div>
            </div>
            <div class="victory-defeat-pad-controls">
              <h3>/ {{ service.details.games }}</h3>
            </div>
          </div>
          <div
            v-if="
              service.type === 'eloBoost' ||
              service.type === 'placement' ||
              service.type === 'winBoost' ||
              service.type === 'mastery' ||
              service.type === 'maintenance' ||

              service.type === 'valorantEloBoost' ||
              service.type === 'valorantWinBoost' ||
              service.type === 'valorantPlacement' ||

              service.type === 'tftEloBoost' ||
              service.type === 'tftWinBoost' ||
              service.type === 'tftPlacement' ||
              service.type === 'tftPass'
            "
            class="control account-status"
            :class="{
              'not-in-use': service.details.account_status === 'not_in_use',
              'in-use': service.details.account_status === 'in_use',
            }"
            @click="toggleAccountStatus()"
          >
            <ion-icon
              name="power-outline"
              style="font-size: 30px; margin-right: 10px"
            ></ion-icon>
            <strong v-if="service.details.account_status === 'in_use'"
              >Marcar como "Conta Livre"</strong
            >
            <strong v-else-if="service.details.account_status === 'not_in_use'"
              >Marcar como "Conta em uso"</strong
            >
          </div>
        </div>
      </div>
      <div
        v-if="service.description"
        class="tab-row description animated fadeIn"
        style="animation-delay: 0.45s"
      >
        <h3>Observação</h3>
        <p>{{ service.description }}</p>
      </div>
      <div
        class="tab-row deadline animated fadeIn"
        style="animation-delay: 0.45s"
      >
        <h3>Prazo</h3>
        <p>
          Até:
          <strong
            style="
              background-color: rgba(255, 255, 255, 0.1);
              color: #85d0ff;
              padding: 2px 5px;
            "
            >{{ deadline }}</strong
          >
        </p>
      </div>
      <div
        v-if="service.type === 'eloBoost'"
        class="tab-row access-data animated fadeIn"
        style="animation-delay: 0.6s"
      >
        <h3>Dados</h3>
        <table>
          <thead>
            <tr>
              <th>Invocador</th>
              <th>Login</th>
              <th>Senha</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  class="account-input"
                  type="text"
                  v-model="account.summoner"
                  placeholder="Invocador"
                />
              </td>
              <td>
                <input
                  class="account-input"
                  type="text"
                  v-model="account.account"
                  placeholder="Usuário"
                />
              </td>
              <td>
                <input
                  class="account-input"
                  type="text"
                  v-model="account.password"
                  placeholder="Senha"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <a
          href="javascript:void(0)"
          class="button"
          style="margin-top: 20px"
          @click="saveAccount()"
          v-if="isAccountDirty && !isSavingAccount"
          >Salvar</a
        >
        <a
          href="javascript:void(0)"
          class="button"
          style="margin-top: 20px"
          v-if="isSavingAccount"
          >Salvando conta...</a
        >
      </div>
      <div
        v-else
        class="tab-row access-data animated fadeIn"
        style="animation-delay: 0.6s"
      >
        <h3>Dados</h3>
        <table>
          <thead>
            <tr v-if="service.details.account">
              <th>Invocador</th>
              <th>Login</th>
              <th>Senha</th>
            </tr>
            <tr v-else>
              <th>Invocador</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="service.details.account">
              <td>{{ service.details.account.summoner }}</td>
              <td>{{ service.details.account.account }}</td>
              <td>{{ service.details.account.password }}</td>
            </tr>
            <tr v-else>
              <td>{{ service.details.summoner }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="service.boosterAmount"
        class="tab-row awards animated fadeIn"
        style="animation-delay: 0.6s"
      >
        <h3>Recompensas</h3>
        <p>
          Ao finalizar este serviço, você receberá
          <strong
            style="
              background-color: rgba(255, 255, 255, 0.1);
              color: #85d0ff;
              padding: 2px 5px;
            "
            >R$ {{ service.boosterAmount.replace(".", ",") }}</strong
          >.
        </p>
      </div>
    </OverlayScrollbar>
    <div
      v-if="activeTab === 'chat'"
      style="height: calc(100% - 160px); width: 100%"
    >
      <AppChat :service="service"></AppChat>
    </div>
    <div
      v-if="activeTab === 'finish'"
      style="height: calc(100% - 160px); width: 100%"
    >
      <AppFinish :service="service"></AppFinish>
    </div>
  </div>
  <div v-else class="service--container">
    <div class="service-title animated fadeIn">
      <a class="back" href="javascript:void(0)" @click="$router.back()"
        ><ion-icon name="arrow-back-circle-outline"></ion-icon
        ><span>Voltar</span></a
      >
      <h1>Serviço #{{ $route.params.id }}</h1>
    </div>
    <div style="display: flex; align-items: center; justify-content: center">
      <AppLoading
        class="animated fadeIn"
        :text="'Carregando serviço...'"
      ></AppLoading>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { badgeUrl } from '@/config/assets'
import { API_BASE_URL, championImageUrl } from '@/config/api'
import { mapState, mapMutations } from "@/stores/compat";
import _ from "lodash";
import axios from "axios";
import dayjs from "dayjs";

export default {
  name: "MyServices",
  // Vue 3 doesn't auto-wrap a bare `() => import(...)` like Vue 2 did — it
  // renders the returned Promise literally, which is what produced the
  // "[object Promise]" string inside the chat. `defineAsyncComponent` is the
  // supported way to register lazy-loaded SFCs.
  components: {
    AppChat: defineAsyncComponent(() => import("./Chat.vue")),
    AppFinish: defineAsyncComponent(() => import("./Finish.vue")),
    AppTftServiceSummary: defineAsyncComponent(() => import("./TftServiceSummary.vue")),
    AppValorantServiceSummary: defineAsyncComponent(() => import("./ValorantServiceSummary.vue")),
  },
  data() {
    return {
      service: null,
      activeTab: "summary",
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
      isSavingAccount: false,
      initialAccount: null,
      account: {
        account: "",
        summoner: "",
        password: "",
      },
      isSavingCoachReview: false,
      coachReviewForm: [
        {
          title: "Sobre o campeão escolhido",
          text: "",
          placeholder: 'Coloque aqui a respeito do campeão escolhido pelo cliente. Seus pontos fortes, seus pontos fracos e qual função ele deve/deveria desempenhar na partida'
        },
        {
          title: "Anotações sobre Runas",
          text: "",
          placeholder: 'Coloque aqui sobre as runas escolhidas pelo cliente, se estão certas ou corrija, também cite runas situacionais que poderiam ser melhores opções e o caso de usá-las'
        },
        {
          title: "Anotações sobre Build",
          text: "",
          placeholder: 'Coloque aqui sobre a build escolhidas pelo cliente, se estão certas ou corrija, também cite itens situacionais que poderiam ser melhores as opções e o caso de usá-los'
        },
        {
          title: "Anotações Gerais da partida",
          text: "",
          placeholder: 'Disserte aqui sobre a partida em geral, com marcas de tempo para fazer referência (Ex: 01:50 - Texto). Separe os tópicos por linha e vá dissecando a partida, desde a fase de rotas, mid game e late game. Procure pontuar também sobre wards, movimentações, tf, erros, controle, objetivos, farm e tudo que achar necessário pontuar'
        },
        {
          title: "O que deve ser evitado",
          text: "",
          placeholder: 'Coloque aqui o que deve ser evitado pelo cliente, cite seus erros e como eles deveriam ser evitados'
        },
        {
          title: "O que deve ser melhorado",
          text: "",
          placeholder: 'Coloque aqui pontos de atenção, o que você acha que o cliente deve focar em melhorar e dê dicas de como fazê-lo'
        }
      ]
    };
  },
  computed: {
    ...mapState("auth", ["token"]),
    ...mapState("services", [
      "isLoadingServices",
      "loadingServicesText",

      "eloBoosts",
      "placements",
      "duoBoosts",
      "winBoosts",
      "masteries",
      "maintenances",
      "coachings",
      "replayAnalyses",

      "valorantEloBoosts",
      "valorantPlacements",
      "valorantDuoBoosts",
      "valorantWinBoosts",

      "wildRiftEloBoosts",
      "wildRiftPlacements",
      "wildRiftDuoBoosts",
      "wildRiftWinBoosts",

      "tftEloBoosts",
      "tftPlacements",
      "tftWinBoosts",
      "tftPasses",
    ]),
    deadline() {
      if (
        this.service &&
        this.service.details &&
        this.service.details.date_deadline
      ) {
        return (
          _.startCase(
            dayjs(this.service.details.date_deadline).format("ddd")
          ) +
          ", " +
          dayjs(this.service.details.date_deadline).format("DD/MM/YY HH:mm")
        );
      }
      return "Sem prazo.";
    },
    isAccountDirty() {
      return JSON.stringify(this.account) !== this.initialAccount;
    },
  },
  methods: {
    ...mapMutations(["setCurrentService"]),
    ...mapMutations("services", [
      "setTempService",
      "resetTempService",
      "setServiceAccount",
      "setServiceAccountStatus",
      "setServiceCurrentVictories",
      "setServiceCurrentClassCount",
      "setServiceVictoriesDefeats",
    ]),
    setAccountForm() {
      this.account.account =
        this.service.details &&
        this.service.details.account &&
        this.service.details.account.account
          ? this.service.details.account.account
          : "";
      this.account.summoner =
        this.service.details &&
        this.service.details.account &&
        this.service.details.account.summoner
          ? this.service.details.account.summoner
          : "";
      this.account.password =
        this.service.details &&
        this.service.details.account &&
        this.service.details.account.password
          ? this.service.details.account.password
          : "";
      this.initialAccount = JSON.stringify(this.account);
    },
    async loadService(serviceId) {

      const eloBoost = _.find(this.eloBoosts, { id: serviceId });
      const duoBoost = _.find(this.duoBoosts, { id: serviceId });
      const placement = _.find(this.placements, { id: serviceId });
      const winBoost = _.find(this.winBoosts, { id: serviceId });
      const mastery = _.find(this.masteries, { id: serviceId });
      const maintenance = _.find(this.maintenances, { id: serviceId });
      const coaching = _.find(this.coachings, { id: serviceId });
      const replayAnalysis = _.find(this.replayAnalyses, { id: serviceId });

      const valorantEloBoost = _.find(this.valorantEloBoosts, {
        id: serviceId,
      });
      const valorantDuoBoost = _.find(this.valorantDuoBoosts, {
        id: serviceId,
      });
      const valorantPlacement = _.find(this.valorantPlacements, {
        id: serviceId,
      });
      const valorantWinBoost = _.find(this.valorantWinBoosts, {
        id: serviceId,
      });

      const wildRiftEloBoost = _.find(this.wildRiftEloBoosts, {
        id: serviceId,
      });
      const wildRiftDuoBoost = _.find(this.wildRiftDuoBoosts, {
        id: serviceId,
      });
      const wildRiftPlacement = _.find(this.wildRiftPlacements, {
        id: serviceId,
      });
      const wildRiftWinBoost = _.find(this.wildRiftWinBoosts, {
        id: serviceId,
      });

      const tftEloBoost = _.find(this.tftEloBoosts, {
        id: serviceId,
      });
      const tftPass = _.find(this.tftPasses, {
        id: serviceId,
      });
      const tftPlacement = _.find(this.tftPlacements, {
        id: serviceId,
      });
      const tftWinBoost = _.find(this.tftWinBoosts, {
        id: serviceId,
      });

      const service =
        eloBoost ||
        duoBoost ||
        placement ||
        winBoost ||
        mastery ||
        maintenance ||
        coaching ||
        replayAnalysis ||
        valorantEloBoost ||
        valorantDuoBoost ||
        valorantPlacement ||
        valorantWinBoost ||
        wildRiftEloBoost ||
        wildRiftDuoBoost ||
        wildRiftPlacement ||
        wildRiftWinBoost ||
        tftEloBoost ||
        tftPlacement ||
        tftWinBoost ||
        tftPass;

      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/services/${serviceId}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        if (!data.success) {
          this.$toast.error(
            "Erro ao adquirir as informações do serviço.",
            "Ops",
            {
              position: "topCenter",
            }
          );
          this.$router.replace("/").catch(() => {});
          return;
        }
        this.setTempService({
          service: data.data,
          onLoad: (loadedService) => {
            this.service = loadedService;
            if (!this.service && service) this.service = service;
            if (
              this.service &&
              this.service.details &&
              this.service.details.account
            )
              this.setAccountForm();
          },
        });
      } catch {
        if (service) {
          this.service = service;
          if (this.service?.details?.account) this.setAccountForm();
        } else {
          this.$toast.error(
            "Erro ao adquirir as informações do serviço.",
            "Ops",
            { position: "topCenter" },
          );
          this.$router.replace("/").catch(() => {});
        }
      }
    },
    changeTab(tab) {
      const serviceId = parseInt(this.$route.params.id);
      this.activeTab = tab;
      this.setCurrentService({
        serviceId: serviceId,
        tab: tab,
      });
    },

    async saveAccount() {
      this.isSavingAccount = true;
      try {
        await axios.put(
          `${API_BASE_URL}/services/${this.service.id}/service-account`,
          {
            summoner: this.account.summoner,
            account: this.account.account,
            password: this.account.password,
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
      } catch (err) {}

      this.setServiceAccount({
        service: this.service,
        account: this.account,
      });
      this.initialAccount = JSON.stringify(this.account);
      this.isSavingAccount = false;
    },

    async saveReplayAnalysisCoachReview() {
      this.isSavingCoachReview = true;
      try {
        await axios.put(
          `${API_BASE_URL}/services/${this.service.id}/coach-review`,
          {
            coachReview: JSON.stringify(this.coachReviewForm)
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
      } catch (err) {}
      this.isSavingCoachReview = false;
    },

    async updateServiceVictoriesDefeats(operation) {
      try {
        await axios.post(
          `${API_BASE_URL}/services/${this.service.id}/victory-defeat/${operation}`,
          {},
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.setServiceVictoriesDefeats({
          service: this.service,
          operation,
        });
      } catch (err) {
        this.$toast.error("Erro ao atualizar as vitórias/derrotas.", "Ops", {
          position: "topCenter",
        });
      }
    },
    async updateWinBalanceCount(operation) {
      try {
        await axios.post(
          `${API_BASE_URL}/services/${this.service.id}/win-balance/${operation}`,
          {},
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.setServiceCurrentVictories({
          service: this.service,
          operation,
        });
      } catch (err) {
        this.$toast.error("Erro ao salvar o estado da conta.", "Ops", {
          position: "topCenter",
        });
      }
    },
    async updateClassCount(operation) {
      try {
        await axios.post(
          `${API_BASE_URL}/services/${this.service.id}/class-count/${operation}`,
          {},
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.setServiceCurrentClassCount({
          service: this.service,
          operation,
        });
      } catch (err) {
        this.$toast.error("Erro ao salvar o estado da conta.", "Ops", {
          position: "topCenter",
        });
      }
    },
    async toggleAccountStatus() {
      try {
        await axios.post(
          `${API_BASE_URL}/services/${this.service.id}/account-status`,
          {},
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.setServiceAccountStatus({
          service: this.service,
          accountStatus:
            this.service.details.account_status === "in_use"
              ? "not_in_use"
              : "in_use",
        });
      } catch (err) {
        this.$toast.error("Erro ao salvar o estado da conta.", "Ops", {
          position: "topCenter",
        });
      }
    },
    hasDivision(tier) {
      return (
        tier !== "unranked" &&
        tier !== "master" &&
        tier !== "grandmaster" &&
        tier !== "challenger"
      );
    },
  },
  mounted() {
    const serviceId = parseInt(this.$route.params.id);
    this.setCurrentService({
      serviceId: serviceId,
      tab: this.activeTab,
    });
    this.loadService(serviceId);
  },
  beforeUnmount() {
    this.resetTempService();
    this.setCurrentService({
      serviceId: null,
      tab: null,
    });
  },
};
</script>

<style lang="scss">
.service-title {
  display: flex;
  flex-direction: row;
  height: 85.88px !important;
  flex-shrink: 0;
  align-items: center;

  h1 {
    color: #fff;
  }
  a.back {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #85d0ff;
    font-size: 18px;
    margin-right: 30px;

    span {
      margin-left: 5px;
    }
  }
}

.services-menu-link {
  color: #3e6082;
  &.active {
    color: #85d0ff;
  }
}

.service--container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: 0;
  flex-direction: column;
  padding-top: 0px;
  overflow-y: hidden;
  .service-categories {
    margin-bottom: 30px;
  }
  h3 {
    color: #ffffff;
  }

  .tab-row {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;

    p {
      margin: 0;
    }

    &.service-details {
      .road {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .start-point {
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          span {
            bottom: 3px;
            position: absolute;
            padding: 0px 7px;
            background-color: rgba(255, 255, 255, 0.8);
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
          color: #fff;
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
            background-color: rgba(255, 255, 255, 0.8);
            font-weight: 800;
            border-radius: 5px;
            font-size: 12px;
            color: #3e6082;
            &.initial-type {
              position: initial;
              margin-bottom: 5px;
              background-color: transparent;
              padding: 0;
              color: #ffffff;
              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }

      .coaching-champions {
        margin-top: 20px;
        ul {
          display: flex;
          flex-direction: row;
          margin: 0 auto;
          margin-top: 24px;
          flex-wrap: wrap;
          max-width: 80%;
          align-items: center;
          padding: 0;
          justify-content: center;
          margin-top: -3px;
          margin-bottom: -3px;
          li {
            list-style: none;
            margin: 3px;
          }
        }
      }

      .coach-review-form {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        .coach-review-form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
          label {
            margin-bottom: 8px;
            color: #fff;
          }
          textarea {
            width: 70%;
            margin: 0 auto;
            font-size: 14px;
            background: transparent;
            padding: 16px;
            height: 200px;
            border: 1px solid #3e6082;
            color: #fff;
            letter-spacing: .3px;
            line-height: 150%;
          }
        }
      }

      table {
        width: 80%;
        align-self: center;
        table-layout: fixed;
        th,
        td {
          line-height: 120%;
          padding: 9px 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          word-break: normal;
          border-collapse: collapse;
          border-spacing: 0;
        }
      }
    }

    &.extras-list {
      padding-left: 30px;
      padding-right: 30px;
      flex-grow: 1;
      align-self: stretch;
      display: flex;
      align-items: center;
      .extra {
        outline: 0;
        &.extra--champions {
          cursor: pointer;
        }
        &.extra--agents {
          cursor: pointer;
        }
      }
      p {
        font-size: 14px;
        width: 100%;
        text-align: center;
      }
      ul {
        display: flex;
        flex-direction: row;
        margin: 0;
        padding: 0;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
        li {
          list-style: none;
          margin: 3px 5px;
        }
      }
    }

    &.description {
      padding: 0 30px;
    }

    &.controls {
      padding-left: 30px;
      padding-right: 30px;
      flex-grow: 1;
      align-self: stretch;
      display: flex;
      align-items: center;
      .control {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 10px;
        margin: 0 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        h3 {
          margin: 0;
        }
        .victory-button {
          font-size: 30px;
          color: #3e6082;
          width: 30px;
          height: 30px;
          transition: 0.3s all;
          &:hover {
            color: #85d0ff;
          }
        }
        .victory-defeat-pad-numbers {
          h3 {
            position: relative;
            top: 1px;
            margin-bottom: 9px;
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
        .victory-defeat-pad-controls {
          display: flex;
          flex-direction: column;
          margin-left: 10px;
        }
        &.account-status {
          transition: all 0.3s;
          color: rgba(255, 255, 255, 0.5);
          &.in-use {
            background-color: rgba(255, 0, 0, 0.5);
            cursor: pointer;
            &:hover {
              background-color: rgba(255, 0, 0, 0.7);
            }
          }
          &.not-in-use {
            background-color: rgba(0, 255, 0, 0.5);
            cursor: pointer;
            &:hover {
              background-color: rgba(0, 255, 0, 0.7);
            }
          }
          &:hover {
            color: rgba(255, 255, 255, 1);
          }
        }
      }
    }

    &.awards {
      margin-bottom: 50px;
    }

    &.access-data {
      display: flex;
      align-items: center;
      justify-content: center;
      table {
        table-layout: fixed;
        width: 80%;
        th,
        td {
          line-height: 120%;
          padding: 9px 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          word-break: normal;
          border-collapse: collapse;
          border-spacing: 0;
        }
      }
      .account-input {
        width: 100%;
        height: 100%;
        text-align: center;
        background: transparent;
        border: 0;
        outline: 0;
        color: #ffffff;
        font-size: 14px;
        background-color: rgba(255, 255, 255, 0.03);
        font-weight: 700;
        padding: 10px 0;
      }
    }
  }
}
</style>
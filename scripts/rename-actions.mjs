#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const RENAMES = {
  SET_IS_CHECKING_FOR_UPDATES: 'setIsCheckingForUpdates',
  SET_HAS_NEW_RELEASE: 'setHasNewRelease',
  SET_UPDATE_DOWNLOAD_STATUS: 'setUpdateDownloadStatus',
  SET_UPDATE_READY_TO_INSTALL: 'setUpdateReadyToInstall',
  SET_CURRENT_SERVICE: 'setCurrentService',
  SET_OPEN_DROPDOWN_MENU: 'setOpenDropdownMenu',
  INCREMENT_DROPDOWN_MENU_INDEX: 'incrementDropdownMenuIndex',
  SET_SERVICE_NOTIFICATION_SOUNDS: 'setServiceNotificationSounds',
  SET_SERVICE_NOTIFICATION_SOUND: 'setServiceNotificationSound',
  SET_CHAT_MESSAGE_SOUND: 'setChatMessageSound',
  SET_NOTIFICATION_SOUND: 'setNotificationSound',

  AUTHENTICATE: 'authenticate',
  UPDATE_USER_CREDIT: 'updateUserCredit',
  SET_USER: 'setUser',
  LOGOUT: 'logout',

  SET_IS_LOL_AUTHENTICATED: 'setIsLolAuthenticated',
  SET_SUMMONER_NAME: 'setSummonerName',
  SET_CONNECTION_DATA: 'setConnectionData',
  SET_IMPORTED_DATA: 'setImportedData',

  RESET_NOTIFICATIONS_MODULE: 'resetNotificationsModule',
  SET_IS_LOADING_NOTIFICATIONS: 'setIsLoadingNotifications',
  SET_LOADING_NOTIFICATIONS_TEXT: 'setLoadingNotificationsText',
  SET_NOTIFICATIONS: 'setNotifications',
  ADD_NOTIFICATION: 'addNotification',
  REMOVE_SERVICE_NOTIFICATIONS: 'removeServiceNotifications',

  RESET_SERVICES_MODULE: 'resetServicesModule',
  SET_IS_LOADING_SERVICES: 'setIsLoadingServices',
  SET_LOADING_SERVICES_TEXT: 'setLoadingServicesText',
  SET_SERVICE_ACCOUNT_STATUS: 'setServiceAccountStatus',
  SET_SERVICE_ACCOUNT: 'setServiceAccount',
  SET_SERVICE_VICTORIES_DEFEATS: 'setServiceVictoriesDefeats',
  SET_SERVICE_CURRENT_VICTORIES: 'setServiceCurrentVictories',
  SET_SERVICE_CURRENT_CLASS_COUNT: 'setServiceCurrentClassCount',
  SET_SERVICE_CLIENT_IS_ONLINE: 'setServiceClientIsOnline',
  ADD_SERVICE_CHAT_ITEM: 'addServiceChatItem',
  FINISH_SERVICE: 'finishService',
  SET_TEMP_SERVICE: 'setTempService',
  RESET_TEMP_SERVICE: 'resetTempService',
  SET_SERVICES: 'setServices',

  RESET_SERVICES_QUEUE_MODULE: 'resetServicesQueueModule',
  SET_SERVICES_QUEUE_FETCH_SERVER_TIME: 'setServicesQueueFetchServerTime',
  SET_IS_LOADING_SERVICES_QUEUE: 'setIsLoadingServicesQueue',
  SET_LOADING_SERVICES_QUEUE_TEXT: 'setLoadingServicesQueueText',
  SET_SERVICES_QUEUE: 'setServicesQueue',

  SET_LOL_PATH: 'setLolPath',
  SET_NOTIFY_NEW_SERVICE_IN_QUEUE: 'setNotifyNewServiceInQueue',
  SET_PLAY_SOUND_ON_NEW_CHAT_ITEM: 'setPlaySoundOnNewChatItem',
  SET_PLAY_SOUND_ON_NEW_NOTIFICATION: 'setPlaySoundOnNewNotification',
  SET_LEAGUE_OF_LEGENDS_NOTIFICATION: 'setLeagueOfLegendsNotification',
  SET_VALORANT_NOTIFICATION: 'setValorantNotification',
  SET_WILD_RIFT_NOTIFICATION: 'setWildRiftNotification',
  SET_TFT_NOTIFICATION: 'setTftNotification',
  SET_LOL_AUTO_QUEUE: 'setLolAutoQueue',
  SET_DEFAULT_GAME: 'setDefaultGame',
}

const ROOT = new URL('../src/', import.meta.url).pathname.replace(/^\//, '')

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) yield* walk(path)
    else if (/\.(ts|vue|js|mjs)$/.test(name)) yield path
  }
}

let touched = 0
let edits = 0
for (const file of walk(ROOT)) {
  let src = readFileSync(file, 'utf8')
  let next = src
  for (const [from, to] of Object.entries(RENAMES)) {
    const re = new RegExp(`\\b${from}\\b`, 'g')
    next = next.replace(re, to)
  }
  if (next !== src) {
    writeFileSync(file, next)
    touched++
    edits += [...src.matchAll(/[A-Z_]{4,}/g)].length - [...next.matchAll(/[A-Z_]{4,}/g)].length
    console.log(`updated ${relative(ROOT, file)}`)
  }
}
console.log(`\n${touched} files touched.`)

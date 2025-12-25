import { SYNC_CONFIG } from './config'
import { log, logError } from './logger'
import * as API from './api'
import * as Utils from './util'
import type { Bookmark } from '@/types/types'
import { supabase } from '@/service/supabase'
import { TombstoneService } from './tombstone' // Import our new service

let isSyncing = false
let isActive = false
let syncInterval: number | null = null
let syncTimeout: number | null = null
let changeCounter = 0
let lastSyncedHash: string | null = null
let currentUserId: string | null = null
let lastSyncTime: number = Date.now()

// --- Public API ---

export async function initSync(userId: string) {
  if (isActive && currentUserId === userId) return

  log('🚀 Initializing Sync Manager for user:', userId)
  isActive = true
  currentUserId = userId

  chrome.storage.onChanged.addListener(handleBrowserStorageChange)
  await performStartupSync()

  if (syncInterval) clearInterval(syncInterval)
  syncInterval = setInterval(() => {
    if (isActive) performStartupSync()
  }, SYNC_CONFIG.timeThreshold) as unknown as number
}

export function stopSync() {
  log('🛑 Stopping Sync Manager')
  isActive = false
  currentUserId = null

  if (syncInterval) clearInterval(syncInterval)
  if (syncTimeout) clearTimeout(syncTimeout)

  chrome.storage.onChanged.removeListener(handleBrowserStorageChange)
  changeCounter = 0
  lastSyncedHash = null
}

// --- Logic ---

async function handleBrowserStorageChange(changes: any, area: string) {
  if (!isActive || area !== 'local' || !changes.bookmarks) return

  const newBookmarks = changes.bookmarks.newValue
  const newHash = await Utils.hashBookmarks(newBookmarks)

  if (newHash === lastSyncedHash) return

  changeCounter++
  log(`Detected local change (${changeCounter})`)

  if (changeCounter >= SYNC_CONFIG.changeThreshold) {
    triggerUpload()
  } else {
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(
      triggerUpload,
      SYNC_CONFIG.debounceDelay
    ) as unknown as number
  }
}

async function triggerUpload() {
  if (!isActive || isSyncing || !currentUserId) return
  isSyncing = true

  try {
    const result = await chrome.storage.local.get(['bookmarks'])
    const bookmarks = result.bookmarks || []

    log('⬆️ Uploading changes to cloud...')
    const success = await API.uploadBookmarks(currentUserId, bookmarks)

    if (success) {
      lastSyncedHash = await Utils.hashBookmarks(bookmarks)
      changeCounter = 0
      lastSyncTime = Date.now()
      log('✅ Upload complete')
    }
  } catch (e) {
    logError('Upload flow failed', e)
  } finally {
    isSyncing = false
  }
}

async function performStartupSync() {
  if (!isActive || isSyncing || !currentUserId) return
  isSyncing = true

  try {
    const isOnline = await API.checkConnection()
    if (!isOnline) {
      log('📴 Offline, skipping startup sync')
      return
    }

    const localResult = await chrome.storage.local.get(['bookmarks'])
    const localBookmarks = localResult.bookmarks || []
    const remoteData = await API.fetchRemoteBookmarks(currentUserId)

    // Retrieve IDs that were deleted while there was no subscription or internet connection
    const deletedIds = await TombstoneService.getPendingDeletions()

    // 1. Handle case where there is no data on the server yet
    if (!remoteData) {
      if (localBookmarks.length > 0) {
        log('🆕 First sync: Uploading local bookmarks')
        await API.uploadBookmarks(currentUserId, localBookmarks)
        lastSyncedHash = await Utils.hashBookmarks(localBookmarks)
      }
      if (deletedIds.length > 0) await TombstoneService.clearDeletions()
      return
    }

    let { bookmarks: serverBookmarks } = remoteData

    // 2. [TOMBSTONE LOGIC] Apply deletions to server data
    if (deletedIds.length > 0) {
      log(`🗑️ Processing ${deletedIds.length} offline deletions...`)
      const cleanedServer = TombstoneService.filterTree(
        serverBookmarks,
        deletedIds
      )

      // If data changed after cleaning, update the server immediately
      if (JSON.stringify(cleanedServer) !== JSON.stringify(serverBookmarks)) {
        await API.uploadBookmarks(currentUserId, cleanedServer)
        serverBookmarks = cleanedServer
        log('✅ Server cleaned from tombstones')
      }
      await TombstoneService.clearDeletions()
    }

    const localHash = await Utils.hashBookmarks(localBookmarks)
    const serverHash = await Utils.hashBookmarks(serverBookmarks)

    if (localHash === serverHash) {
      lastSyncedHash = serverHash
      lastSyncTime = Date.now()
      log('✅ Sync state: Up to date')
      return
    }

    // 3. New device scenario (Local is empty)
    if (localBookmarks.length === 0 && serverBookmarks.length > 0) {
      log('⬇️ Downloading from cloud (New device)')
      await saveToLocal(serverBookmarks)
      lastSyncTime = Date.now()
      return
    }

    // 4. Data Merge
    log('🔄 Data mismatch. Merging...')
    const merged = Utils.mergeBookmarks(localBookmarks, serverBookmarks)
    const mergedHash = await Utils.hashBookmarks(merged)

    if (mergedHash !== localHash) {
      await saveToLocal(merged)
    }

    if (mergedHash !== serverHash) {
      log('⬆️ Uploading merged result')
      await API.uploadBookmarks(currentUserId, merged)
    }

    lastSyncedHash = mergedHash
    lastSyncTime = Date.now()
  } catch (e) {
    logError('Startup sync failed', e)
  } finally {
    isSyncing = false
  }
}

async function saveToLocal(bookmarks: Bookmark[]) {
  lastSyncedHash = await Utils.hashBookmarks(bookmarks)
  await chrome.storage.local.set({ bookmarks })
  log('💾 Saved to local storage')
}

export function getSyncStatus() {
  return {
    isSyncing,
    isOnline: navigator.onLine,
    changeCounter,
    lastSyncTime: new Date(lastSyncTime),
    hasPendingChanges: changeCounter > 0,
    hasOfflineQueue: false,
  }
}

export async function forceSyncBookmarks(): Promise<boolean> {
  if (!isActive || isSyncing) return false
  await performStartupSync()
  return true
}

export async function resolveConflict(choice: 'local' | 'server' | 'merge') {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return

  const userId = userData.user.id
  const result = await chrome.storage.local.get(['bookmarkConflict'])
  if (!result.bookmarkConflict) return

  const { local, server } = result.bookmarkConflict
  let resolved: Bookmark[]

  if (choice === 'local') resolved = local
  else if (choice === 'server') resolved = server
  else resolved = Utils.mergeBookmarks(local, server)

  await saveToLocal(resolved)
  await API.uploadBookmarks(userId, resolved)
  await chrome.storage.local.remove(['bookmarkConflict'])

  log(`✅ Conflict resolved using: ${choice}`)
}

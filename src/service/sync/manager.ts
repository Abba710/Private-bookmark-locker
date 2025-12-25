import { SYNC_CONFIG } from './config'
import { log, logError } from './logger'
import * as API from './api'
import * as Utils from './util'
import type { Bookmark } from '@/types/types'
import { supabase } from '@/service/supabase'
import { TombstoneService } from './tombstone'

// --- State Management ---

let isSyncing = false
let isActive = false
let syncInterval: number | null = null
let syncTimeout: number | null = null
let changeCounter = 0
let lastSyncedHash: string | null = null
let currentUserId: string | null = null
let lastSyncTime: number = Date.now()

/**
 * Semaphore to prevent "Sync Loops".
 * Ensures that programmatic updates to local storage don't trigger new uploads.
 */
let isInternalWrite = false

// --- Public API ---

/**
 * Initializes the sync manager for the given user.
 */
export async function initSync(userId: string) {
  if (isActive && currentUserId === userId) return

  log('🚀 Initializing Sync Manager for user:', userId)
  isActive = true
  currentUserId = userId

  chrome.storage.onChanged.addListener(handleBrowserStorageChange)

  // Initial sync to align states
  await performStartupSync()

  if (syncInterval) clearInterval(syncInterval)

  // Periodically check for remote updates if idle
  syncInterval = setInterval(() => {
    if (isActive && !isSyncing && changeCounter === 0) {
      log('🕒 Heartbeat: Checking for remote changes...')
      performStartupSync()
    }
  }, SYNC_CONFIG.timeThreshold) as unknown as number
}

/**
 * Stops the sync manager and resets locks.
 */
export function stopSync() {
  log('🛑 Stopping Sync Manager')
  isActive = false
  currentUserId = null
  isSyncing = false

  if (syncInterval) clearInterval(syncInterval)
  if (syncTimeout) clearTimeout(syncTimeout)

  chrome.storage.onChanged.removeListener(handleBrowserStorageChange)
  changeCounter = 0
  lastSyncedHash = null
  isInternalWrite = false
}

// --- Internal Logic ---

/**
 * Storage listener that detects user changes.
 */
async function handleBrowserStorageChange(changes: any, area: string) {
  if (!isActive || area !== 'local' || !changes.bookmarks) return

  // GUARD: Ignore changes made by the sync process itself
  if (isInternalWrite) {
    log('🔒 Internal write detected, skipping upload trigger')
    return
  }

  const newBookmarks = changes.bookmarks.newValue
  const newHash = await Utils.hashBookmarks(newBookmarks)

  // GUARD: Only react if the data is actually different from the cloud version
  if (newHash === lastSyncedHash) return

  changeCounter++
  log(`Detected local change #${changeCounter}`)

  // Debounce logic: wait for the user to finish editing
  if (syncTimeout) clearTimeout(syncTimeout)

  if (changeCounter >= SYNC_CONFIG.changeThreshold) {
    triggerUpload()
  } else {
    syncTimeout = setTimeout(
      triggerUpload,
      SYNC_CONFIG.debounceDelay
    ) as unknown as number
  }
}

/**
 * Uploads current local data to the cloud.
 */
async function triggerUpload() {
  if (!isActive || isSyncing || !currentUserId) return
  isSyncing = true

  try {
    const result = await chrome.storage.local.get(['bookmarks'])
    const bookmarks = result.bookmarks || []

    // Safety check: ensure we aren't re-uploading identical state
    const currentHash = await Utils.hashBookmarks(bookmarks)
    if (currentHash === lastSyncedHash) {
      log('☁️ State identical to cloud. Skipping upload.')
      changeCounter = 0
      return
    }

    log('⬆️ Uploading current state to cloud...')
    const success = await API.uploadBookmarks(currentUserId, bookmarks)

    if (success) {
      lastSyncedHash = currentHash
      changeCounter = 0
      lastSyncTime = Date.now()
      log('✅ Upload complete')
    }
  } catch (e) {
    logError('Upload failed', e)
  } finally {
    isSyncing = false
  }
}

/**
 * Core Sync Cycle: handles the "Zombie Resurrection" fix by
 * prioritizing local deletions (Tombstones) over remote data.
 */
async function performStartupSync() {
  if (!isActive || !currentUserId) return

  // Lock the process
  isSyncing = true

  try {
    const isOnline = await API.checkConnection()
    if (!isOnline) {
      log('📴 Offline: Skipping sync cycle')
      return
    }

    // 1. Gather local, remote, and deletion data
    const localResult = await chrome.storage.local.get(['bookmarks'])
    const localBookmarks = localResult.bookmarks || []
    const remoteData = await API.fetchRemoteBookmarks(currentUserId)
    const deletedIds = await TombstoneService.getPendingDeletions()

    // 2. Handle first-time sync (empty server)
    if (!remoteData) {
      if (localBookmarks.length > 0) {
        log('🆕 Initializing server with local data')
        await API.uploadBookmarks(currentUserId, localBookmarks)
        lastSyncedHash = await Utils.hashBookmarks(localBookmarks)
      }
      if (deletedIds.length > 0) await TombstoneService.clearDeletions()
      return
    }

    let { bookmarks: serverBookmarks } = remoteData

    /**
     * 3. CRITICAL: ZOMBIE PREVENTION
     * Apply local deletions (Tombstones) to server data BEFORE merging.
     * If we don't do this, the Merge function will see an item on the server
     * that is missing locally and "restore" it.
     */
    if (deletedIds.length > 0) {
      log(
        `🗑️ Applying ${deletedIds.length} offline deletions to server data...`
      )

      // Filter the server tree using local "Death records" (Tombstones)
      const cleanedServer = TombstoneService.filterTree(
        serverBookmarks,
        deletedIds
      )

      // If the server data was modified by our tombstones, update the server immediately
      if (JSON.stringify(cleanedServer) !== JSON.stringify(serverBookmarks)) {
        log(
          '⚡ Propagating deletions to cloud immediately to prevent resurrection'
        )
        await API.uploadBookmarks(currentUserId, cleanedServer)
        // Update our local reference of what the server has
        serverBookmarks = cleanedServer
      }

      // Clear the tombstone queue as they are now reflected on the server
      await TombstoneService.clearDeletions()
    }

    // 4. Compare normalized hashes
    const localHash = await Utils.hashBookmarks(localBookmarks)
    const serverHash = await Utils.hashBookmarks(serverBookmarks)

    if (localHash === serverHash) {
      lastSyncedHash = serverHash
      lastSyncTime = Date.now()
      log('✅ State aligned: Sync complete')
      return
    }

    // 5. New Device Check
    // If local is empty but server has items, download them.
    if (localBookmarks.length === 0 && serverBookmarks.length > 0) {
      log('⬇️ Downloading cloud data to local storage')
      await saveToLocal(serverBookmarks)
      lastSyncTime = Date.now()
      return
    }

    // 6. Data Merge (Conflict Resolution)
    log('🔄 Data mismatch: Executing merge...')
    const merged = Utils.mergeBookmarks(localBookmarks, serverBookmarks)
    const mergedHash = await Utils.hashBookmarks(merged)

    // Update local if merge resulted in a change
    if (mergedHash !== localHash) {
      await saveToLocal(merged)
    }

    // Update server if merge resulted in a change
    if (mergedHash !== serverHash) {
      log('⬆️ Uploading merged result to cloud')
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

/**
 * Saves bookmarks locally without triggering the onChanged upload logic.
 */
async function saveToLocal(bookmarks: Bookmark[]) {
  isInternalWrite = true
  try {
    // Update hash before writing to storage to avoid race conditions
    lastSyncedHash = await Utils.hashBookmarks(bookmarks)
    await chrome.storage.local.set({ bookmarks })
    log('💾 Saved to local storage (Internal update)')
  } finally {
    // Keep lock for a short duration to ensure onChanged is ignored
    setTimeout(() => {
      isInternalWrite = false
    }, 500)
  }
}

/**
 * Triggers a manual sync immediately, ignoring debounce timers and resetting locks.
 */
export async function forceSyncBookmarks(): Promise<boolean> {
  if (!isActive) return false

  log('🔥 FORCE SYNC: Manually triggered')

  // Clear any pending debounce timers
  if (syncTimeout) {
    clearTimeout(syncTimeout)
    syncTimeout = null
  }
  changeCounter = 0

  // Break existing sync locks if user is forcing a refresh
  if (isSyncing) {
    log('⚠️ Resetting sync lock for manual override')
    isSyncing = false
  }

  await performStartupSync()
  return true
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

/**
 * Resolves conflict manually based on user choice.
 */
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

  log(`✅ Conflict resolved via: ${choice}`)
}

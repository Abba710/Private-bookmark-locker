import type { Bookmark } from '@/types/types'
import { supabase } from '@/service/supabase'

// Configuration
const SYNC_CONFIG = {
  changeThreshold: 10,
  timeThreshold: 30000,
  debounceDelay: 3000,
  maxRetries: 3,
  retryDelay: 2000,
  enableLogging: true,
  offlineCheckInterval: 5000, // Check connection every 5 seconds when offline
}

// State management
let changeCounter = 0
let lastSyncTime = Date.now()
let isSyncing = false
let syncQueue: Bookmark[] | null = null
let syncTimeout: number | null = null
let lastSyncedHash: string | null = null
let isOnline = navigator.onLine
let offlineQueue: Bookmark[] | null = null
let reconnectCheckInterval: number | null = null

// Simple hash function
function hashBookmarks(bookmarks: Bookmark[]): string {
  const str = JSON.stringify(bookmarks)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

function log(message: string, ...args: any[]) {
  if (SYNC_CONFIG.enableLogging) {
    console.log(`[BookmarkSync] ${message}`, ...args)
  }
}

// Initialize synchronization system
export function initBookmarkSync() {
  log('Initializing bookmark sync system...')

  // Listen to chrome.storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.bookmarks) {
      handleBookmarkChange(changes.bookmarks.newValue)
    }
  })

  // Setup online/offline handlers
  setupOnlineOfflineHandlers()

  // Setup save handlers for browser/extension close
  setupBeforeUnloadSync()

  // Load bookmarks on startup
  loadBookmarksOnStart()

  // Periodic sync check (every minute)
  setInterval(() => {
    if (!isOnline) return // Skip if offline

    const timeSinceLastSync = Date.now() - lastSyncTime
    if (timeSinceLastSync > SYNC_CONFIG.timeThreshold && changeCounter > 0) {
      log('Periodic sync triggered')
      chrome.storage.local.get(['bookmarks'], (result) => {
        if (result.bookmarks) {
          syncWithQueue(result.bookmarks)
        }
      })
    }
  }, SYNC_CONFIG.timeThreshold)

  log('✅ Bookmark sync initialized')
}

// Setup online/offline event handlers
function setupOnlineOfflineHandlers() {
  if (typeof window === 'undefined') return

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Initial check
  isOnline = navigator.onLine
  log(`Initial connection status: ${isOnline ? 'online' : 'offline'}`)
}

function handleOnline() {
  log('🟢 Connection restored')
  isOnline = true

  // Stop reconnect checking
  if (reconnectCheckInterval) {
    clearInterval(reconnectCheckInterval)
    reconnectCheckInterval = null
  }

  // Emit online event
  emitSyncEvent('online')

  // Sync offline queue immediately
  syncOfflineQueue()
}

function handleOffline() {
  log('🔴 Connection lost')
  isOnline = false

  // Emit offline event
  emitSyncEvent('offline')

  // Start checking for connection restoration
  startReconnectChecking()
}

function startReconnectChecking() {
  if (reconnectCheckInterval) return

  log('Starting reconnect checking...')

  reconnectCheckInterval = setInterval(async () => {
    // Try to ping Supabase
    const online = await checkConnection()
    if (online && !isOnline) {
      log('Connection detected via ping')
      handleOnline()
    }
  }, SYNC_CONFIG.offlineCheckInterval) as unknown as number
}

async function checkConnection(): Promise<boolean> {
  try {
    // Try a lightweight query to Supabase
    const { error } = await supabase
      .from('user_bookmarks')
      .select('user_id')
      .limit(1)

    return !error
  } catch {
    return false
  }
}

function handleBookmarkChange(newBookmarks: Bookmark[]) {
  if (!newBookmarks) return

  // Check if data actually changed
  const newHash = hashBookmarks(newBookmarks)
  if (newHash === lastSyncedHash) {
    return
  }

  changeCounter++
  log(`Change detected (${changeCounter}/${SYNC_CONFIG.changeThreshold})`)

  // If offline, store in offline queue
  if (!isOnline) {
    log('📴 Offline - queueing changes')
    offlineQueue = newBookmarks
    saveOfflineQueue(newBookmarks)
    return
  }

  // Check if we should sync now
  const timeSinceLastSync = Date.now() - lastSyncTime
  const shouldSyncByCount = changeCounter >= SYNC_CONFIG.changeThreshold
  const shouldSyncByTime = timeSinceLastSync > SYNC_CONFIG.timeThreshold

  if (shouldSyncByCount || shouldSyncByTime) {
    log('Sync threshold reached, syncing now...')
    syncWithQueue(newBookmarks)
    changeCounter = 0
  } else {
    scheduleDebouncedSync(newBookmarks)
  }
}

function scheduleDebouncedSync(bookmarks: Bookmark[]) {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  syncTimeout = setTimeout(() => {
    if (!isOnline) {
      log('📴 Offline - cannot sync')
      return
    }

    log('Debounced sync triggered')
    syncWithQueue(bookmarks)
    changeCounter = 0
  }, SYNC_CONFIG.debounceDelay) as unknown as number
}

async function syncWithQueue(bookmarks: Bookmark[]) {
  // If offline, queue for later
  if (!isOnline) {
    log('📴 Offline - queueing sync')
    offlineQueue = bookmarks
    saveOfflineQueue(bookmarks)
    return
  }

  // If already syncing, queue this sync for later
  if (isSyncing) {
    log('Sync in progress, queueing...')
    syncQueue = bookmarks
    return
  }

  isSyncing = true

  try {
    await syncWithRetry(bookmarks, SYNC_CONFIG.maxRetries)
    lastSyncTime = Date.now()
    changeCounter = 0

    // Process queued sync if any
    if (syncQueue) {
      log('Processing queued sync...')
      const queued = syncQueue
      syncQueue = null
      isSyncing = false
      await syncWithQueue(queued)
      return
    }
  } catch (err) {
    log('❌ All retry attempts failed:', err)

    // Check if it's a network error
    if (isNetworkError(err)) {
      log('Network error detected, marking as offline')
      isOnline = false
      offlineQueue = bookmarks
      saveOfflineQueue(bookmarks)
      handleOffline()
    } else {
      // Store failed sync for later retry
      await storeFailedSync(bookmarks)
    }
  } finally {
    isSyncing = false
  }
}

async function syncWithRetry(
  bookmarks: Bookmark[],
  retriesLeft: number
): Promise<void> {
  try {
    await syncBookmarksNow(bookmarks)
  } catch (err) {
    // Check if it's a network error
    if (isNetworkError(err)) {
      log('Network error, stopping retries')
      throw err
    }

    if (retriesLeft > 0) {
      log(`Sync failed, retrying... (${retriesLeft} attempts left)`)
      await new Promise((resolve) =>
        setTimeout(resolve, SYNC_CONFIG.retryDelay)
      )
      await syncWithRetry(bookmarks, retriesLeft - 1)
    } else {
      throw err
    }
  }
}

function isNetworkError(error: any): boolean {
  if (!error) return false

  const message = error.message?.toLowerCase() || ''
  const code = error.code?.toLowerCase() || ''

  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('offline') ||
    message.includes('connection') ||
    code === 'network_error' ||
    code === 'fetch_error'
  )
}

async function syncBookmarksNow(bookmarks: Bookmark[]) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    log('User not authenticated, skipping sync')
    throw new Error('User not authenticated')
  }

  log('⬆️ Syncing bookmarks to Supabase...', {
    count: countBookmarks(bookmarks),
  })

  const now = new Date().toISOString()

  const { error } = await supabase.from('user_bookmarks').upsert(
    {
      user_id: userData.user.id,
      bookmarks,
      updated_at: now,
    },
    {
      onConflict: 'user_id',
    }
  )

  if (error) {
    log('❌ Sync error:', error)
    throw error
  }

  // Update hash after successful sync
  lastSyncedHash = hashBookmarks(bookmarks)

  // Store timestamp locally
  await chrome.storage.local.set({ lastSyncTimestamp: Date.now() })

  // Clear offline queue if exists
  await chrome.storage.local.remove(['offlineQueue'])
  offlineQueue = null

  log('✅ Bookmarks synced successfully')
}

async function syncOfflineQueue() {
  // Load offline queue from storage
  const result = await chrome.storage.local.get(['offlineQueue', 'bookmarks'])
  const queuedBookmarks = result.offlineQueue || result.bookmarks

  if (!queuedBookmarks) {
    log('No offline queue to sync')
    return
  }

  log('🔄 Syncing offline queue...', {
    count: countBookmarks(queuedBookmarks),
  })

  try {
    await syncWithQueue(queuedBookmarks)

    // Also retry any previously failed syncs
    await retryFailedSyncs()

    emitSyncEvent('queue_synced')
  } catch (err) {
    log('❌ Failed to sync offline queue:', err)
  }
}

async function saveOfflineQueue(bookmarks: Bookmark[]) {
  await chrome.storage.local.set({
    offlineQueue: bookmarks,
    offlineQueueTimestamp: Date.now(),
  })
  log('💾 Offline queue saved')
}

async function loadBookmarksOnStart() {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      log('User not authenticated')
      return
    }

    // Check if we're actually online
    const actuallyOnline = await checkConnection()
    if (!actuallyOnline) {
      log('📴 No connection to Supabase on startup')
      isOnline = false
      handleOffline()
      return
    }

    // Get local bookmarks
    const localData = await chrome.storage.local.get([
      'bookmarks',
      'lastSyncTimestamp',
      'offlineQueue',
    ])
    const localBookmarks = (localData.bookmarks as Bookmark[]) || []
    const localTimestamp = localData.lastSyncTimestamp || 0
    const hasOfflineQueue = !!localData.offlineQueue

    // If there's an offline queue, sync it first
    if (hasOfflineQueue) {
      log('Found offline queue on startup')
      await syncOfflineQueue()
      return
    }

    // Get bookmarks from server
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('bookmarks, updated_at')
      .eq('user_id', userData.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        log('📤 First sync: uploading local bookmarks')
        if (localBookmarks.length > 0) {
          await syncBookmarksNow(localBookmarks)
        } else {
          await supabase.from('user_bookmarks').insert({
            user_id: userData.user.id,
            bookmarks: [],
            updated_at: new Date().toISOString(),
          })
        }
      }
      return
    }

    const serverTimestamp = new Date(data.updated_at).getTime()
    const serverBookmarks = data.bookmarks as Bookmark[]

    log('Comparing timestamps:', {
      local: new Date(localTimestamp).toISOString(),
      server: new Date(serverTimestamp).toISOString(),
    })

    // Conflict resolution
    if (serverTimestamp > localTimestamp) {
      const serverCount = countBookmarks(serverBookmarks)
      const localCount = countBookmarks(localBookmarks)

      if (
        localCount > 0 &&
        serverCount > 0 &&
        Math.abs(serverCount - localCount) > 10
      ) {
        log('⚠️ Significant difference detected')
        await handleConflict(
          localBookmarks,
          serverBookmarks,
          localCount,
          serverCount
        )
      } else {
        log('⬇️ Server data is newer', { serverCount, localCount })
        await chrome.storage.local.set({
          bookmarks: serverBookmarks,
          lastSyncTimestamp: serverTimestamp,
        })
        lastSyncedHash = hashBookmarks(serverBookmarks)
      }
    } else if (localBookmarks.length > 0) {
      log('⬆️ Local data is newer')
      await syncBookmarksNow(localBookmarks)
    }

    await retryFailedSyncs()
  } catch (err) {
    log('❌ Load error:', err)

    // If network error, mark as offline
    if (isNetworkError(err)) {
      isOnline = false
      handleOffline()
    }
  }
}

async function handleConflict(
  localBookmarks: Bookmark[],
  serverBookmarks: Bookmark[],
  localCount: number,
  serverCount: number
) {
  await chrome.storage.local.set({
    bookmarkConflict: {
      local: localBookmarks,
      server: serverBookmarks,
      localCount,
      serverCount,
      timestamp: Date.now(),
    },
  })

  log('Conflict stored, user needs to resolve manually')

  chrome.runtime.sendMessage({
    action: 'bookmark_conflict',
    data: { localCount, serverCount },
  })
}

export async function resolveConflict(choice: 'local' | 'server' | 'merge') {
  const result = await chrome.storage.local.get(['bookmarkConflict'])
  if (!result.bookmarkConflict) return

  const { local, server } = result.bookmarkConflict

  let resolvedBookmarks: Bookmark[]

  switch (choice) {
    case 'local':
      resolvedBookmarks = local
      break
    case 'server':
      resolvedBookmarks = server
      break
    case 'merge':
      resolvedBookmarks = mergeBookmarks(local, server)
      break
    default:
      return
  }

  await chrome.storage.local.set({
    bookmarks: resolvedBookmarks,
    lastSyncTimestamp: Date.now(),
  })
  await chrome.storage.local.remove(['bookmarkConflict'])
  await syncBookmarksNow(resolvedBookmarks)

  log('✅ Conflict resolved:', choice)
}

function mergeBookmarks(local: Bookmark[], server: Bookmark[]): Bookmark[] {
  const urlMap = new Map<string, Bookmark>()
  const folderMap = new Map<string, Bookmark>()

  for (const bookmark of server) {
    if (bookmark.isFolder) {
      folderMap.set(bookmark.id, bookmark)
    } else if (bookmark.url) {
      urlMap.set(bookmark.url, bookmark)
    }
  }

  for (const bookmark of local) {
    if (bookmark.isFolder) {
      const existing = folderMap.get(bookmark.id)
      if (existing) {
        const mergedChildren = mergeBookmarks(
          bookmark.children || [],
          existing.children || []
        )
        folderMap.set(bookmark.id, { ...bookmark, children: mergedChildren })
      } else {
        folderMap.set(bookmark.id, bookmark)
      }
    } else if (bookmark.url) {
      urlMap.set(bookmark.url, bookmark)
    }
  }

  return [...Array.from(folderMap.values()), ...Array.from(urlMap.values())]
}

function countBookmarks(bookmarks: Bookmark[]): number {
  let count = 0
  for (const bookmark of bookmarks) {
    count++
    if (bookmark.children) {
      count += countBookmarks(bookmark.children)
    }
  }
  return count
}

async function storeFailedSync(bookmarks: Bookmark[]) {
  const result = await chrome.storage.local.get(['failedSyncs'])
  const failedSyncs = result.failedSyncs || []

  failedSyncs.push({
    bookmarks,
    timestamp: Date.now(),
  })

  if (failedSyncs.length > 5) {
    failedSyncs.shift()
  }

  await chrome.storage.local.set({ failedSyncs })
  log('Failed sync stored for later retry')
}

async function retryFailedSyncs() {
  if (!isOnline) {
    log('Offline - skipping failed sync retry')
    return
  }

  const result = await chrome.storage.local.get(['failedSyncs'])
  const failedSyncs = result.failedSyncs || []

  if (failedSyncs.length === 0) return

  log(`Retrying ${failedSyncs.length} failed syncs...`)

  for (const failed of failedSyncs) {
    try {
      await syncBookmarksNow(failed.bookmarks)
    } catch (err) {
      log('Failed to retry sync:', err)
    }
  }

  await chrome.storage.local.set({ failedSyncs: [] })
}

function setupBeforeUnloadSync() {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Only try to sync if online
      if (!isOnline) {
        log('📴 Offline - skipping beforeunload sync')
        return
      }

      chrome.storage.local.get(['bookmarks'], async (result) => {
        if (!result.bookmarks) return

        try {
          const { data: userData } = await supabase.auth.getUser()
          if (!userData.user) return

          const payload = JSON.stringify({
            user_id: userData.user.id,
            bookmarks: result.bookmarks,
            updated_at: new Date().toISOString(),
          })

          const url = `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/user_bookmarks?user_id=eq.${userData.user.id}`

          const sent = navigator.sendBeacon(
            url,
            new Blob([payload], { type: 'application/json' })
          )

          if (sent) {
            log('📤 Bookmarks sent via beacon on unload')
          }
        } catch (err) {
          log('❌ Beacon error:', err)
        }
      })
    })
  }

  if (chrome.runtime?.onSuspend) {
    chrome.runtime.onSuspend.addListener(async () => {
      if (!isOnline) {
        log('📴 Offline - skipping suspend sync')
        return
      }

      log('Extension suspending, forcing final sync...')
      const result = await chrome.storage.local.get(['bookmarks'])
      if (result.bookmarks) {
        try {
          await syncBookmarksNow(result.bookmarks)
        } catch (err) {
          log('❌ Final sync failed:', err)
        }
      }
    })
  }
}

// Event emitter for UI updates
function emitSyncEvent(
  event: 'online' | 'offline' | 'syncing' | 'synced' | 'error' | 'queue_synced'
) {
  try {
    chrome.runtime.sendMessage({
      action: 'sync_status',
      event,
      status: getSyncStatus(),
    })
  } catch (err) {
    // Ignore if no listeners
  }
}

export async function forceSyncBookmarks(): Promise<boolean> {
  if (!isOnline) {
    log('📴 Cannot force sync - offline')
    return false
  }

  try {
    const result = await chrome.storage.local.get(['bookmarks'])
    if (result.bookmarks) {
      await syncWithQueue(result.bookmarks)
      changeCounter = 0
      return true
    }
    return false
  } catch (err) {
    log('❌ Force sync failed:', err)
    return false
  }
}

export function getSyncStatus() {
  return {
    isSyncing,
    isOnline,
    changeCounter,
    lastSyncTime: new Date(lastSyncTime),
    hasPendingChanges: changeCounter > 0,
    queuedSync: syncQueue !== null,
    hasOfflineQueue: offlineQueue !== null,
  }
}

export function resetSyncState() {
  changeCounter = 0
  lastSyncTime = Date.now()
  isSyncing = false
  syncQueue = null
  lastSyncedHash = null
  offlineQueue = null

  if (syncTimeout) {
    clearTimeout(syncTimeout)
    syncTimeout = null
  }

  if (reconnectCheckInterval) {
    clearInterval(reconnectCheckInterval)
    reconnectCheckInterval = null
  }

  log('Sync state reset')
}

// Cleanup on shutdown
export function cleanupSync() {
  if (reconnectCheckInterval) {
    clearInterval(reconnectCheckInterval)
  }

  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

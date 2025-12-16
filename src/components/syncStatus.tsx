import { useState, useEffect } from 'preact/hooks'
import {
  getSyncStatus,
  forceSyncBookmarks,
  resolveConflict,
} from '@/service/supabaseSync'

export function SyncStatus() {
  const [status, setStatus] = useState(getSyncStatus())
  const [syncing, setSyncing] = useState(false)
  const [conflict, setConflict] = useState<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSyncStatus())
    }, 1000)

    chrome.storage.local.get(['bookmarkConflict'], (result) => {
      setConflict(result.bookmarkConflict)
    })

    // Listen for sync events
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'bookmark_conflict') {
        chrome.storage.local.get(['bookmarkConflict'], (result) => {
          setConflict(result.bookmarkConflict)
        })
      }

      if (message.action === 'sync_status') {
        setStatus(message.status)
      }
    })

    return () => clearInterval(interval)
  }, [])

  const handleForceSync = async () => {
    setSyncing(true)
    const success = await forceSyncBookmarks()
    setSyncing(false)

    if (!success) {
      alert('Cannot sync while offline')
    }
  }

  const handleResolve = async (choice: 'local' | 'server' | 'merge') => {
    await resolveConflict(choice)
    setConflict(null)
  }

  if (conflict) {
    return (
      <div class="sync-conflict">
        <h3>⚠️ Bookmark Conflict Detected</h3>
        <p>Local: {conflict.localCount} bookmarks</p>
        <p>Server: {conflict.serverCount} bookmarks</p>
        <div class="conflict-actions">
          <button onClick={() => handleResolve('local')}>Keep Local</button>
          <button onClick={() => handleResolve('server')}>Keep Server</button>
          <button onClick={() => handleResolve('merge')}>Merge Both</button>
        </div>
      </div>
    )
  }

  return (
    <div class="sync-status">
      <div class="status-indicator">
        {!status.isOnline ? (
          <span class="offline">📴 Offline - changes saved locally</span>
        ) : status.isSyncing ? (
          <span class="syncing">🔄 Syncing...</span>
        ) : status.hasOfflineQueue ? (
          <span class="warning">⚠️ Syncing offline changes...</span>
        ) : status.hasPendingChanges ? (
          <span class="pending">📝 {status.changeCounter} unsaved changes</span>
        ) : (
          <span class="synced">✅ All synced</span>
        )}
      </div>

      <div class="last-sync">
        Last sync: {status.lastSyncTime.toLocaleTimeString()}
      </div>

      <button onClick={handleForceSync} disabled={syncing || !status.isOnline}>
        {syncing ? '⏳ Syncing...' : '🔄 Force Sync'}
      </button>
    </div>
  )
}

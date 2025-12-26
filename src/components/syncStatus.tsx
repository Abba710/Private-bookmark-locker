import { useState, useEffect } from 'preact/hooks'
import {
  Cloud,
  RefreshCw,
  Check,
  AlertTriangle,
  Loader2,
  WifiOff,
  History,
} from 'lucide-react'
import { Badge } from './ui/badge'
import {
  getSyncStatus,
  forceSyncBookmarks,
  resolveConflict,
} from '@/service/sync/manager'

/**
 * SyncStatus Component
 * Manages UI for cloud synchronization status, pending changes, and database conflicts.
 */
export function SyncStatus() {
  const [status, setStatus] = useState(getSyncStatus())
  const [syncing, setSyncing] = useState(false)
  const [conflict, setConflict] = useState<any>(null)

  useEffect(() => {
    // Refresh status every second for the timer/counter
    const interval = setInterval(() => {
      setStatus(getSyncStatus())
    }, 1000)

    // Check for existing conflicts on mount
    chrome.storage.local.get(['bookmarkConflict'], (result) => {
      if (result.bookmarkConflict) setConflict(result.bookmarkConflict)
    })

    // Listen for messages from background or manager
    const messageListener = (message: any) => {
      if (message.action === 'bookmark_conflict') {
        setConflict(message.data)
      }
      if (message.action === 'sync_status') {
        setStatus(message.status)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      clearInterval(interval)
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  // Manually trigger sync process
  const handleForceSync = async () => {
    setSyncing(true)
    try {
      const success = await forceSyncBookmarks()
      if (!success) console.warn('Sync skipped: manager inactive or busy')
    } finally {
      setSyncing(false)
      setStatus(getSyncStatus())
    }
  }

  // Resolve DB conflicts manually
  const handleResolve = async (choice: 'local' | 'server' | 'merge') => {
    setSyncing(true)
    await resolveConflict(choice)
    setConflict(null)
    setSyncing(false)
    setStatus(getSyncStatus())
  }

  // --- UI Helpers ---
  const getStatusBadge = () => {
    const baseClass =
      'flex items-center gap-1.5 px-2.5 py-1 border transition-all duration-300 shadow-sm'

    if (!status.isOnline) {
      return (
        <Badge
          variant="outline"
          className={`${baseClass} bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5`}
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-tight">
            {chrome.i18n.getMessage('app_sync_offline')}
          </span>
        </Badge>
      )
    }
    if (status.isSyncing || syncing) {
      return (
        <Badge
          variant="outline"
          className={`${baseClass} bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-[11px] font-semibold uppercase tracking-tight">
            {chrome.i18n.getMessage('app_sync_syncing')}
          </span>
        </Badge>
      )
    }
    if (status.hasPendingChanges) {
      return (
        <Badge
          variant="outline"
          className={`${baseClass} bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-tight">
            {status.changeCounter} {chrome.i18n.getMessage('app_sync_pending')}
          </span>
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className={`${baseClass} bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5`}
      >
        <Check className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-tight">
          {chrome.i18n.getMessage('app_sync_up_to_date')}
        </span>
      </Badge>
    )
  }

  if (conflict) {
    return (
      <div className="relative flex flex-col w-full gap-4 p-4 bg-[#1a1612] rounded-2xl border border-amber-500/20 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold tracking-tight">
              {chrome.i18n.getMessage('app_sync_conflict_title')}
            </h3>
            <p className="text-[11px] text-amber-200/50">
              {chrome.i18n.getMessage('app_sync_conflict_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleResolve('local')}
            className="flex flex-col items-center gap-1 px-2 py-2.5 bg-white/[0.03] hover:bg-white/10 text-[10px] text-gray-400 hover:text-white rounded-xl border border-white/5 transition-all"
          >
            <span className="font-bold text-white uppercase">
              {conflict.localCount}
            </span>
            {chrome.i18n.getMessage('app_sync_local')}
          </button>
          <button
            onClick={() => handleResolve('server')}
            className="flex flex-col items-center gap-1 px-2 py-2.5 bg-white/[0.03] hover:bg-white/10 text-[10px] text-gray-400 hover:text-white rounded-xl border border-white/5 transition-all"
          >
            <span className="font-bold text-white uppercase">
              {conflict.serverCount}
            </span>
            {chrome.i18n.getMessage('app_sync_cloud')}
          </button>
          <button
            onClick={() => handleResolve('merge')}
            className="flex flex-col items-center justify-center gap-1 px-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-wider"
          >
            {chrome.i18n.getMessage('app_sync_merge')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative flex items-center w-full h-[44px] px-3 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md transition-all hover:bg-white/[0.05]">
      <div className="flex w-full items-center gap-3">
        {getStatusBadge()}

        {/* Last Sync Info */}
        <div className="flex items-center gap-2 text-gray-500">
          <History className="w-3 h-3 opacity-50" />
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-medium">
            <span className="opacity-50">
              {chrome.i18n.getMessage('app_sync_last')}
            </span>
            <span className="text-gray-300 font-mono tracking-normal">
              {status.lastSyncTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Sync Action */}
        <button
          onClick={handleForceSync}
          disabled={syncing || !status.isOnline}
          className="ml-auto p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
          title={chrome.i18n.getMessage('app_sync_force_title')}
        >
          <RefreshCw
            className={`w-4 h-4 ${
              syncing ? 'animate-spin text-indigo-400' : ''
            }`}
          />
        </button>
      </div>
    </div>
  )
}

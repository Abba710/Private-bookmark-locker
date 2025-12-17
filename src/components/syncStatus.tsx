import { useState, useEffect } from 'preact/hooks'
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertTriangle,
  Loader2,
  WifiOff,
} from 'lucide-react'
import { Badge } from './ui/badge'
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

  const getStatusIcon = () => {
    if (!status.isOnline) return <WifiOff className="w-4 h-4" />
    if (status.isSyncing || syncing)
      return <Loader2 className="w-4 h-4 animate-spin" />
    if (status.hasOfflineQueue) return <CloudOff className="w-4 h-4" />
    if (status.hasPendingChanges) return <Cloud className="w-4 h-4" />
    return <Check className="w-4 h-4" />
  }

  const getStatusBadge = () => {
    if (!status.isOnline) {
      return (
        <Badge
          variant="outline"
          className="bg-red-500/20 text-red-100 border-red-400/50"
        >
          {getStatusIcon()}
          <span className="ml-1">Offline</span>
        </Badge>
      )
    }
    if (status.isSyncing || syncing) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/20 text-blue-100 border-blue-400/50"
        >
          {getStatusIcon()}
          <span className="ml-1">Syncing...</span>
        </Badge>
      )
    }
    if (status.hasOfflineQueue) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/20 text-amber-100 border-amber-400/50"
        >
          {getStatusIcon()}
          <span className="ml-1">Pending sync</span>
        </Badge>
      )
    }
    if (status.hasPendingChanges) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/20 text-amber-100 border-amber-400/50"
        >
          {getStatusIcon()}
          <span className="ml-1">{status.changeCounter} unsaved</span>
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/20 text-emerald-100 border-emerald-400/50"
      >
        {getStatusIcon()}
        <span className="ml-1">All synced</span>
      </Badge>
    )
  }

  if (conflict) {
    return (
      <div className="relative flex flex-col w-full gap-3 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-400/30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-white text-[15px] font-semibold">
            Bookmark Conflict Detected
          </h3>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-white/70">Local:</span>
              <Badge
                variant="outline"
                className="bg-blue-500/20 text-blue-100 border-blue-400/50"
              >
                {conflict.localCount} bookmarks
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70">Server:</span>
              <Badge
                variant="outline"
                className="bg-blue-500/20 text-blue-100 border-blue-400/50"
              >
                {conflict.serverCount} bookmarks
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleResolve('local')}
            className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Keep Local
          </button>
          <button
            onClick={() => handleResolve('server')}
            className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Keep Server
          </button>
          <button
            onClick={() => handleResolve('merge')}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white text-sm font-medium rounded-lg border border-purple-400/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Merge Both
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center w-full h-[40px] px-4 bg-white/10 rounded-2xl border border-white/20">
      <div className="flex w-full items-center gap-3">
        {/* Status Badge */}
        {getStatusBadge()}

        {/* Last Sync Time */}
        <div className="flex items-center gap-1 text-white/60 text-xs">
          <span>Last sync:</span>
          <span className="text-white/80 font-medium">
            {status.lastSyncTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleForceSync}
          disabled={syncing || !status.isOnline}
          className="ml-auto cursor-pointer hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={
            !status.isOnline ? 'Cannot sync while offline' : 'Force sync now'
          }
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  )
}

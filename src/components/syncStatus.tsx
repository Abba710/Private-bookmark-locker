import { useState, useEffect } from "preact/hooks";
import {
  Cloud,
  RefreshCw,
  Check,
  AlertTriangle,
  Loader2,
  WifiOff,
} from "lucide-react";
import {
  getSyncStatus,
  forceSyncBookmarks,
  resolveConflict,
} from "@/service/sync/manager";

/**
 * SyncStatus Component
 * Manages UI for cloud synchronization status, pending changes, and database conflicts.
 */
export function SyncStatus() {
  const [status, setStatus] = useState(getSyncStatus());
  const [syncing, setSyncing] = useState(false);
  const [conflict, setConflict] = useState<any>(null);

  useEffect(() => {
    // Refresh status every second for the timer/counter
    const interval = setInterval(() => {
      setStatus(getSyncStatus());
    }, 1000);

    // Check for existing conflicts on mount
    chrome.storage.local.get(["bookmarkConflict"], (result) => {
      if (result.bookmarkConflict) setConflict(result.bookmarkConflict);
    });

    // Listen for messages from background or manager
    const messageListener = (message: any) => {
      if (message.action === "bookmark_conflict") {
        setConflict(message.data);
      }
      if (message.action === "sync_status") {
        setStatus(message.status);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      clearInterval(interval);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Manually trigger sync process
  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const success = await forceSyncBookmarks();
      if (!success) console.warn("Sync skipped: manager inactive or busy");
    } finally {
      setSyncing(false);
      setStatus(getSyncStatus());
    }
  };

  // Resolve DB conflicts manually
  const handleResolve = async (choice: "local" | "server" | "merge") => {
    setSyncing(true);
    await resolveConflict(choice);
    setConflict(null);
    setSyncing(false);
    setStatus(getSyncStatus());
  };

  // --- UI Helpers ---
  const getStatusBadge = () => {
    if (!status.isOnline) {
      return (
        <div
          title={chrome.i18n.getMessage("app_sync_offline")}
          className="ds-sync-badge ds-sync-badge--offline ds-sync-badge--labeled"
        >
          <WifiOff />
          <span className="ds-sync-badge-label">
            {chrome.i18n.getMessage("app_sync_offline")}
          </span>
        </div>
      );
    }
    if (status.isSyncing || syncing) {
      return (
        <div
          title={chrome.i18n.getMessage("app_sync_syncing")}
          className="ds-sync-badge ds-sync-badge--syncing"
        >
          <Loader2 className="animate-spin" />
        </div>
      );
    }
    if (status.hasPendingChanges) {
      return (
        <div
          title={chrome.i18n.getMessage("app_sync_pending")}
          className="ds-sync-badge ds-sync-badge--pending"
        >
          <Cloud />
        </div>
      );
    }
    return (
      <div
        title={`${chrome.i18n.getMessage("app_sync_last")} ${status.lastSyncTime}`}
        className="ds-sync-badge ds-sync-badge--synced"
      >
        <Check />
      </div>
    );
  };

  if (conflict) {
    return (
      <div className="ds-sync-conflict">
        <div className="ds-sync-conflict-header">
          <div className="ds-sync-conflict-icon">
            <AlertTriangle
              title={chrome.i18n.getMessage("app_sync_conflict_title")}
              style={{
                width: "var(--ds-icon-lg)",
                height: "var(--ds-icon-lg)",
              }}
            />
          </div>
          <span className="ds-sync-conflict-title">
            {chrome.i18n.getMessage("app_sync_conflict_title")}
          </span>
        </div>

        <div className="ds-sync-conflict-grid">
          <button
            onClick={() => handleResolve("local")}
            className="ds-sync-conflict-option"
          >
            <span className="ds-sync-conflict-option-count">
              {conflict.localCount}
            </span>
            {chrome.i18n.getMessage("app_sync_local")}
          </button>
          <button
            onClick={() => handleResolve("server")}
            className="ds-sync-conflict-option"
          >
            <span className="ds-sync-conflict-option-count">
              {conflict.serverCount}
            </span>
            {chrome.i18n.getMessage("app_sync_cloud")}
          </button>
          <button
            onClick={() => handleResolve("merge")}
            className="ds-sync-conflict-option ds-sync-conflict-option--merge"
          >
            {chrome.i18n.getMessage("app_sync_merge")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-sync">
      {getStatusBadge()}

      {/* Sync Action */}
      <button
        onClick={handleForceSync}
        disabled={syncing || !status.isOnline}
        className={`btn-icon btn-icon--outline ds-sync-refresh ${
          syncing ? "ds-sync-refresh--active" : ""
        }`}
        title={chrome.i18n.getMessage("app_sync_force_title")}
      >
        <RefreshCw className={syncing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

import { Eye, EyeOff, FolderPlus, Save, Lock } from "lucide-react";
import {
  createBookmarkFolder,
  saveCurrentPage,
} from "@/features/bookmarks/bookmarkService";
import { setSessionStatus } from "@/features/lock/lockservice";
import { useSwitchStore, useLockOverlayStore } from "@/storage/statelibrary";
import { SyncStatus } from "@/components/syncStatus";

interface ControlPanelProps {
  canCreateFolder: boolean;
  openPremiumModal: (open: boolean) => void;
  isPro: boolean;
}

function ControlPanel({
  canCreateFolder,
  openPremiumModal,
  isPro,
}: ControlPanelProps) {
  const setSwitch = useSwitchStore((state) => state.setSwitch);
  const isIncognitoView = useSwitchStore((state) => state.Switch);
  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked);

  function handleCreateFolder() {
    if (!canCreateFolder) {
      openPremiumModal(true);
      return;
    }
    createBookmarkFolder();
  }

  return (
    <div className="ds-control-panel">
      {/* GROUP 1: CREATE ACTIONS */}
      <div className="ds-control-panel-group ds-control-panel-group--end">
        <button
          className="btn-icon btn-icon--primary"
          onClick={saveCurrentPage}
          title="Save Current Page"
        >
          <Save className="ds-icon-md" />
        </button>
        <button
          onClick={handleCreateFolder}
          className="btn-icon btn-icon--outline"
          style={{ position: "relative" }}
          title="Create Folder"
        >
          <FolderPlus className="ds-icon-md" />
          {!canCreateFolder && <div className="ds-control-panel-dot" />}
        </button>
      </div>

      {/* GROUP 2: VIEW SWITCHER (Segmented Controller) */}
      <div className="ds-control-panel-group ds-control-panel-group--push">
        <div className="ds-switcher">
          <div
            className={`ds-switcher-highlight ${
              isIncognitoView ? "ds-switcher-highlight--right" : ""
            }`}
          />

          <button
            className={`ds-switcher-btn ds-switcher-btn--standard ${
              !isIncognitoView ? "ds-switcher-btn--active" : ""
            }`}
            onClick={() => setSwitch(false)}
            title="Standard View"
          >
            <Eye className="ds-icon-md" />
          </button>

          <button
            className={`ds-switcher-btn ds-switcher-btn--incognito ${
              isIncognitoView ? "ds-switcher-btn--active" : ""
            }`}
            onClick={() => setSwitch(true)}
            title="Incognito View"
          >
            <EyeOff className="ds-icon-md" />
          </button>
        </div>
      </div>

      {/* GROUP 3: SYNC + LOCK MANAGEMENT */}
      <div className="ds-control-panel-group ds-control-panel-group--push">
        {isPro && (
          <div className="ds-sync-wrap">
            <SyncStatus />
          </div>
        )}
        <button
          className="btn-icon btn-icon--outline ds-lock-btn"
          onClick={() => {
            setSessionStatus(false);
            setIsLocked(true);
          }}
          title="Lock Session"
        >
          <Lock className="ds-icon-md" />
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;

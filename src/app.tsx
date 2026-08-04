import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useBookmarkStore } from "@/storage/statelibrary";
import { loadBookmarks } from "@/features/bookmarks/bookmarkService";
import MainPage from "@/pages/mainpage";
import SettingsPage from "@/pages/settings/index.tsx";
import WelcomePage from "@/pages/welcome";
import NotificationsModal from "@/components/notifications/notificationsModal";
import LockOverlay from "@/components/lock/lockoverlay";
import { useLockOverlayStore } from "@/storage/statelibrary";
import { getInitialLockState } from "@/features/lock/lockservice";
import type { StorageChanges, StorageSchema } from "@/types/types";

function App() {
  const isLocked = useLockOverlayStore((state) => state.isLocked);
  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked);
  const setBookmarks = useBookmarkStore((state) => state.setBookmarks);

  useEffect(() => {
    let isMounted = true;

    // Initial Load
    (async () => {
      const bookmarks = await loadBookmarks();
      if (isMounted) setBookmarks(bookmarks);

      const locked = await getInitialLockState();
      if (isMounted) setIsLocked(locked);
    })();

    // Chrome Storage Listener
    function handleStorageChange(
      changes: StorageChanges<StorageSchema>,
      area: "local" | "sync" | "managed" | "session",
    ) {
      if (area !== "local") return;

      const next = changes.bookmarks?.newValue;
      if (!next) return;

      // Compare with current state to avoid loops
      const current = useBookmarkStore.getState().bookmarks;
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        setBookmarks(next);
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      isMounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [setBookmarks, setIsLocked]);

  return (
    <div className="ds-section ds-section-marker h-full">
      {isLocked ? (
        <LockOverlay />
      ) : (
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
        </Routes>
      )}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/[0.08] blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-500/[0.08] blur-[120px] rounded-full" />
      </div>

      <NotificationsModal />
    </div>
  );
}

export default App;

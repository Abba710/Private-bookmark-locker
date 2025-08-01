import UserHeader from "./components/header";
import ControlPanel from "./components/controlpanel";
import BookmarkList from "./components/bookmarks/bookmarkList";
import OptionsPanel from "./components/optionsPanel";
import PremiumBlock from "./components/Premium/premium";
import LockOverlay from "@/components/lock/lockoverlay";
import { useEffect } from "preact/hooks";
import AuthModal from "./components/auth/googleauth";
import { useBookmarkStore, useLockOverlayStore } from "@/storage/statelibrary";
import { loadBookmarks } from "@/features/bookmarks/bookmarkService";
import { getInitialLockState } from "@/features/lock/lockservice";
import PremiumModal from "./components/Premium/premiumModal";

function App() {
  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked);
  const isLocked = useLockOverlayStore((state) => state.isLocked);
  const setBookmarks = useBookmarkStore((state) => state.setBookmarks);

  // Load bookmarks on startup
  useEffect(() => {
    loadBookmarks().then(setBookmarks);
  }, []);

  // Check session and lock status on startup
  useEffect(() => {
    (async () => {
      const locked = await getInitialLockState();
      setIsLocked(locked);
    })();
  }, []);

  return (
    <div className="min-w-full min-h-screen p-4 bg-black text-white flex flex-col gap-[10px]">
      <AuthModal />
      {isLocked ? (
        <LockOverlay />
      ) : (
        <>
          <UserHeader />
          <ControlPanel />
          <BookmarkList />
          <OptionsPanel />
          <PremiumBlock />
          <PremiumModal />
        </>
      )}
    </div>
  );
}

export default App;

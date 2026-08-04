import { useEffect, useState, useRef } from "preact/hooks";
import UserHeader from "@/components/header";
import ControlPanel from "@/components/controlpanel";
import BookmarkList from "@/components/bookmarks/bookmarkList";
import UpgradeToProModal from "@/components/premium/premiumModal";
import DeleteAllBookmarksModal from "@/util/deleteModal";
import Feedback from "@/components/feedback";
// Import Hook only for passing down logic if needed
import useSubscription from "@/hooks/useSubscribe";
import useNotificationsDialog from "@/features/notifications/notificationsDialog";
import { useAuth } from "@/hooks/useAuth";
import { initSync, stopSync } from "@/service/sync";
import { TombstoneService } from "@/service/sync/tombstone";
import deleteBookmarks from "@/util/deleteBookmarks";
import { BookmarkSearch } from "@/components/bookmarks/bookmarksearch";
import Affiliate from "@/components/affiliate";

// Import Stores directly for App-level logic (Performance optimization)
import {
  usePremiumModalStore,
  useSubscribePlanStore,
} from "@/storage/statelibrary";
import ImportBookmarksDialog from "@/components/chromeImportPanel";
import QrModalUi from "@/components/contextMenu/featuresUI/qrGenModal";

function MainPage() {
  const auth = useAuth();
  const { setPremiumModalOpen } = usePremiumModalStore();

  // Local state for modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // --- STORE SELECTORS (Direct access for performance) ---
  const isPro = useSubscribePlanStore((state) => state.isPro);
  const checkSubscription = useSubscribePlanStore(
    (state) => state.checkSubscription,
  );
  const setPlan = useSubscribePlanStore((state) => state.setPlan);

  // Use the hook primarily for passing handlers like 'refreshSubscription' to modals
  const { canCreateFolders, refreshSubscription } = useSubscription();

  // Global hooks
  useNotificationsDialog();

  // --- LOGIC: LOGOUT ---

  const handleSimpleLogout = async () => {
    try {
      await auth.logout();
      stopSync();
      setPlan(false);
    } catch (error) {
      console.error("Simple logout failed:", error);
    }
  };

  const handleFullCleanupLogout = async () => {
    try {
      await auth.logout();
      await TombstoneService.clearDeletions();
      stopSync();
      await deleteBookmarks();
      setPlan(false);
    } catch (error) {
      console.error("Full cleanup logout failed:", error);
    }
  };

  // --- LIFECYCLE 1: Subscription Check (Optimized) ---

  const lastCheckTime = useRef<number>(0);

  useEffect(() => {
    // SECURITY/PERFORMANCE: Only check if user is actually logged in
    if (!auth.user) return;

    // 1. Immediate check on mount (or when user logs in)
    checkSubscription();

    // 2. Check on focus (throttled to once every 60 seconds)
    const onFocus = () => {
      // Re-check auth inside the event handler because closure might be stale
      // though 'auth.user' in dependency usually handles this, it's safer for async events
      if (!auth.user) return;

      const now = Date.now();
      if (now - lastCheckTime.current > 60000) {
        // 60s cooldown
        lastCheckTime.current = now;
        checkSubscription();
      }
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkSubscription, auth.user]); // Dependency on auth.user ensures it runs on login

  // --- LIFECYCLE 2: Sync ---

  useEffect(() => {
    const userId = auth.user?.id;
    // Only init sync if we have a user AND they are confirmed Pro
    if (userId && isPro) {
      initSync(userId);
    } else {
      stopSync();
    }
    return () => stopSync();
  }, [auth.user, isPro]);

  return (
    <div className="relative w-full h-full antialiased selection:bg-indigo-500/30">
      {/* Background visual effects */}
      <div className="relative z-10 flex flex-col h-full">
        <UserHeader
          userData={auth.user}
          logIn={auth.signInWithGoogle}
          logOut={() => setIsLogoutModalOpen(true)}
          isPro={isPro} // Passed directly from store selector
        />{" "}
        {/* Search Header Section */}
        <div className="relative z-10">
          <BookmarkSearch
            placeholder={chrome.i18n.getMessage("app_search_placeholder")}
          />
        </div>
        <div className="flex-1 h-full overflow-hidden">
          <BookmarkList />
        </div>
        <Affiliate />
        <ControlPanel
          canCreateFolder={canCreateFolders()} // Calculated via hook
          openPremiumModal={setPremiumModalOpen}
          isPro={isPro} // Passed direc tly from store selector
        />
      </div>
      {/* Modals */}
      <UpgradeToProModal
        upgrade={refreshSubscription} // Trigger re-check after payment
        logIn={auth.signInWithGoogle}
      />

      <DeleteAllBookmarksModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogoutOnly={handleSimpleLogout}
        onConfirmDelete={handleFullCleanupLogout}
      />
      <ImportBookmarksDialog />
      <Feedback />
      <QrModalUi />
    </div>
  );
}

export default MainPage;

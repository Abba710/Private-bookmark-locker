import { useEffect, useState, useRef } from 'preact/hooks'
import UserHeader from './components/header'
import ControlPanel from './components/controlpanel'
import BookmarkList from './components/bookmarks/bookmarkList'
import OptionsPanel from './components/optionsPanel'
import LockOverlay from '@/components/lock/lockoverlay'
import Feedback from '@/components/feedback'
import SupportDialog from './components/Support/supportModal'
import NotificationsModal from '@/components/notifications/notificationsModal'
import QrModalUi from './components/contextMenu/featuresUI/qrGenModal'
import UpgradeToProModal from '@/components/premium/premiumModal'
import DeleteAllBookmarksModal from '@/util/deleteModal'
import { SyncStatus } from '@/components/syncStatus'

// Import Stores directly for App-level logic (Performance optimization)
import {
  useBookmarkStore,
  useLockOverlayStore,
  usePremiumModalStore,
  useSubscribePlanStore,
} from '@/storage/statelibrary'

// Import Hook only for passing down logic if needed
import useSubscription from '@/hooks/useSubscribe'

import { loadBookmarks } from '@/features/bookmarks/bookmarkService'
import { getInitialLockState } from '@/features/lock/lockservice'
import useNotificationsDialog from '@/features/notifications/notificationsDialog'
import { useAuth } from '@/hooks/useAuth'
import { initSync, stopSync } from '@/service/sync'
import { TombstoneService } from '@/service/sync/tombstone'
import deleteBookmarks from '@/util/deleteBookmarks'
import type { StorageChanges, StorageSchema } from '@/types/types'

function App() {
  const auth = useAuth()
  const { setPremiumModalOpen } = usePremiumModalStore()

  // Local state for modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // --- STORE SELECTORS (Direct access for performance) ---
  const isPro = useSubscribePlanStore((state) => state.isPro)
  const checkSubscription = useSubscribePlanStore(
    (state) => state.checkSubscription
  )
  const setPlan = useSubscribePlanStore((state) => state.setPlan)

  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked)
  const isLocked = useLockOverlayStore((state) => state.isLocked)
  const setBookmarks = useBookmarkStore((state) => state.setBookmarks)

  // Use the hook primarily for passing handlers like 'refreshSubscription' to modals
  const { canCreateFolders, refreshSubscription } = useSubscription()

  // Global hooks
  useNotificationsDialog()

  // --- LOGIC: LOGOUT ---

  const handleSimpleLogout = async () => {
    try {
      await auth.logout()
      stopSync()
      setPlan(false)
    } catch (error) {
      console.error('Simple logout failed:', error)
    }
  }

  const handleFullCleanupLogout = async () => {
    try {
      await auth.logout()
      await TombstoneService.clearDeletions()
      stopSync()
      await deleteBookmarks()
      setPlan(false)
    } catch (error) {
      console.error('Full cleanup logout failed:', error)
    }
  }

  // --- LIFECYCLE 1: Subscription Check (Optimized) ---

  const lastCheckTime = useRef<number>(0)

  useEffect(() => {
    // SECURITY/PERFORMANCE: Only check if user is actually logged in
    if (!auth.user) return

    // 1. Immediate check on mount (or when user logs in)
    checkSubscription()

    // 2. Check on focus (throttled to once every 60 seconds)
    const onFocus = () => {
      // Re-check auth inside the event handler because closure might be stale
      // though 'auth.user' in dependency usually handles this, it's safer for async events
      if (!auth.user) return

      const now = Date.now()
      if (now - lastCheckTime.current > 60000) {
        // 60s cooldown
        lastCheckTime.current = now
        checkSubscription()
      }
    }

    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [checkSubscription, auth.user]) // Dependency on auth.user ensures it runs on login

  // --- LIFECYCLE 2: Sync ---

  useEffect(() => {
    const userId = auth.user?.id
    // Only init sync if we have a user AND they are confirmed Pro
    if (userId && isPro) {
      initSync(userId)
    } else {
      stopSync()
    }
    return () => stopSync()
  }, [auth.user, isPro])

  // --- LIFECYCLE 3: Initial Data & Storage Listeners ---

  useEffect(() => {
    let isMounted = true

    // Initial Load
    ;(async () => {
      const bookmarks = await loadBookmarks()
      if (isMounted) setBookmarks(bookmarks)

      const locked = await getInitialLockState()
      if (isMounted) setIsLocked(locked)
    })()

    // Chrome Storage Listener
    function handleStorageChange(
      changes: StorageChanges<StorageSchema>,
      area: 'local' | 'sync' | 'managed' | 'session'
    ) {
      if (area !== 'local') return

      const next = changes.bookmarks?.newValue
      if (!next) return

      // Compare with current state to avoid loops
      const current = useBookmarkStore.getState().bookmarks
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        setBookmarks(next)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      isMounted = false
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [setBookmarks, setIsLocked])

  return (
    <div className="relative min-w-full min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased overflow-hidden selection:bg-indigo-500/30">
      {/* Background visual effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/[0.08] blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-500/[0.08] blur-[120px] rounded-full" />
      </div>

      {isLocked ? (
        <LockOverlay />
      ) : (
        <div className="relative z-10 flex flex-col gap-[12px] p-4 h-full">
          <UserHeader
            userData={auth.user}
            logIn={auth.signInWithGoogle}
            logOut={() => setIsLogoutModalOpen(true)}
            isPro={isPro} // Passed directly from store selector
          />

          {auth.user && isPro && <SyncStatus />}

          <ControlPanel
            canCreateFolder={canCreateFolders()} // Calculated via hook
            openPremiumModal={setPremiumModalOpen}
          />

          <BookmarkList />

          <OptionsPanel />
          <Feedback />
          <SupportDialog />
          <NotificationsModal />
          <QrModalUi />

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
        </div>
      )}
    </div>
  )
}

export default App

import UserHeader from './components/header'
import ControlPanel from './components/controlpanel'
import BookmarkList from './components/bookmarks/bookmarkList'
import OptionsPanel from './components/optionsPanel'
import LockOverlay from '@/components/lock/lockoverlay'
import { useEffect } from 'preact/hooks'
import { useBookmarkStore, useLockOverlayStore } from '@/storage/statelibrary'
import { loadBookmarks } from '@/features/bookmarks/bookmarkService'
import { getInitialLockState } from '@/features/lock/lockservice'
import Feedback from '@/components/feedback'
import type { StorageChanges, StorageSchema } from '@/types/types'
import SupportDialog from './components/Support/supportModal'
import { useCallSupport } from '@/features/support/callSupport'
import NotificationsModal from '@/components/notifications/notificationsModal'
import useNotificationsDialog from '@/features/notifications/notificationsDialog'
import QrModalUi from './components/contextMenu/featuresUI/qrGenModal'

function App() {
  useCallSupport()
  useNotificationsDialog()
  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked)
  const isLocked = useLockOverlayStore((state) => state.isLocked)
  const setBookmarks = useBookmarkStore((state) => state.setBookmarks)

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      const loadedBookmarks = await loadBookmarks()
      if (isMounted) setBookmarks(loadedBookmarks)

      const locked = await getInitialLockState()
      if (isMounted) setIsLocked(locked)
    })()

    function handleStorageChange(
      changes: StorageChanges<StorageSchema>,
      area: 'local' | 'sync' | 'managed' | 'session'
    ) {
      if (area !== 'local') return

      const newVal = changes.bookmarks?.newValue
      if (!newVal) return

      const current = useBookmarkStore.getState().bookmarks

      if (JSON.stringify(current) !== JSON.stringify(newVal)) {
        setBookmarks(newVal)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      isMounted = false
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  return (
    <div className="min-w-full justify-center items-center min-h-screen p-4 bg-black text-white flex flex-col gap-[10px]">
      {isLocked ? (
        <LockOverlay />
      ) : (
        <>
          <UserHeader />
          <ControlPanel />
          <BookmarkList />
          <OptionsPanel />
          <Feedback />
          <SupportDialog />
          <NotificationsModal />
          <QrModalUi />
        </>
      )}
    </div>
  )
}

export default App

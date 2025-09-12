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

function App() {
  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked)
  const isLocked = useLockOverlayStore((state) => state.isLocked)
  const setBookmarks = useBookmarkStore((state) => state.setBookmarks)

  useEffect(() => {
    ;(async () => {
      const loadedBookmarks = await loadBookmarks()
      setBookmarks(loadedBookmarks)

      const locked = await getInitialLockState()
      setIsLocked(locked)
    })()
  }, [])

  return (
    <div className="min-w-full min-h-screen p-4 bg-black text-white flex flex-col gap-[10px]">
      {isLocked ? (
        <LockOverlay />
      ) : (
        <>
          <UserHeader />
          <ControlPanel />
          <BookmarkList />
          <OptionsPanel />
          <Feedback />
        </>
      )}
    </div>
  )
}

export default App

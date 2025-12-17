import {
  createBookmarkFolder,
  saveCurrentPage,
} from '@/features/bookmarks/bookmarkService'
import { setSessionStatus } from '@/features/lock/lockservice'
import { useSwitchStore, useLockOverlayStore } from '@/storage/statelibrary'

interface ControlPanelProps {
  canCreateFolder: boolean
  openPremiumModal: (open: boolean) => void
}

function ControlPanel({
  canCreateFolder,
  openPremiumModal,
}: ControlPanelProps) {
  const setSwitch = useSwitchStore((state) => state.setSwitch)
  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked)

  function handleCreateFolder() {
    if (!canCreateFolder) {
      openPremiumModal(true)
      return
    }
    createBookmarkFolder()
  }

  return (
    <div className="flex items-center justify-center w-full rounded-2xl">
      <div className="flex gap-2">
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={() => {
            setSessionStatus(false), setIsLocked(true)
          }}
        >
          🔒
        </button>
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={() => setSwitch(false)}
        >
          👁
        </button>
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={() => setSwitch(true)}
        >
          🕵️
        </button>
        <button
          onClick={handleCreateFolder}
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition"
        >
          📁
        </button>
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={saveCurrentPage}
        >
          💾
        </button>
      </div>
    </div>
  )
}
export default ControlPanel

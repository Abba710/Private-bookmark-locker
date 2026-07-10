import { Eye, EyeOff, FolderPlus, Save, Lock } from 'lucide-react'
import {
  createBookmarkFolder,
  saveCurrentPage,
} from '@/features/bookmarks/bookmarkService'
import { setSessionStatus } from '@/features/lock/lockservice'
import { useSwitchStore, useLockOverlayStore } from '@/storage/statelibrary'
import { SyncStatus } from '@/components/syncStatus'

interface ControlPanelProps {
  canCreateFolder: boolean
  openPremiumModal: (open: boolean) => void
  isPro: boolean
}

function ControlPanel({
  canCreateFolder,
  openPremiumModal,
  isPro,
}: ControlPanelProps) {
  const setSwitch = useSwitchStore((state) => state.setSwitch)
  const isIncognitoView = useSwitchStore((state) => state.Switch)
  const setIsLocked = useLockOverlayStore((state) => state.setIsLocked)

  function handleCreateFolder() {
    if (!canCreateFolder) {
      openPremiumModal(true)
      return
    }
    createBookmarkFolder()
  }

  const iconStyles = 'w-4 h-4 transition-all duration-300'
  const buttonBase =
    'group relative flex items-center justify-center transition-all duration-300 active:scale-90'
  const squareBtn = `${buttonBase} w-10 h-10 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 shadow-inner`

  return (
    <div className="fixed bottom-0 items-center justify-center z-9999 w-full bg-[#0f0f11]">
      <div className="flex items-center gap-2 p-1.5 bg-[#0f0f11] border border-white/10 shadow-2xl">
        <div className="flex gap-1.5 pl-2 border-l border-white/5">
          <button
            className={`${squareBtn} hover:text-emerald-400 cursor-pointer hover:shadow-[0_0_15px_rgba(52,211,153,0.1)]`}
            onClick={saveCurrentPage}
            title="Save Current Page"
          >
            <Save className={iconStyles} />
          </button>
          <button
            onClick={handleCreateFolder}
            className={`${squareBtn} cursor-pointer ${
              !canCreateFolder
                ? 'hover:text-indigo-400'
                : 'hover:text-emerald-400'
            }`}
            title="Create Folder"
          >
            <FolderPlus className={iconStyles} />
            {!canCreateFolder && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            )}
          </button>
        </div>

        {/* GROUP 2: VIEW SWITCHER (Segmented Controller) */}
        <div className="relative flex items-center bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
          {/* Active Highlight Background */}
          <div
            className={`absolute h-8 w-10 bg-white/10 border border-white/10 rounded-lg transition-all duration-300 ease-out shadow-sm
              ${isIncognitoView ? 'translate-x-10' : 'translate-x-0'}`}
          />

          <button
            className={`relative cursor-pointer z-10 w-10 h-8 flex items-center justify-center transition-colors duration-300
              ${
                !isIncognitoView
                  ? 'text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            onClick={() => setSwitch(false)}
            title="Standard View"
          >
            <Eye className={iconStyles} />
          </button>

          <button
            className={`relative cursor-pointer z-10 w-10 h-8 flex items-center justify-center transition-colors duration-300
              ${
                isIncognitoView
                  ? 'text-purple-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            onClick={() => setSwitch(true)}
            title="Incognito View"
          >
            <EyeOff className={iconStyles} />
          </button>
        </div>

        <div className="relative flex items-center bg-black/40 rounded-xl border border-white/5 shadow-inner">
          {/* Active Highlight Background */}
          <div
          className={`flex bg-white/10 border border-white/10 rounded-lg transition-all duration-300 ease-out shadow-sm`}
          />          {isPro && <SyncStatus />}
        </div>

        {/* GROUP 3: LOCK MANAGEMENT */}
        <div className="pr-2 border-r border-white/5 ml-auto">
          <button
            className={`${squareBtn} hover:text-amber-400 cursor-pointer hover:shadow-[0_0_15px_rgba(251,191,36,0.1)]`}
            onClick={() => {
              setSessionStatus(false)
              setIsLocked(true)
            }}
            title="Lock Session"
          >
            <Lock className={`${iconStyles} group-hover:rotate-12`} />
          </button>

        </div>
      </div>
    </div>
  )
}

export default ControlPanel

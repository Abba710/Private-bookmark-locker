import { Eye, EyeOff, FolderPlus, Save, Lock } from 'lucide-react'
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

/**
 * ControlPanel Component
 * Style: Modern SaaS Segmented Control
 * Features:
 * 1. Isolated Lock button.
 * 2. Visual Tab Switcher (Standard vs Incognito).
 * 3. Content management group.
 */

function ControlPanel({
  canCreateFolder,
  openPremiumModal,
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
    <div className="flex items-center justify-center w-full py-2 select-none">
      <div className="flex items-center gap-2 p-1.5 bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-[22px] shadow-2xl">
        {/* GROUP 1: SECURITY (Isolated) */}
        <div className="pr-2 border-r border-white/5">
          <button
            className={`${squareBtn} hover:text-amber-400 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)]`}
            onClick={() => {
              setSessionStatus(false)
              setIsLocked(true)
            }}
            title="Lock Session"
          >
            <Lock className={`${iconStyles} group-hover:rotate-12`} />
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
            className={`relative z-10 w-10 h-8 flex items-center justify-center transition-colors duration-300 
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
            className={`relative z-10 w-10 h-8 flex items-center justify-center transition-colors duration-300 
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

        {/* GROUP 3: CONTENT MANAGEMENT */}
        <div className="flex gap-1.5 pl-2 border-l border-white/5">
          <button
            onClick={handleCreateFolder}
            className={`${squareBtn} ${
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

          <button
            className={`${squareBtn} hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.1)]`}
            onClick={saveCurrentPage}
            title="Save Current Page"
          >
            <Save className={iconStyles} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel

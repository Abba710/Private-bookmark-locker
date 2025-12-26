import { useState } from 'preact/hooks'
import { Trash2, LogOut, Loader2 } from 'lucide-react'

interface DeleteAllBookmarksModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => Promise<void> | void // Delete + Logout
  onConfirmLogoutOnly: () => Promise<void> | void // Logout only
}

/**
 * DeleteAllBookmarksModal Component
 * Provides options for signing out with or without local data deletion.
 */
export default function DeleteAllBookmarksModal({
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirmLogoutOnly,
}: DeleteAllBookmarksModalProps) {
  const [loadingType, setLoadingType] = useState<'delete' | 'logout' | null>(
    null
  )

  /**
   * Handles the selected sign-out action
   * @param type Action type: 'delete' for full cleanup, 'logout' for session end only
   */
  const handleAction = async (type: 'delete' | 'logout') => {
    setLoadingType(type)
    try {
      if (type === 'delete') await onConfirmDelete()
      else await onConfirmLogoutOnly()
      onClose()
    } catch (err) {
      console.error('Action error:', err)
    } finally {
      setLoadingType(null)
    }
  }

  if (!isOpen) return null

  // Base styles for the action buttons
  const buttonBase = `group relative w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 overflow-hidden flex items-center justify-center gap-2 select-none`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[440px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl p-8 overflow-hidden">
        {/* Decorative top glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />

        <div className="text-center mb-8">
          {/* Header Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 mb-4">
            <LogOut className="w-7 h-7 text-indigo-400" />
          </div>
          {/* Localized Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {chrome.i18n.getMessage('app_signout_title')}
          </h2>
          {/* Localized Description */}
          <p className="text-zinc-400 text-sm">
            {chrome.i18n.getMessage('app_signout_description')}
          </p>
        </div>

        <div className="space-y-3">
          {/* OPTION 1: Logout Only (Localized) */}
          <button
            onClick={() => handleAction('logout')}
            disabled={!!loadingType}
            className={`${buttonBase} bg-zinc-800 text-white hover:bg-zinc-700 border border-white/5`}
          >
            {loadingType === 'logout' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                {chrome.i18n.getMessage('app_signout_keep_data')}
              </>
            )}
          </button>

          {/* OPTION 2: Delete Everything (Localized) */}
          <button
            onClick={() => handleAction('delete')}
            disabled={!!loadingType}
            className={`${buttonBase} bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90`}
          >
            {loadingType === 'delete' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {chrome.i18n.getMessage('app_signout_delete_all')}
              </>
            )}
          </button>

          {/* Styled UI Divider */}
          <div className="py-2 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
              {chrome.i18n.getMessage('app_signout_or')}
            </span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {/* OPTION 3: Cancel (Localized) */}
          <button
            onClick={onClose}
            disabled={!!loadingType}
            className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            {chrome.i18n.getMessage('app_signout_stay')}
          </button>
        </div>
      </div>
    </div>
  )
}

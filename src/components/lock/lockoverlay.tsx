import { useLockOverlayStore } from '@/storage/statelibrary'
import {
  getLockStatus,
  handleSubmitPassword,
} from '@/features/lock/lockservice'
import { useEffect, useState } from 'preact/hooks'

export default function LockOverlay() {
  const mode = useLockOverlayStore((state) => state.mode)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('') // ✅ state for error messages

  useEffect(() => {
    ;(async () => {
      await getLockStatus()
    })()
  }, [])

  // ✅ Unified password submit handler with error handling
  const submitPassword = async () => {
    if (!password.trim()) {
      setError(chrome.i18n.getMessage('app_password_empty_error')) // show error if password is empty
      return
    }

    try {
      await handleSubmitPassword(password)
      setError('') // clear error if successful
    } catch (err) {
      setError(String(err)) // show error from service
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white/10 w-full max-w-[320px] rounded-lg shadow-lg shadow-black/20 p-4 border border-white/10">
        <h2
          className="text-center text-white text-lg font-semibold mb-4"
          data-i18n="app_enter_password"
        >
          {mode === 'setup'
            ? `${chrome.i18n.getMessage('app_create_password')}`
            : `${chrome.i18n.getMessage('app_enter_password')}`}
        </h2>

        <input
          type="password"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          className="w-full px-3 py-2 mb-1 rounded-md bg-white/10 text-white text-sm placeholder-white/40 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#45E3B8] transition"
          placeholder={`${
            mode === 'setup'
              ? chrome.i18n.getMessage('app_create_password_placeholder')
              : chrome.i18n.getMessage('app_enter_password_placeholder')
          }`}
          onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
        />

        {/* ✅ Error message */}
        {error && (
          <p className="text-center text-red-400 text-xs mb-2">{error}</p>
        )}

        <button
          className="w-full px-3 py-2 bg-[#45E3B8]/80 text-black rounded-md text-sm font-medium hover:bg-[#45E3B8] transition hover:scale-105 active:scale-95"
          onClick={submitPassword}
        >
          {mode === 'setup'
            ? `${chrome.i18n.getMessage('app_create_password_button')}`
            : `${chrome.i18n.getMessage('app_unlock')}`}
        </button>
      </div>

      <p className="absolute bottom-4 text-white/60 text-xl max-w-[320px] text-center px-4">
        {chrome.i18n.getMessage('app_password_warning')}
      </p>
    </div>
  )
}

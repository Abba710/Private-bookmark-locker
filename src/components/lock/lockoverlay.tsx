import { useLockOverlayStore } from '@/storage/statelibrary'
import {
  getLockStatus,
  handleSubmitPassword,
} from '@/features/lock/lockservice'
import { useEffect, useState } from 'preact/hooks'
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react'

/**
 * LockOverlay Component
 * Style: Modern Dark SaaS / High-Security UI
 * Description: Full-screen protection layer with glassmorphism and indigo accents.
 */

export default function LockOverlay() {
  const mode = useLockOverlayStore((state) => state.mode)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      await getLockStatus()
    })()
  }, [])

  const submitPassword = async () => {
    if (!password.trim()) {
      setError(chrome.i18n.getMessage('app_password_empty_error'))
      return
    }

    try {
      await handleSubmitPassword(password)
      setError('')
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#09090b]/80 backdrop-blur-xl z-[100] p-4 animate-in fade-in duration-500">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-[360px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl p-8 flex flex-col items-center overflow-hidden">
        {/* TOP GLOW EFFECT */}
        <div className="absolute top-0 inset-x-0 h-32 bg-indigo-500/5 blur-[40px] rounded-full pointer-events-none" />

        {/* SECURITY ICON BOX */}
        <div className="relative w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
          {mode === 'setup' ? (
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          ) : (
            <Lock className="w-8 h-8 text-indigo-400" />
          )}
        </div>

        {/* HEADER */}
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2 text-center leading-tight">
          {mode === 'setup'
            ? chrome.i18n.getMessage('app_create_password')
            : chrome.i18n.getMessage('app_enter_password')}
        </h2>

        <p className="text-zinc-500 text-sm font-medium mb-8 text-center px-2">
          {mode === 'setup'
            ? chrome.i18n.getMessage('app_lock_setup_description')
            : chrome.i18n.getMessage('app_lock_unlock_description')}
        </p>

        {/* INPUT FIELD */}
        <div className="w-full relative group mb-2">
          <input
            type="password"
            autoFocus
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
            placeholder={
              mode === 'setup'
                ? chrome.i18n.getMessage('app_create_password_placeholder')
                : chrome.i18n.getMessage('app_enter_password_placeholder')
            }
            className="w-full px-4 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* ERROR MESSAGE */}
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
            error ? 'h-6 opacity-100 mb-4' : 'h-0 opacity-0'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <p className="text-red-400 text-xs font-medium">{error}</p>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={submitPassword}
          className="group relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full" />
          <span className="relative flex items-center justify-center gap-2">
            {mode === 'setup'
              ? chrome.i18n.getMessage('app_create_password_button')
              : chrome.i18n.getMessage('app_unlock')}
          </span>
        </button>

        {/* LEGAL LINKS: Only visible in setup mode */}
        {mode === 'setup' && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-top-2 duration-700">
            <p className="text-[11px] text-zinc-500 leading-relaxed px-4">
              {chrome.i18n.getMessage('app_lock_legal_agreement')}{' '}
              <a
                href="https://abbablog.me/locker/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
              >
                {chrome.i18n.getMessage('app_lock_terms')}
              </a>{' '}
              {chrome.i18n.getMessage('app_lock_and')}{' '}
              <a
                href="https://abbablog.me/locker/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
              >
                {chrome.i18n.getMessage('app_lock_privacy')}
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* FOOTER WARNING */}
      <div className="fixed bottom-10 flex flex-col items-center gap-2 px-6 max-w-[400px] animate-pulse">
        <p className="text-zinc-500 text-xs font-medium text-center uppercase tracking-[0.2em]">
          {chrome.i18n.getMessage('app_lock_security_notice')}
        </p>
        <p className="text-zinc-400 text-sm font-medium text-center leading-relaxed">
          {chrome.i18n.getMessage('app_password_warning')}
        </p>
      </div>
    </div>
  )
}

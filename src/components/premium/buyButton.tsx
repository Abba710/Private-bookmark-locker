import type { TargetedEvent } from 'preact/compat'
import { useState, useRef, useEffect } from 'preact/hooks'
import { supabase } from '@/service/supabase'
import { Loader2, XCircle, WifiOff } from 'lucide-react'

interface BuyButtonProps {
  className?: string
  children?: React.ReactNode
  onBuyClick?: () => void
  logIn: () => Promise<void> | void
  checkSubscription: () => Promise<boolean>
}

export function BuyButton({
  className,
  children,
  onBuyClick,
  logIn,
  checkSubscription,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const BASE_CHECKOUT_URL =
    'https://abba4game.lemonsqueezy.com/checkout/buy/83a76148-ccec-480d-8f25-cdcda5a332e1'

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const waitForSession = async (
    signal: AbortSignal,
    timeout = 60000
  ): Promise<{ id: string } | null> => {
    const start = Date.now()

    while (Date.now() - start < timeout) {
      if (signal.aborted)
        throw new Error(chrome.i18n.getMessage('app_buy_cancel_user'))
      if (!navigator.onLine)
        throw new Error(chrome.i18n.getMessage('app_buy_no_internet'))

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
        if (session?.user) return session.user
      } catch (err) {
        console.warn('Network error during polling:', err)
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    throw new Error(chrome.i18n.getMessage('app_buy_login_timeout'))
  }

  const handleInteraction = async (e: TargetedEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // 1. CANCEL
    if (loading) {
      if (abortControllerRef.current) abortControllerRef.current.abort()
      setLoading(false)
      setErrorMsg(null)
      return
    }

    // 2. START
    setLoading(true)
    setErrorMsg(null)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      if (!navigator.onLine)
        throw new Error(chrome.i18n.getMessage('app_buy_no_internet'))

      // --- STAGE 1: AUTHORIZATION ---
      let {
        data: { session },
      } = await supabase.auth.getSession()
      let userId = session?.user?.id

      if (!userId) {
        console.log('👤 No user found. Triggering login...')
        try {
          await logIn()
        } catch (loginErr) {
          throw new Error(chrome.i18n.getMessage('app_buy_login_window_error'))
        }

        const user = await waitForSession(abortController.signal)
        if (!user)
          throw new Error(chrome.i18n.getMessage('app_buy_session_failed'))
        userId = user.id
      }

      // --- STAGE 2: CHECK SUBSCRIPTION AFTER LOGIN ---
      const isAlreadyPro = await checkSubscription()

      if (abortController.signal.aborted) return

      if (isAlreadyPro) {
        console.log('🎉 User is already PRO. Closing...')
        setLoading(false)
        return
      }

      // --- STAGE 3: OPEN CHECKOUT (If not PRO) ---
      if (onBuyClick) onBuyClick()

      const finalUrl = `${BASE_CHECKOUT_URL}?checkout[custom][user_id]=${userId}&checkout[passthrough]=${userId}`
      const win = window.open(finalUrl, '_blank', 'noopener,noreferrer')

      if (!win) throw new Error(chrome.i18n.getMessage('app_buy_popup_blocked'))

      setLoading(false)
    } catch (err: any) {
      if (err.message !== chrome.i18n.getMessage('app_buy_cancel_user')) {
        console.error('❌ Purchase Error:', err)
        if (err.message === chrome.i18n.getMessage('app_buy_no_internet')) {
          setErrorMsg(chrome.i18n.getMessage('app_buy_no_internet'))
        } else if (
          err.message === chrome.i18n.getMessage('app_buy_login_timeout')
        ) {
          setErrorMsg(chrome.i18n.getMessage('app_buy_login_timeout'))
        } else {
          setErrorMsg(chrome.i18n.getMessage('app_buy_login_failed'))
        }
      }
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <button onClick={handleInteraction} className={className} type="button">
        {loading ? (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-normal opacity-90">
              {chrome.i18n.getMessage('app_buy_wait_login')}
              <span className="opacity-60 text-xs ml-1">
                {chrome.i18n.getMessage('app_buy_click_cancel')}
              </span>
            </span>
            <XCircle className="w-4 h-4 ml-auto text-white/50 hover:text-white transition-colors" />
          </div>
        ) : (
          children
        )}
      </button>

      {errorMsg && (
        <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs animate-in fade-in slide-in-from-top-1 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          {errorMsg === chrome.i18n.getMessage('app_buy_no_internet') ? (
            <WifiOff className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {errorMsg}
        </div>
      )}
    </div>
  )
}

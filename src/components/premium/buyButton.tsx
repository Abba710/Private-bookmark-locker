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
    'https://abba4game.lemonsqueezy.com/buy/de74906f-e252-43af-9bde-0c133f742d17'

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
      if (signal.aborted) throw new Error('Canceled by user')
      if (!navigator.onLine) throw new Error('No internet connection')

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
    throw new Error('Login timed out')
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
      if (!navigator.onLine) throw new Error('No internet connection')

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
          throw new Error('Login window failed to open')
        }

        const user = await waitForSession(abortController.signal)
        if (!user) throw new Error('Session check failed')
        userId = user.id
      }

      // --- STAGE 2: CHECK SUBSCRIPTION AFTER LOGIN ---
      // We check if this user already has PRO status.
      const isAlreadyPro = await checkSubscription()

      if (abortController.signal.aborted) return

      if (isAlreadyPro) {
        // SCENARIO A: User is already PRO.
        // We just stop loading and exit.
        // The parent component (Modal) will close itself because isPro will become true.
        console.log('🎉 User is already PRO. Closing...')
        setLoading(false)
        return
      }

      // --- STAGE 3: OPEN CHECKOUT (If not PRO) ---
      if (onBuyClick) onBuyClick()

      const finalUrl = `${BASE_CHECKOUT_URL}?checkout[custom][user_id]=${userId}&checkout[passthrough]=${userId}`
      const win = window.open(finalUrl, '_blank', 'noopener,noreferrer')

      if (!win) throw new Error('Popup blocked')

      setLoading(false)
    } catch (err: any) {
      if (err.message !== 'Canceled by user') {
        console.error('❌ Purchase Error:', err)
        if (err.message === 'No internet connection') {
          setErrorMsg('No internet connection')
        } else if (err.message === 'Login timed out') {
          setErrorMsg('Login timed out')
        } else {
          setErrorMsg('Login failed or closed.')
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
              Wait for Login...
              <span className="opacity-60 text-xs ml-1">(Click to cancel)</span>
            </span>
            <XCircle className="w-4 h-4 ml-auto text-white/50 hover:text-white transition-colors" />
          </div>
        ) : (
          children
        )}
      </button>

      {errorMsg && (
        <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs animate-in fade-in slide-in-from-top-1 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          {errorMsg === 'No internet connection' ? (
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

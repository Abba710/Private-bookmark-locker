import { useState, useEffect } from 'preact/hooks'
import {
  usePremiumModalStore,
  useSubscribePlanStore,
} from '@/storage/statelibrary'
import {
  Zap,
  Globe,
  Folder,
  MousePointer2,
  X,
  Star,
  Loader2,
  CheckCircle2,
  Database,
} from 'lucide-react'
import { BuyButton } from '@/components/premium/buyButton'

interface UpgradeToProModalProps {
  upgrade: () => Promise<void> | void
  logIn: () => void
}

export default function UpgradeToProModal({
  upgrade,
  logIn,
}: UpgradeToProModalProps) {
  const { premiumModalOpen, setPremiumModalOpen } = usePremiumModalStore()
  const isPro = useSubscribePlanStore((state) => state.isPro)

  // UI States
  const [hasClickedBuy, setHasClickedBuy] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Reset states
  useEffect(() => {
    if (!premiumModalOpen) {
      const timer = setTimeout(() => {
        setHasClickedBuy(false)
        setCooldown(0)
        setIsChecking(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [premiumModalOpen])

  // Auto-close logic (Triggers if BuyButton detects that the user is already PRO)
  useEffect(() => {
    if (isPro && premiumModalOpen) {
      const timer = setTimeout(() => setPremiumModalOpen(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isPro, premiumModalOpen, setPremiumModalOpen])

  // Cooldown Timer
  useEffect(() => {
    let interval: any
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldown])

  const handleBuySuccess = () => {
    setHasClickedBuy(true)
  }

  // --- IMPORTANT FUNCTION ---
  // This function is passed to the BuyButton. It updates data and returns the result.
  const handleCheckAndUpgrade = async (): Promise<boolean> => {
    try {
      await upgrade() // Refresh data from the DB (via App.tsx)

      // Immediately check the current state of the store
      // Note: getState() works if this is a zustand store.
      // If useSubscribePlanStore is a hook but the store was created via create(),
      // it should have a static getState() method.
      const currentStatus = useSubscribePlanStore.getState().isPro
      return currentStatus
    } catch (e) {
      console.error('Error checking subscription:', e)
      return false
    }
  }

  const handleCheckStatus = async () => {
    if (cooldown > 0 || isChecking) return
    setIsChecking(true)
    try {
      await upgrade()
    } catch (err) {
      console.error('Check status error:', err)
    } finally {
      setIsChecking(false)
      setCooldown(5)
    }
  }

  if (!premiumModalOpen) return null

  const features = [
    {
      icon: <Folder className="w-5 h-5 text-indigo-400" />,
      text: 'Unlimited Folders',
    },
    {
      icon: <Globe className="w-5 h-5 text-pink-400" />,
      text: 'Real-time Cloud Sync',
    },
    {
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      text: 'Data & Tools',
      subFeatures: ['Import/Export', 'Chrome Collect', 'Session Saver'],
    },
    {
      icon: <MousePointer2 className="w-5 h-5 text-purple-400" />,
      text: 'Advanced Toolkit',
      subFeatures: ['AI Summaries', 'PDF Uploads', 'QR Generator'],
    },
  ]

  const buttonBaseStyles = `
    group relative w-full py-4 px-6 rounded-xl 
    font-semibold shadow-lg transition-all duration-200 
    overflow-hidden flex items-center justify-center gap-2
    select-none
  `
  const activeGradient =
    'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
  const cooldownStyles =
    'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-white/5'

  return (
    <div className="fixed inset-0 z-[100] min-w-full min-h-full flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setPremiumModalOpen(false)}
      />

      <div className="relative w-full max-w-[480px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

        <button
          onClick={() => setPremiumModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 max-h-[95vh] overflow-y-auto custom-scrollbar">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Unlock{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Pro Power
              </span>
            </h2>
            <p className="text-zinc-400 text-sm">
              Secure your library in the cloud and access it anywhere.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[#1a1a1a] border border-white/5 shadow-inner">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm mb-0.5">
                      {feature.text}
                    </h3>
                    {feature.subFeatures && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {feature.subFeatures.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-300"
                          >
                            <Star className="w-3 h-3" /> {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {!hasClickedBuy ? (
              <BuyButton
                className={`${buttonBaseStyles} ${activeGradient}`}
                onBuyClick={handleBuySuccess}
                logIn={logIn}
                checkSubscription={handleCheckAndUpgrade} // Pass the verification function
              >
                <span className="relative flex items-center justify-center gap-2">
                  Upgrade to Pro Now
                  <Zap className="w-4 h-4 fill-white/50" />
                </span>
              </BuyButton>
            ) : (
              <button
                onClick={handleCheckStatus}
                disabled={cooldown > 0 || isChecking || isPro}
                className={`${buttonBaseStyles} ${
                  cooldown > 0 || isChecking ? cooldownStyles : activeGradient
                }`}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking Payment...
                  </>
                ) : isPro ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Success! Enjoy Pro
                  </>
                ) : cooldown > 0 ? (
                  <>Retry in {cooldown}s</>
                ) : (
                  <>
                    I've Paid, Check Status
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setPremiumModalOpen(false)}
              className="w-full py-2 text-sm text-gray-500 hover:text-white transition-colors"
            >
              {hasClickedBuy
                ? 'Check later'
                : "No thanks, I'll stick to free plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

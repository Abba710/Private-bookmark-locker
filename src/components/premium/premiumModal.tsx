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

/**
 * UpgradeToProModal Component
 * Handles the premium upgrade UI and subscription status verification.
 */
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

  // Reset internal states when modal is closed
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

  // Automatically close modal if user is detected as Pro
  useEffect(() => {
    if (isPro && premiumModalOpen) {
      const timer = setTimeout(() => setPremiumModalOpen(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isPro, premiumModalOpen, setPremiumModalOpen])

  // Handle the retry cooldown timer
  useEffect(() => {
    let interval: any
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldown])

  // Switch UI to "Check status" mode after external checkout
  const handleBuySuccess = () => {
    setHasClickedBuy(true)
  }

  // Verification callback for BuyButton
  const handleCheckAndUpgrade = async (): Promise<boolean> => {
    try {
      await upgrade()
      const currentStatus = useSubscribePlanStore.getState().isPro
      return currentStatus
    } catch (e) {
      console.error('Error checking subscription:', e)
      return false
    }
  }

  // Manual status refresh logic
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

  // Map of premium features for the list
  const features = [
    {
      icon: <Folder className="w-5 h-5 text-indigo-400" />,
      text: chrome.i18n.getMessage('app_premium_feature_unlimited'),
    },
    {
      icon: <Globe className="w-5 h-5 text-pink-400" />,
      text: chrome.i18n.getMessage('app_premium_feature_sync'),
    },
    {
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      text: chrome.i18n.getMessage('app_premium_feature_data'),
      subFeatures: [
        chrome.i18n.getMessage('app_premium_feature_data_sub1'),
        chrome.i18n.getMessage('app_premium_feature_data_sub2'),
        chrome.i18n.getMessage('app_premium_feature_data_sub3'),
      ],
    },
    {
      icon: <MousePointer2 className="w-5 h-5 text-purple-400" />,
      text: chrome.i18n.getMessage('app_premium_feature_toolkit'),
      subFeatures: [
        chrome.i18n.getMessage('app_premium_feature_toolkit_sub1'),
        chrome.i18n.getMessage('app_premium_feature_toolkit_sub2'),
        chrome.i18n.getMessage('app_premium_feature_toolkit_sub3'),
        chrome.i18n.getMessage('app_premium_feature_toolkit_sub4'),
      ],
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
      {/* Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setPremiumModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[480px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

        <button
          onClick={() => setPremiumModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 max-h-[95vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              {chrome.i18n.getMessage('app_premium_title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {chrome.i18n.getMessage('app_premium_pro_power')}
              </span>
            </h2>
            <p className="text-zinc-400 text-sm">
              {chrome.i18n.getMessage('app_premium_subtitle')}
            </p>
          </div>

          {/* Features List */}
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

          {/* Footer Actions */}
          <div className="space-y-4">
            {!hasClickedBuy ? (
              <BuyButton
                className={`${buttonBaseStyles} ${activeGradient}`}
                onBuyClick={handleBuySuccess}
                logIn={logIn}
                checkSubscription={handleCheckAndUpgrade}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {chrome.i18n.getMessage('app_premium_btn_upgrade', ['3$'])}
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
                    {chrome.i18n.getMessage('app_premium_btn_checking')}
                  </>
                ) : isPro ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    {chrome.i18n.getMessage('app_premium_btn_success')}
                  </>
                ) : cooldown > 0 ? (
                  <>
                    {/* Injecting raw seconds directly into the template string */}
                    {`${chrome.i18n.getMessage(
                      'app_premium_btn_retry'
                    )} ${String(cooldown)}`}
                  </>
                ) : (
                  <>
                    {chrome.i18n.getMessage('app_premium_btn_check_status')}
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
                ? chrome.i18n.getMessage('app_premium_btn_later')
                : chrome.i18n.getMessage('app_premium_btn_no_thanks')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

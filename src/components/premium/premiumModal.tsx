import { useState, useEffect } from "preact/hooks";
import {
  usePremiumModalStore,
  useSubscribePlanStore,
} from "@/storage/statelibrary";
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
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BuyButton } from "@/components/premium/buyButton";

interface UpgradeToProModalProps {
  upgrade: () => Promise<void> | void;
  logIn: () => void;
}

/**
 * UpgradeToProModal Component
 * Handles the premium upgrade UI and subscription status verification.
 */
export default function UpgradeToProModal({
  upgrade,
  logIn,
}: UpgradeToProModalProps) {
  const { premiumModalOpen, setPremiumModalOpen } = usePremiumModalStore();
  const isPro = useSubscribePlanStore((state) => state.isPro);

  // UI States
  const [hasClickedBuy, setHasClickedBuy] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Reset internal states when modal is closed
  useEffect(() => {
    if (!premiumModalOpen) {
      const timer = setTimeout(() => {
        setHasClickedBuy(false);
        setCooldown(0);
        setIsChecking(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [premiumModalOpen]);

  // Automatically close modal if user is detected as Pro
  useEffect(() => {
    if (isPro && premiumModalOpen) {
      const timer = setTimeout(() => setPremiumModalOpen(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isPro, premiumModalOpen, setPremiumModalOpen]);

  // Handle the retry cooldown timer
  useEffect(() => {
    let interval: any;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Switch UI to "Check status" mode after external checkout
  const handleBuySuccess = () => {
    setHasClickedBuy(true);
  };

  // Verification callback for BuyButton
  const handleCheckAndUpgrade = async (): Promise<boolean> => {
    try {
      await upgrade();
      const currentStatus = useSubscribePlanStore.getState().isPro;
      return currentStatus;
    } catch (e) {
      console.error("Error checking subscription:", e);
      return false;
    }
  };

  // Manual status refresh logic
  const handleCheckStatus = async () => {
    if (cooldown > 0 || isChecking) return;
    setIsChecking(true);
    try {
      await upgrade();
    } catch (err) {
      console.error("Check status error:", err);
    } finally {
      setIsChecking(false);
      setCooldown(5);
    }
  };

  if (!premiumModalOpen) return null;

  // Map of premium features for the list
  const features = [
    {
      icon: <Folder className="w-5 h-5 text-indigo-400" />,
      text: chrome.i18n.getMessage("app_premium_feature_unlimited"),
    },
    {
      icon: <Globe className="w-5 h-5 text-pink-400" />,
      text: chrome.i18n.getMessage("app_premium_feature_sync"),
    },
    {
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      text: chrome.i18n.getMessage("app_premium_feature_data"),
      subFeatures: [
        chrome.i18n.getMessage("app_premium_feature_data_sub1"),
        chrome.i18n.getMessage("app_premium_feature_data_sub3"),
        chrome.i18n.getMessage("app_premium_feature_data_sub4"),
      ],
    },
    {
      icon: <MousePointer2 className="w-5 h-5 text-purple-400" />,
      text: chrome.i18n.getMessage("app_premium_feature_toolkit"),
      subFeatures: [
        chrome.i18n.getMessage("app_premium_feature_toolkit_sub1"),
        chrome.i18n.getMessage("app_premium_feature_toolkit_sub2"),
        chrome.i18n.getMessage("app_premium_feature_toolkit_sub3"),
      ],
    },
  ];

  return (
    <AnimatePresence>
      <div className="ds-section ds-section-marker h-full">
        <div className="fixed inset-0 bg-[var(--ds-bg)] backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            onClick={() => setPremiumModalOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="ds-tpl-login"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 text-indigo-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

            <div className="ds-login-card relative max-h-[95vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setPremiumModalOpen(false)}
                className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label={chrome.i18n.getMessage("app_premium_btn_no_thanks")}
              >
                <X size={18} />
              </button>

              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  <Zap size={16} className="text-indigo-400" />
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_premium_title")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {chrome.i18n.getMessage("app_premium_pro_power")}
                  </span>
                </h2>
                <p className="ds-login-sub">
                  {chrome.i18n.getMessage("app_premium_subtitle")}
                </p>
              </div>

              {/* Features list — kept as-is, no ds equivalent for a bulleted
                  feature card grid */}
              <div className="w-full space-y-4 mb-2">
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
              <div className="w-full flex flex-col items-center justify-center space-y-3">
                {!hasClickedBuy ? (
                  <BuyButton
                    className="btn btn--primary"
                    onBuyClick={handleBuySuccess}
                    logIn={logIn}
                    checkSubscription={handleCheckAndUpgrade}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {chrome.i18n.getMessage("app_premium_btn_upgrade", [
                        "3$",
                      ])}
                      <Zap className="w-4 h-4 fill-white/50" />
                    </span>
                  </BuyButton>
                ) : (
                  <button
                    onClick={handleCheckStatus}
                    disabled={cooldown > 0 || isChecking || isPro}
                    className="btn btn--primary"
                  >
                    {isChecking ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {chrome.i18n.getMessage("app_premium_btn_checking")}
                      </span>
                    ) : isPro ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        {chrome.i18n.getMessage("app_premium_btn_success")}
                      </span>
                    ) : cooldown > 0 ? (
                      <span>
                        {`${chrome.i18n.getMessage(
                          "app_premium_btn_retry",
                        )} ${String(cooldown)}`}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {chrome.i18n.getMessage("app_premium_btn_check_status")}
                        <Zap className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                )}

                <p
                  onClick={() => setPremiumModalOpen(false)}
                  className="ds-text-tertiary text-center cursor-pointer hover:text-white transition-colors"
                >
                  {hasClickedBuy
                    ? chrome.i18n.getMessage("app_premium_btn_later")
                    : chrome.i18n.getMessage("app_premium_btn_no_thanks")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

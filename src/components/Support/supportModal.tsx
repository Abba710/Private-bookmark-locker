import qrCode from "@/assets/qr-code.png";
import { useSupportDialogStore } from "@/storage/statelibrary";
import { X, Heart, Coffee, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * SupportDialog Component
 * Style: Modern Dark SaaS / Donation UI
 * Description: Clean, trustworthy modal for developer support and donations.
 */

export default function SupportDialog() {
  const supportOpen = useSupportDialogStore((state) => state.supportOpen);
  const setSupportOpen = useSupportDialogStore((state) => state.setSupportOpen);

  if (!supportOpen) return null;

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
            onClick={() => setSupportOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="ds-tpl-login"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 text-pink-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

            <div className="ds-login-card relative">
              <button
                onClick={() => setSupportOpen(false)}
                className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label={chrome.i18n.getMessage("app_donate_close")}
              >
                <X size={18} />
              </button>

              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  <Heart size={16} className="text-pink-500 fill-pink-500/10" />
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_donate_qr")}
                </h2>
                <p className="ds-login-sub">
                  {chrome.i18n.getMessage("app_donate_h2_title")}
                </p>
              </div>

              {/* QR Code Section - kept high-contrast white card, no ds equivalent for this */}
              <div className="flex justify-center">
                <div className="relative w-[200px] group mb-2 p-4 bg-white rounded-[24px] shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src={qrCode}
                    className="w-[160px] h-[160px] rounded-lg"
                    alt="Donation QR code"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-pink-500 p-2 rounded-xl shadow-lg border-2 border-[#0f0f11]">
                    <Share2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full mb-2">
                <div className="h-px bg-white/5 flex-grow" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  {chrome.i18n.getMessage("app_donate_or")}
                </span>
                <div className="h-px bg-white/5 flex-grow" />
              </div>

              <button
                onClick={() => {
                  window.open("https://buymeacoffee.com/abba710", "_blank");
                  setSupportOpen(false);
                }}
                className="btn btn--primary mt-2"
              >
                <span className="flex items-center justify-center gap-2">
                  <Coffee size={16} className="fill-black/10" />
                  {chrome.i18n.getMessage("app_donate_coffee")}
                  <ExternalLink size={16} className="opacity-50" />
                </span>
              </button>

              <p
                onClick={() => setSupportOpen(false)}
                className="ds-text-tertiary text-center cursor-pointer hover:text-white transition-colors mt-2"
              >
                {chrome.i18n.getMessage("app_donate_close")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

// Minimal Share2 icon for the QR corner
function Share2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-10.628a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186zm0 12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  );
}

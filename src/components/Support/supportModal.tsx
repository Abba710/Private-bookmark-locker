import qrCode from '@/assets/qr-code.png'
import { useSupportDialogStore } from '@/storage/statelibrary'
import { X, Heart, Coffee, ExternalLink } from 'lucide-react'

/**
 * SupportDialog Component
 * Style: Modern Dark SaaS / Donation UI
 * Description: Clean, trustworthy modal for developer support and donations.
 */

export default function SupportDialog() {
  const supportOpen = useSupportDialogStore((state) => state.supportOpen)
  const setSupportOpen = useSupportDialogStore((state) => state.setSupportOpen)

  if (!supportOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with standard blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setSupportOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[420px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Decorative Glow (Pink/Indigo mix for "Support" feel) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-pink-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setSupportOpen(false)}
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 flex flex-col items-center">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-8 pt-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-5 shadow-inner ring-1 ring-white/5">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500/10" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              {chrome.i18n.getMessage('app_donate_h2_title')}
            </h2>
            <p className="text-zinc-500 text-sm font-medium px-4 leading-relaxed">
              {chrome.i18n.getMessage('app_donate_qr')}
            </p>
          </div>

          {/* QR Code Section - High contrast for scannability */}
          <div className="relative group mb-6 p-4 bg-white rounded-[24px] shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={qrCode}
              className="w-[160px] h-[160px] rounded-lg"
              alt="Donation QR code"
            />
            {/* Corner decoration */}
            <div className="absolute -bottom-2 -right-2 bg-pink-500 p-2 rounded-xl shadow-lg border-2 border-[#0f0f11]">
              <Share2 className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full mb-6">
            <div className="h-px bg-white/5 flex-grow" />
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              {chrome.i18n.getMessage('app_donate_or')}
            </span>
            <div className="h-px bg-white/5 flex-grow" />
          </div>

          {/* External Support Button */}
          <button
            onClick={() => {
              window.open('https://buymeacoffee.com/abba710', '_blank')
              setSupportOpen(false)
            }}
            className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl bg-[#FFDD00] text-black font-bold shadow-lg hover:shadow-[#FFDD00]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Coffee className="w-5 h-5 fill-black/10" />
            <span className="text-sm">Buy me a coffee</span>
            <ExternalLink className="w-4 h-4 opacity-50" />
          </button>

          {/* Secondary Close Action */}
          <button
            onClick={() => setSupportOpen(false)}
            className="mt-6 text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
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
  )
}

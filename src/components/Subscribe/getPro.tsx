import { Sparkles, ChevronRight } from 'lucide-react'

/**
 * GetProButton Component
 * A high-conversion CTA button designed to encourage users to upgrade.
 */

interface GetProButtonProps {
  onClick: () => void
}

export default function GetProButton({ onClick }: GetProButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center justify-between w-full px-4 py-3 
        bg-gradient-to-r from-indigo-600 to-violet-600
        border border-white/20 rounded-xl
        hover:from-indigo-500 hover:to-violet-500
        active:scale-[0.98]
        transition-all duration-200 group overflow-hidden
        shadow-lg shadow-indigo-500/20
        cursor-pointer
      `}
    >
      {/* Animated shimmer overlay for visual attention */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />

      <div className="relative flex items-center gap-3">
        {/* Icon wrapper with hover scaling */}
        <div className="p-2 rounded-lg bg-white/20 text-white group-hover:scale-110 transition-transform">
          <Sparkles size={18} fill="currentColor" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white">
            {chrome.i18n.getMessage('app_btn_get_pro_title')}
          </p>
          <p className="text-xs text-indigo-100/80">
            {chrome.i18n.getMessage('app_btn_get_pro_subtitle')}
          </p>
        </div>
      </div>

      <div className="relative">
        <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  )
}

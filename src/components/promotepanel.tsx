import { X, Rocket, ExternalLink, TrendingUp } from 'lucide-react'
import { usePromoteStore } from '@/storage/statelibrary'

export default function PhDialog() {
  const promoteOpen = usePromoteStore((state) => state.promoteOpen)
  const setPromoteOpen = usePromoteStore((state) => state.setPromoteOpen)

  if (!promoteOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setPromoteOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Close */}
        <button
          onClick={() => setPromoteOpen(false)}
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 flex flex-col items-center">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8 pt-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-5 shadow-inner ring-1 ring-white/5">
              <Rocket className="w-8 h-8 text-orange-500" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              {chrome.i18n.getMessage('app_options_PH_Title')}
            </h2>

            <p className="text-zinc-500 text-sm leading-relaxed px-3">
              {chrome.i18n.getMessage('app_options_PH_sub_title')}
              <span className="text-orange-400 font-semibold">
                {' '}
                {chrome.i18n.getMessage(
                  'app_options_PH_sub_title_discount'
                )}{' '}
              </span>
              {chrome.i18n.getMessage('app_options_PH_sub_title_supporter')}
            </p>
          </div>

          {/* Benefits */}
          <div className="w-full bg-[#151517] border border-white/5 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-400" />

              <span className="text-sm text-white font-medium">
                Your support helps:
              </span>
            </div>

            <div className="space-y-3 text-sm text-zinc-400">
              <div>{chrome.i18n.getMessage('app_options_PH_helps1')}</div>
              <div>{chrome.i18n.getMessage('app_options_PH_helps2')}</div>
              <div>{chrome.i18n.getMessage('app_options_PH_helps3')}</div>
              <div>{chrome.i18n.getMessage('app_options_PH_helps4')}</div>
            </div>
          </div>

          {/* Main Button */}
          <button
            onClick={() => {
              window.open(
                'https://www.producthunt.com/products/private-bookmark-locker-beta?utm_source=extension&utm_medium=promote',
                '_blank'
              )

              setPromoteOpen(false)
            }}
            className="group flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl bg-[#FF6154] text-white font-bold shadow-lg hover:shadow-[#FF6154]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Rocket className="w-5 h-5" />

            <span>{chrome.i18n.getMessage('app_options_PH_cta')}</span>

            <ExternalLink className="w-4 h-4 opacity-60" />
          </button>

          {/* Secondary action */}
          <button
            onClick={() => setPromoteOpen(false)}
            className="mt-6 text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
          >
            {chrome.i18n.getMessage('app_options_PH_cta_later')}
          </button>
        </div>
      </div>
    </div>
  )
}

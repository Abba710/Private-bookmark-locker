import { X, Download, AlertCircle } from 'lucide-react'

/**
 * ExportDialog Component
 * Style: Modern Dark SaaS / Premium Look
 * Description: A confirmation dialog for exporting data with visual consistency.
 */

export default function ExportDialog({
  onClose,
  onExport,
}: {
  onClose: () => void
  onExport: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur - standard for our app */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative w-full max-w-[400px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 pt-10 flex flex-col items-center text-center">
          {/* Header Icon - Using Download icon in a premium box */}
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
            <Download className="w-8 h-8 text-indigo-400" />
          </div>

          {/* Modal title */}
          <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
            {chrome.i18n.getMessage('app_modal_export')}
          </h2>

          {/* Export description */}
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 px-2">
            {chrome.i18n.getMessage('app_export_modal_description')}
          </p>

          {/* Info Badge - subtle hint */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[11px] font-medium text-indigo-300/80 mb-8">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{chrome.i18n.getMessage('app_export_format_label')}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onExport}
              className="group relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {chrome.i18n.getMessage('app_export_modal_button')}
                <Download className="w-4 h-4" />
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
            >
              {chrome.i18n.getMessage('app_cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

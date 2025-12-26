import { useContextModalStore } from '@/components/contextMenu/contextMenuStore'
import { QRCodeCanvas } from 'qrcode.react'
import { X, Share2, Globe } from 'lucide-react'

/**
 * QrModalUi Component
 * Style: Modern Dark SaaS / Premium Look
 * Description: Displays a QR code for the selected bookmark with favicon branding.
 */

export default function QrModalUi() {
  const modalOpen = useContextModalStore((state) => state.qrModalOpen)
  const setModalOpen = useContextModalStore((state) => state.setQrModalOpen)
  const bookmark = useContextModalStore((state) => state.bookmark)

  if (!bookmark) return null

  /**
   * Generates favicon URL using Google's S2 service
   * @param url Site URL
   * @returns Favicon URL or null
   */
  const getFaviconUrl = (url?: string) => {
    if (!url) return null
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  /**
   * Extracts clean domain name for display
   * @param url Site URL
   * @returns Cleaned hostname
   */
  const getDomain = (url?: string) => {
    if (!url) return ''
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <>
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[400px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Decorative Top Glow (Consistent with Upgrade Modal) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative p-8 flex flex-col items-center">
              {/* Header with Icon Box */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4 shadow-inner ring-1 ring-white/5 overflow-hidden">
                  {getFaviconUrl(bookmark.url) ? (
                    <img
                      src={getFaviconUrl(bookmark.url)!}
                      alt=""
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Globe className="w-8 h-8 text-indigo-400/50" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-1 truncate max-w-[280px]">
                  {bookmark.title || getDomain(bookmark.url)}
                </h3>
                <p className="text-zinc-500 text-sm font-medium">
                  {getDomain(bookmark.url)}
                </p>
              </div>

              {/* QR Block - High Contrast Container */}
              <div className="relative p-5 bg-white rounded-[24px] shadow-[0_0_30px_rgba(99,102,241,0.15)] mb-8">
                <QRCodeCanvas
                  value={bookmark.url || ''}
                  size={180}
                  level="H" // High error correction
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  includeMargin={false}
                />
              </div>

              {/* Instructions */}
              <div className="flex items-center gap-2 mb-8 text-zinc-400">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <p className="text-xs font-medium">
                  {chrome.i18n.getMessage('app_qr_modal_info')}
                </p>
              </div>

              {/* Footer Actions */}
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-4 rounded-xl bg-white/5 border border-white/5 text-white text-sm font-semibold hover:bg-white/10 hover:border-white/10 transition-all active:scale-[0.98]"
              >
                {chrome.i18n.getMessage('app_qr_close_button')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

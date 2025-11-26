import { useQrModalStore } from '@/components/contextMenu/contextMenuStore'
import { QRCodeCanvas } from 'qrcode.react'

export default function QrModalUi() {
  const modalOpen = useQrModalStore((state) => state.qrModalOpen)
  const setModalOpen = useQrModalStore((state) => state.setQrModalOpen)
  const bookmark = useQrModalStore((state) => state.bookmark)

  if (!bookmark) return null

  const getFaviconUrl = (url?: string) => {
    if (!url) return null
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg w-[420px] p-6 text-white flex flex-col items-center">
            {/* Header with favicon + title */}
            <div className="flex items-center gap-3 mb-5">
              {getFaviconUrl(bookmark.url) && (
                <img
                  src={getFaviconUrl(bookmark.url)!}
                  alt=""
                  className="w-8 h-8 rounded-sm"
                />
              )}

              <div className="flex flex-col">
                <span className="text-base font-semibold leading-tight max-w-[260px] truncate">
                  {bookmark.title || getDomain(bookmark.url)}
                </span>
                <span className="text-white/50 text-xs leading-tight truncate max-w-[260px]">
                  {getDomain(bookmark.url)}
                </span>
              </div>
            </div>

            {/* QR Block */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <QRCodeCanvas value={bookmark.url || ''} size={180} />

              <p className="text-white/60 text-xs text-center max-w-[260px]">
                {chrome.i18n.getMessage('app_qr_modal_info')}
              </p>
            </div>

            {/* Buttons */}
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-sm"
            >
              {chrome.i18n.getMessage('app_close_button')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

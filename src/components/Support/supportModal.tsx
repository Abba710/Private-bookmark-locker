import qrCode from '@/assets/qr-code.png'
import { useSupportDialogStore } from '@/storage/statelibrary'
export default function SupportDialog({}) {
  const supportOpen = useSupportDialogStore((state) => state.supportOpen)
  const setSupportOpen = useSupportDialogStore((state) => state.setSupportOpen)

  return (
    <>
      {supportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg w-[420px] p-6 text-white">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-center leading-snug">
              {chrome.i18n.getMessage('app_donate_h2_title')}
            </h2>

            <div className="flex flex-col items-center gap-3 mb-4">
              <p className="text-white/80 text-base md:text-sm font-medium">
                {chrome.i18n.getMessage('app_donate_qr')}
              </p>

              <img
                src={qrCode}
                className="w-[140px] h-[140px] rounded-lg shadow-lg border border-white/20"
                alt="QR code"
              />

              <div className="text-white/60 text-sm font-medium">
                {chrome.i18n.getMessage('app_donate_or')}
              </div>

              <button
                onClick={() => {
                  window.open('https://buymeacoffee.com/abba710', '_blank')
                  setSupportOpen(false)
                }}
                className="rounded-lg overflow-hidden hover:scale-105 transition-transform shadow-lg cursor-pointer"
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                  alt="Buy Me A Coffee"
                  className="w-[190px] md:w-[180px]"
                />
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSupportOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

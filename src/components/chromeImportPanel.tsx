import { getChromeBookmarks } from '@/features/bookmarks/bookmarkService'
import { X, Download, ChevronRight, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ImportBookmarksDialog() {
  const [importOpen, setImportOpen] = useState(false)
  useEffect(() => {
    chrome.storage.local.get('showImportChromeBookmarks', (result) => {
      if (result.showImportChromeBookmarks === true) {
        setImportOpen(true)
        chrome.storage.local.set({ showImportChromeBookmarks: false })
      }
    })
  }, [])

  if (!importOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setImportOpen(false)}
      />

      <div className="relative w-full max-w-[420px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

        <button
          onClick={() => setImportOpen(false)}
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 flex flex-col items-center">
          <div className="flex flex-col items-center text-center mb-8 pt-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-5 shadow-inner ring-1 ring-white/5">
              <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                <circle cx="16" cy="16" r="8" fill="#4285f4" />
                <path d="M16 8 A8 8 0 0 1 22.93 12 L16 12 Z" fill="#ea4335" />
                <path
                  d="M22.93 12 A8 8 0 0 1 22.93 20 L18.5 16 Z"
                  fill="#34a853"
                />
                <path
                  d="M22.93 20 A8 8 0 0 1 9.07 20 L16 20 Z"
                  fill="#fbbc05"
                />
                <path
                  d="M9.07 20 A8 8 0 0 1 9.07 12 L13.5 16 Z"
                  fill="#4285f4"
                />
                <circle cx="16" cy="16" r="4" fill="white" />
                <circle cx="16" cy="16" r="2.8" fill="#4285f4" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              {chrome.i18n.getMessage('app_import_chrome')}
            </h2>
          </div>

          <div className="w-full bg-[#151517] border border-white/5 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-white font-medium">
                {chrome.i18n.getMessage('app_import_chrome_sub_title')}
              </span>
            </div>
            <div className="space-y-3 text-sm text-zinc-400">
              <div>{chrome.i18n.getMessage('app_import_chrome_a1')}</div>
              <div>{chrome.i18n.getMessage('app_import_chrome_a2')}</div>
              <div>{chrome.i18n.getMessage('app_import_chrome_a3')}</div>
              <div>{chrome.i18n.getMessage('app_import_chrome_a4')}</div>
            </div>
          </div>

          <button
            onClick={() => {
              getChromeBookmarks()
              setImportOpen(false)
            }}
            className="group cursor-pointer flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            <span>{chrome.i18n.getMessage('app_import_chrome_CTA')}</span>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </button>

          <button
            onClick={() => setImportOpen(false)}
            className="mt-6 text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
          >
            {chrome.i18n.getMessage('app_import_chrome_later')}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'preact/hooks'
import ImportDialog from '@/components/ImportExport/import'
import ExportDialog from '@/components/ImportExport/export'
import { useBookmarkStore } from '@/storage/statelibrary'
import exportBookmarks from '@/features/importExport/export'
import { getChromeBookmarks } from '@/features/bookmarks/bookmarkService'

export default function OptionsPanel() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)

  return (
    <div>
      {/* ✅ Container same as original */}
      <div className="w-full bg-white/10 rounded-2xl px-1 flex flex-col">
        {/* Import */}
        <button
          className="flex items-center justify-between p-1 text-white/90 text-sm rounded-lg transition hover:bg-white/20 cursor-pointer w-full"
          onClick={() => setShowImport(true)}
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_options_import')}</span>
          </div>
        </button>

        {/* Export */}
        <button
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full"
          onClick={() => setShowExport(true)}
        >
          <div className="flex items-center">
            <span>{chrome.i18n.getMessage('app_options_export')}</span>
          </div>
        </button>

        {/* Settings */}
        <button
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
          onClick={() => {
            alert(`${chrome.i18n.getMessage('app_options_settings_alert')}`)
          }}
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_options_settings')}</span>
          </div>
        </button>

        {/* Collect */}
        <button
          onClick={() => getChromeBookmarks()}
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_options_collect')}</span>
          </div>
        </button>
        <a
          href="https://buymeacoffee.com/Abba710"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_donate_title')}</span>
          </div>
        </a>
      </div>

      {/* ✅ Import/Export Modals */}
      {showImport && <ImportDialog onClose={() => setShowImport(false)} />}
      {showExport && (
        <ExportDialog
          onClose={() => setShowExport(false)}
          onExport={() => {
            exportBookmarks(bookmarks)
            setShowExport(false)
          }}
        />
      )}
    </div>
  )
}

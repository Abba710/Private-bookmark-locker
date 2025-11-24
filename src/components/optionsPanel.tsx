import { useState } from 'preact/hooks'
import ImportDialog from '@/components/ImportExport/import'
import ExportDialog from '@/components/ImportExport/export'
import {
  useBookmarkStore,
  useSupportDialogStore,
  useNotificationDialogStore,
} from '@/storage/statelibrary'
import exportBookmarks from '@/features/importExport/export'
import {
  getChromeBookmarks,
  saveAllOpenTabs,
} from '@/features/bookmarks/bookmarkService'
import { share } from '@/features/options/share'
export default function OptionsPanel() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const setSupportOpen = useSupportDialogStore((state) => state.setSupportOpen)
  const setNotificationOpen = useNotificationDialogStore(
    (state) => state.setNotificationOpen
  )
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)

  return (
    <div className="w-full flex flex-col gap-2">
      {/* ✅ Features block */}
      <div className="w-full bg-white/10 rounded-2xl px-1 flex flex-col">
        {/* Import */}
        <button
          className="flex items-center justify-between p-1 text-white/90 text-sm rounded-lg transition hover:bg-white/20 cursor-pointer w-full"
          onClick={() => setShowImport(true)}
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_import_modal')}</span>
          </div>
        </button>

        {/* Export */}
        <button
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full"
          onClick={() => setShowExport(true)}
        >
          <div className="flex items-center">
            <span>{chrome.i18n.getMessage('app_modal_export')}</span>
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

        {/* Save all open tabs */}
        <button
          onClick={() => saveAllOpenTabs()}
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_options_save_open')}</span>
          </div>
        </button>
      </div>

      {/* Community block */}
      <div className="w-full bg-white/10 rounded-2xl px-1 flex flex-col">
        {/* Changelog */}
        <button
          onClick={() => setNotificationOpen(true)}
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_changelog')}</span>
          </div>
        </button>
        {/* Reddit community */}
        <a
          href="https://www.reddit.com/user/Sad-Bed-3125/submitted/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
          title="Join our Reddit community for news, tips & feedback"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_community')}</span>
          </div>
        </a>
        {/* Rate extension */}
        <a
          href="https://chromewebstore.google.com/detail/%D1%81%D0%B5%D0%B9%D1%84-%D0%B7%D0%B0%D0%BA%D0%BB%D0%B0%D0%B4%D0%BE%D0%BA/fagjclghcmnfinjdkdnkejodfjgkpljd/reviews?utm_source=item-share-cb"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_rate_extension')}</span>
          </div>
        </a>
        {/* Share extension */}
        <button
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full"
          onClick={() => share()}
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_share_extension')}</span>
          </div>
        </button>
        {/* Donate */}
        <button
          onClick={() => setSupportOpen(true)}
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_donate_title')}</span>
          </div>
        </button>
        {/* Report a bug */}
        <a
          href="https://github.com/Abba710/Private-bookmark-locker/issues"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full "
        >
          <div className="flex items-center gap-2">
            <span>{chrome.i18n.getMessage('app_report_bug')}</span>
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

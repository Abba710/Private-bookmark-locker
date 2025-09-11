export default function ExportDialog({
  onClose,
  onExport,
}: {
  onClose: () => void
  onExport: () => void
}) {
  return (
    // Overlay background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal container */}
      <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg w-[400px] p-6 text-white">
        {/* Modal title */}
        <h2 className="text-lg font-semibold mb-4">
          {chrome.i18n.getMessage('app_modal_export')}
        </h2>

        {/* Export description */}
        <p className="text-sm text-white/70 mb-4">
          {chrome.i18n.getMessage('app_export_modal_description')}
        </p>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            {chrome.i18n.getMessage('app_cancel')}
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
          >
            {chrome.i18n.getMessage('app_export_modal_button')}
          </button>
        </div>
      </div>
    </div>
  )
}

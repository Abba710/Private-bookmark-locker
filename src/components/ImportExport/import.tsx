import { handleFileImport } from '@/features/importExport/import'
import { useDroppable } from '@dnd-kit/core'
import { useState } from 'preact/hooks'
import { X, UploadCloud, FileJson } from 'lucide-react'

/**
 * ImportDialog Component
 * Style: Modern Dark SaaS / Premium Look
 * Features: Interactive dropzone with glassmorphism and indigo accents.
 */

export default function ImportDialog({ onClose }: { onClose: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'import-dropzone' })
  const [dragActive, setDragActive] = useState(false)

  // Handle drag events for visual feedback
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileImport(file, onClose)
    }
  }

  const triggerFileInput = () => {
    const input = document.getElementById('importFileInput') as HTMLInputElement
    if (input) input.click()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative w-full max-w-[420px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              {chrome.i18n.getMessage('app_import_modal')}
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              {chrome.i18n.getMessage('app_import_supported_format')}
            </p>
          </div>

          {/* Interactive Dropzone */}
          <div
            ref={setNodeRef}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative w-full group flex flex-col items-center justify-center border-2 border-dashed rounded-[24px] p-10 transition-all duration-300
              ${
                dragActive || isOver
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
              }
            `}
          >
            {/* Pulsing Icon when dragging */}
            <div
              className={`
              mb-4 p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-inner transition-transform duration-300
              ${dragActive || isOver ? 'scale-110' : 'group-hover:scale-105'}
            `}
            >
              <UploadCloud
                className={`w-10 h-10 ${
                  dragActive || isOver ? 'text-indigo-400' : 'text-zinc-500'
                }`}
              />
            </div>

            <p className="text-zinc-300 text-sm font-semibold mb-1 text-center">
              {chrome.i18n.getMessage('app_import_modal_description')}
            </p>
            <p className="text-zinc-500 text-xs font-medium">
              {chrome.i18n.getMessage('app_import_click_browse')}
            </p>

            {/* Hidden Input */}
            <input
              id="importFileInput"
              type="file"
              className="hidden"
              accept=".json"
              aria-label="Select JSON file"
              onChange={(e) => {
                const input = e.target as HTMLInputElement | null
                if (input?.files && input.files[0]) {
                  handleFileImport(input.files[0], onClose)
                }
              }}
            />
          </div>

          {/* Footer Info & Action */}
          <div className="w-full mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
              <FileJson className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-zinc-300 font-semibold leading-tight">
                  {chrome.i18n.getMessage('app_import_config_file_label')}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium leading-tight">
                  {chrome.i18n.getMessage('app_import_standard_json')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
            >
              {chrome.i18n.getMessage('app_cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { handleFileImport } from "@/features/importExport/import";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "preact/hooks";
import { X, UploadCloud, FileJson } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * ImportDialog Component
 * Style: Modern Dark SaaS / Premium Look
 * Features: Interactive dropzone with glassmorphism and indigo accents.
 */

export default function ImportDialog({ onClose }: { onClose: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: "import-dropzone" });
  const [dragActive, setDragActive] = useState(false);

  // Handle drag events for visual feedback
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileImport(file, onClose);
    }
  };

  const triggerFileInput = () => {
    const input = document.getElementById(
      "importFileInput",
    ) as HTMLInputElement;
    if (input) input.click();
  };

  return (
    <AnimatePresence>
      <div className="ds-section ds-section-marker h-full">
        <div className="fixed inset-0 bg-[var(--ds-bg)] backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="ds-tpl-login"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 text-indigo-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

            <div className="ds-login-card relative">
              <button
                onClick={onClose}
                className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label={chrome.i18n.getMessage("app_cancel")}
              >
                <X size={18} />
              </button>

              {/* No icon box here — the original header had none, dropzone
                  icon carries that role instead */}
              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_import_modal")}
                </h2>
                <p className="ds-login-sub">
                  {chrome.i18n.getMessage("app_import_supported_format")}
                </p>
              </div>

              {/* Interactive dropzone — kept as-is, no ds equivalent for a
                  drag-and-drop target */}
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
                      ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                  }
                `}
              >
                <div
                  className={`
                  mb-4 p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-inner transition-transform duration-300
                  ${dragActive || isOver ? "scale-110" : "group-hover:scale-105"}
                `}
                >
                  <UploadCloud
                    className={`w-10 h-10 ${
                      dragActive || isOver ? "text-indigo-400" : "text-zinc-500"
                    }`}
                  />
                </div>

                <p className="text-zinc-300 text-sm font-semibold mb-1 text-center">
                  {chrome.i18n.getMessage("app_import_modal_description")}
                </p>
                <p className="text-zinc-500 text-xs font-medium">
                  {chrome.i18n.getMessage("app_import_click_browse")}
                </p>

                <input
                  id="importFileInput"
                  type="file"
                  className="hidden"
                  accept=".json"
                  aria-label="Select JSON file"
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement | null;
                    if (input?.files && input.files[0]) {
                      handleFileImport(input.files[0], onClose);
                    }
                  }}
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-white/[0.03] border border-white/5">
                <FileJson className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-300 font-semibold leading-tight">
                    {chrome.i18n.getMessage("app_import_config_file_label")}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium leading-tight">
                    {chrome.i18n.getMessage("app_import_standard_json")}
                  </span>
                </div>
              </div>

              <p
                onClick={onClose}
                className="ds-text-tertiary text-center cursor-pointer hover:text-white transition-colors mt-2"
              >
                {chrome.i18n.getMessage("app_cancel")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

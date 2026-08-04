import { X, Download, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * ExportDialog Component
 * Style: Modern Dark SaaS / Premium Look
 * Description: A confirmation dialog for exporting data with visual consistency.
 */
export default function ExportDialog({
  onClose,
  onExport,
}: {
  onClose: () => void;
  onExport: () => void;
}) {
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

              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  <Download size={16} className="text-indigo-400" />
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_modal_export")}
                </h2>
                <p className="ds-login-sub">
                  {chrome.i18n.getMessage("app_export_modal_description")}
                </p>
              </div>

              {/* Info badge — kept as-is, no ds equivalent for an inline hint pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[11px] font-medium text-indigo-300/80 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{chrome.i18n.getMessage("app_export_format_label")}</span>
              </div>

              <button onClick={onExport} className="btn btn--primary mt-2">
                <span className="flex items-center justify-center gap-2">
                  {chrome.i18n.getMessage("app_export_modal_button")}
                  <Download size={16} />
                </span>
              </button>

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

import { getChromeBookmarks } from "@/features/bookmarks/bookmarkService";
import { X, Download, ChevronRight, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function ImportBookmarksDialog() {
  const [importOpen, setImportOpen] = useState(false);
  useEffect(() => {
    chrome.storage.local.get("showImportChromeBookmarks", (result) => {
      if (result.showImportChromeBookmarks === true) {
        setImportOpen(true);
        chrome.storage.local.set({ showImportChromeBookmarks: false });
      }
    });
  }, []);

  if (!importOpen) return null;

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
            onClick={() => setImportOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="ds-tpl-login"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 text-blue-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

            <div className="ds-login-card relative">
              <button
                onClick={() => setImportOpen(false)}
                className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label={chrome.i18n.getMessage("app_import_chrome_later")}
              >
                <X size={18} />
              </button>

              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  {/* brand mark keeps its real colors — a Google "G" wheel
                      reads as generic/wrong if forced to the accent color */}
                  <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none">
                    <circle cx="16" cy="16" r="8" fill="#4285f4" />
                    <path
                      d="M16 8 A8 8 0 0 1 22.93 12 L16 12 Z"
                      fill="#ea4335"
                    />
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
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_import_chrome_title")}
                </h2>
              </div>

              <div className="w-full bg-[#151517] border border-white/5 rounded-2xl p-5 mb-2">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white font-medium">
                    {chrome.i18n.getMessage("app_import_chrome_sub_title")}
                  </span>
                </div>
                <div className="space-y-3 text-sm text-zinc-400">
                  <div>{chrome.i18n.getMessage("app_import_chrome_a1")}</div>
                  <div>{chrome.i18n.getMessage("app_import_chrome_a2")}</div>
                  <div>{chrome.i18n.getMessage("app_import_chrome_a3")}</div>
                  <div>{chrome.i18n.getMessage("app_import_chrome_a4")}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  getChromeBookmarks();
                  setImportOpen(false);
                }}
                className="btn btn--primary mt-4"
              >
                <span className="flex items-center justify-center gap-2">
                  <Download size={16} />
                  {chrome.i18n.getMessage("app_import_chrome_CTA")}
                  <ChevronRight size={16} className="opacity-60" />
                </span>
              </button>

              <p
                onClick={() => setImportOpen(false)}
                className="ds-text-tertiary text-center cursor-pointer hover:text-white transition-colors mt-2"
              >
                {chrome.i18n.getMessage("app_import_chrome_later")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

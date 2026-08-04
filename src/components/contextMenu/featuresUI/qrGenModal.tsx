import { useContextModalStore } from "@/components/contextMenu/contextMenuStore";
import { QRCodeCanvas } from "qrcode.react";
import { X, Share2, Globe } from "lucide-react";
import { motion } from "motion/react";

export default function QrModalUi() {
  const modalOpen = useContextModalStore((state) => state.qrModalOpen);
  const setModalOpen = useContextModalStore((state) => state.setQrModalOpen);
  const bookmark = useContextModalStore((state) => state.bookmark);

  if (!bookmark) return null;
  if (!modalOpen) return null;

  /**
   * Generates favicon URL using Google's S2 service
   * @param url Site URL
   * @returns Favicon URL or null
   */
  const getFaviconUrl = (url?: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  /**
   * Extracts clean domain name for display
   * @param url Site URL
   * @returns Cleaned hostname
   */
  const getDomain = (url?: string) => {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="ds-section ds-section-marker h-full">
      <div className="fixed inset-0 bg-[var(--ds-bg)] backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="absolute inset-0"
          onClick={() => setModalOpen(false)}
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
              onClick={() => setModalOpen(false)}
              className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              aria-label={chrome.i18n.getMessage("app_qr_close_button")}
            >
              <X size={18} />
            </button>

            <div className="ds-login-logo overflow-hidden">
              <span className="ds-login-logo-mark">
                {getFaviconUrl(bookmark.url) ? (
                  <img
                    src={getFaviconUrl(bookmark.url)!}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <Globe size={16} className="text-indigo-400/50" />
                )}
              </span>
            </div>

            <div className="ds-login-header">
              <h2 className="ds-login-title truncate max-w-[280px] mx-auto">
                {bookmark.title || getDomain(bookmark.url)}
              </h2>
              <p className="ds-login-sub">{getDomain(bookmark.url)}</p>
            </div>

            {/* QR Block — high-contrast white container, no ds equivalent */}
            <div className="flex justify-center">
              <div className="flex items-center w-[225px] justify-center p-5 bg-white rounded-[24px] shadow-[0_0_30px_rgba(99,102,241,0.15)] mb-2">
                <QRCodeCanvas
                  value={bookmark.url || ""}
                  size={180}
                  level="H" // High error correction
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <p className="text-xs font-medium">
                {chrome.i18n.getMessage("app_qr_modal_info")}
              </p>
            </div>

            <button onClick={() => setModalOpen(false)} className="btn">
              {chrome.i18n.getMessage("app_qr_close_button")}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

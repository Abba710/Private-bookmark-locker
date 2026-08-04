import { useState } from "preact/hooks";
import { Trash2, LogOut, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface DeleteAllBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void> | void; // Delete + Logout
  onConfirmLogoutOnly: () => Promise<void> | void; // Logout only
}

/**
 * DeleteAllBookmarksModal Component
 * Provides options for signing out with or without local data deletion.
 */
export default function DeleteAllBookmarksModal({
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirmLogoutOnly,
}: DeleteAllBookmarksModalProps) {
  const [loadingType, setLoadingType] = useState<"delete" | "logout" | null>(
    null,
  );

  /**
   * Handles the selected sign-out action
   * @param type Action type: 'delete' for full cleanup, 'logout' for session end only
   */
  const handleAction = async (type: "delete" | "logout") => {
    setLoadingType(type);
    try {
      if (type === "delete") await onConfirmDelete();
      else await onConfirmLogoutOnly();
      onClose();
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setLoadingType(null);
    }
  };

  if (!isOpen) return null;

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
              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  <LogOut size={16} className="text-indigo-400" />
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_signout_title")}
                </h2>
                <p className="ds-login-sub">
                  {chrome.i18n.getMessage("app_signout_description")}
                </p>
              </div>

              <div className="w-full space-y-3">
                {/* OPTION 1: Logout only */}
                <button
                  onClick={() => handleAction("logout")}
                  disabled={!!loadingType}
                  className="btn btn--outline"
                >
                  {loadingType === "logout" ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <LogOut size={16} />
                      {chrome.i18n.getMessage("app_signout_keep_data")}
                    </span>
                  )}
                </button>

                {/* OPTION 2: Delete everything */}
                <button
                  onClick={() => handleAction("delete")}
                  disabled={!!loadingType}
                  className="btn btn--danger"
                >
                  {loadingType === "delete" ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Trash2 size={16} />
                      {chrome.i18n.getMessage("app_signout_delete_all")}
                    </span>
                  )}
                </button>

                <div className="py-1 flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
                    {chrome.i18n.getMessage("app_signout_or")}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>

                {/* OPTION 3: Cancel */}
                <p
                  onClick={() => !loadingType && onClose()}
                  className="btn btn--primary"
                >
                  {chrome.i18n.getMessage("app_signout_stay")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

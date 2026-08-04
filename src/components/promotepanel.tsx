import { X, Rocket, ExternalLink, TrendingUp } from "lucide-react";
import { usePromoteStore } from "@/storage/statelibrary";
import { AnimatePresence, motion } from "motion/react";

export default function PhDialog() {
  const promoteOpen = usePromoteStore((state) => state.promoteOpen);
  const setPromoteOpen = usePromoteStore((state) => state.setPromoteOpen);

  if (!promoteOpen) return null;

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
            onClick={() => setPromoteOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="ds-tpl-login"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 text-orange-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

            <div className="ds-login-card relative">
              <button
                onClick={() => setPromoteOpen(false)}
                className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label={chrome.i18n.getMessage("app_options_PH_cta_later")}
              >
                <X size={18} />
              </button>

              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  <Rocket size={16} className="text-orange-400" />
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_options_PH_Title")}
                </h2>
                <p className="ds-login-sub">
                  {chrome.i18n.getMessage("app_options_PH_sub_title")}
                  <span className="text-orange-400 font-semibold">
                    {" "}
                    {chrome.i18n.getMessage(
                      "app_options_PH_sub_title_discount",
                    )}{" "}
                  </span>
                  {chrome.i18n.getMessage("app_options_PH_helps_title")}
                </p>
              </div>

              <div className="w-full bg-[#151517] border border-white/5 rounded-2xl p-5 mb-2">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-white font-medium">
                    {chrome.i18n.getMessage(
                      "app_options_PH_sub_title_supporter",
                    )}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-zinc-400">
                  <div>{chrome.i18n.getMessage("app_options_PH_helps1")}</div>
                  <div>{chrome.i18n.getMessage("app_options_PH_helps2")}</div>
                  <div>{chrome.i18n.getMessage("app_options_PH_helps3")}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  window.open(
                    "https://www.producthunt.com/products/private-bookmark-locker-beta?utm_source=extension&utm_medium=promote",
                    "_blank",
                  );
                  setPromoteOpen(false);
                }}
                className="btn btn--primary mt-4"
              >
                <span className="flex items-center justify-center gap-2">
                  <Rocket size={16} />
                  {chrome.i18n.getMessage("app_options_PH_cta")}
                  <ExternalLink size={16} className="opacity-60" />
                </span>
              </button>

              <p
                onClick={() => setPromoteOpen(false)}
                className="ds-text-tertiary text-center cursor-pointer hover:text-white transition-colors mt-2"
              >
                {chrome.i18n.getMessage("app_options_PH_cta_later")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

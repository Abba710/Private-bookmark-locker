import { useLockOverlayStore } from "@/storage/statelibrary";
import {
  getLockStatus,
  handleSubmitPassword,
} from "@/features/lock/lockservice";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "preact/hooks";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";

/**
 * LockOverlay Component
 * Style: matches WelcomePage / InstructionModal — dark card, subtle glass border,
 * accent glow behind the icon, restrained spring transitions.
 */

const COPY = {
  setup: {
    icon: ShieldCheck,
    title: chrome.i18n.getMessage("app_create_password"),
    description: chrome.i18n.getMessage("app_lock_setup_description"),
    placeholder: chrome.i18n.getMessage("app_create_password_placeholder"),
    button: chrome.i18n.getMessage("app_create_password_button"),
  },
  unlock: {
    title: chrome.i18n.getMessage("app_enter_password"),
    description: chrome.i18n.getMessage("app_lock_unlock_description"),
    placeholder: chrome.i18n.getMessage("app_enter_password_placeholder"),
    button: chrome.i18n.getMessage("app_unlock"),
  },
} as const;

export default function LockOverlay() {
  const mode = useLockOverlayStore((state) => state.mode);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const t = COPY[mode === "setup" ? "setup" : "unlock"];

  useEffect(() => {
    (async () => {
      await getLockStatus();
    })();
  }, []);

  const submitPassword = async () => {
    if (!password.trim()) {
      setError(chrome.i18n.getMessage("app_password_empty_error"));
      return;
    }

    try {
      await handleSubmitPassword(password);
      setError("");
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="ds-tpl-login"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-current text-indigo-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

          <div className="ds-login-card">
            <div className="ds-login-logo">
              <span className="ds-login-logo-mark">
                <img src="/images/icon16.png" className={"w-4 h-4"} alt="" />
              </span>{" "}
              Locker
            </div>
            <div className="ds-login-header">
              <h2 className="ds-login-title ds-text-danger">
                {" "}
                {chrome.i18n.getMessage("app_lock_security_notice")}
              </h2>
              <p className="ds-login-sub">
                {chrome.i18n.getMessage("app_password_warning")}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 32,
                mass: 0.7,
              }}
              className="absolute flex items-center justify-center bg-white/[0.03] text-indigo-400"
            >
              <div className="absolute inset-0 rounded-2xl bg-current opacity-[0.12] blur-2xl pointer-events-none" />
            </motion.div>
            <div className="ds-login-header">
              <h2 className="ds-login-title">{t.title}</h2>
              <p className="ds-login-sub">{t.description}</p>
            </div>

            <div className="ds-field">
              <div className="ds-input-wrap">
                <span className="ds-input-icon-left">
                  <Lock size={14} />
                </span>

                <input
                  type="password"
                  autoFocus
                  value={password}
                  onInput={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  onKeyDown={(e) => e.key === "Enter" && submitPassword()}
                  placeholder={t.placeholder}
                  className="ds-input ds-input--has-left"
                />
              </div>
            </div>

            <div
              className={`w-full flex items-center gap-2 overflow-hidden transition-all duration-300 ${
                error ? "h-6 opacity-100 mt-3" : "h-0 opacity-0"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <p className="text-red-400 text-xs font-medium text-left">
                {error}
              </p>
            </div>

            <button onClick={submitPassword} className="btn btn--primary">
              {t.button}
            </button>

            {mode === "setup" && (
              <p className="ds-text-tertiary px-2">
                {chrome.i18n.getMessage("app_lock_legal_agreement")}{" "}
                <a
                  href="https://abbablog.me/projects/locker/terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-link--accent"
                >
                  {chrome.i18n.getMessage("app_lock_terms")}
                </a>{" "}
                {chrome.i18n.getMessage("app_lock_and")}{" "}
                <a
                  href="https://abbablog.me/projects/locker/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-link--accent"
                >
                  {chrome.i18n.getMessage("app_lock_privacy")}
                </a>
                .
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useFeedbackStore } from "@/storage/statelibrary";
import { X, Star, MessageSquareHeart, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Feedback Component
 * Style: Modern Dark SaaS / Rating UI
 * Description: Clean and inviting modal to encourage users to leave a review.
 */

export default function Feedback() {
  const showFeedback = useFeedbackStore((state) => state.showFeedback);
  const setShowFeedback = useFeedbackStore((state) => state.setShowFeedback);

  if (!showFeedback) return null;

  const handleLeaveFeedback = () => {
    chrome.storage.local.set({ feedbackGiven: true });
    setShowFeedback(false);
    chrome.tabs.create({
      url: "https://chromewebstore.google.com/detail/private-bookmark-locker/fagjclghcmnfinjdkdnkejodfjgkpljd/reviews",
    });
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
            onClick={() => setShowFeedback(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="ds-tpl-login"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 text-amber-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

            <div className="ds-login-card relative">
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label={chrome.i18n.getMessage("app_feedback_button_later")}
              >
                <X size={18} />
              </button>

              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  <MessageSquareHeart
                    size={16}
                    className="text-amber-400 fill-amber-400/10"
                  />
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_feedback_title")}
                </h2>
                <p className="ds-login-sub">
                  {chrome.i18n.getMessage("app_feedback_description")}
                </p>
              </div>

              {/* Star rating visual — kept as-is, no ds equivalent for this */}
              <div className="flex gap-1.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>

              <button
                onClick={handleLeaveFeedback}
                className="btn btn--primary mt-2"
              >
                <span className="flex items-center justify-center gap-2">
                  {chrome.i18n.getMessage("app_feedback_button_leave")}
                  <ExternalLink size={16} />
                </span>
              </button>

              <p
                onClick={() => setShowFeedback(false)}
                className="ds-text-tertiary text-center cursor-pointer hover:text-white transition-colors mt-2"
              >
                {chrome.i18n.getMessage("app_feedback_button_later")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

import { useFeedbackStore } from '@/storage/statelibrary'
import { X, Star, MessageSquareHeart, ExternalLink } from 'lucide-react'

/**
 * Feedback Component
 * Style: Modern Dark SaaS / Rating UI
 * Description: Clean and inviting modal to encourage users to leave a review.
 */

export default function Feedback() {
  const showFeedback = useFeedbackStore((state) => state.showFeedback)
  const setShowFeedback = useFeedbackStore((state) => state.setShowFeedback)

  if (!showFeedback) return null

  const handleLeaveFeedback = () => {
    chrome.storage.local.set({ feedbackGiven: true })
    setShowFeedback(false)
    chrome.tabs.create({
      url: 'https://chromewebstore.google.com/detail/private-bookmark-locker/fagjclghcmnfinjdkdnkejodfjgkpljd/reviews',
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with standard blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setShowFeedback(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative Top Glow (Amber/Gold for stars) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setShowFeedback(false)}
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 flex flex-col items-center text-center">
          {/* Header Icon Section */}
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
            <MessageSquareHeart className="w-8 h-8 text-amber-400 fill-amber-400/10" />
          </div>

          {/* Modal title */}
          <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
            {chrome.i18n.getMessage('app_feedback_title')}
          </h2>

          {/* Review description */}
          <p className="text-zinc-400 text-base leading-relaxed mb-8 px-2 font-medium">
            {chrome.i18n.getMessage('app_feedback_description')}
          </p>

          {/* Star Rating Visualization */}
          <div className="flex gap-1.5 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleLeaveFeedback}
              className="group relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-white/30 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {chrome.i18n.getMessage('app_feedback_button_leave')}
                <ExternalLink className="w-4 h-4" />
              </span>
            </button>

            <button
              onClick={() => setShowFeedback(false)}
              className="w-full py-3 text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
            >
              {chrome.i18n.getMessage('app_feedback_button_later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

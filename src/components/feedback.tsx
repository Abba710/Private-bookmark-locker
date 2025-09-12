import { useFeedbackStore } from '@/storage/statelibrary'

export default function Feedback() {
  const showFeedback = useFeedbackStore((state) => state.showFeedback)
  const setShowFeedback = useFeedbackStore((state) => state.setShowFeedback)

  if (!showFeedback) return null
  return (
    // Overlay background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal container */}
      <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg w-[400px] p-6 text-white">
        {/* Modal title */}
        <h2 className="text-xl font-semibold mb-4">
          ⭐ {chrome.i18n.getMessage('app_feedback_title')}
        </h2>

        {/* Review description */}
        <p className="text-lg text-white/70 mb-4">
          {chrome.i18n.getMessage('app_feedback_description')}
        </p>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => {
              chrome.storage.local.set({ feedbackGiven: true })
              setShowFeedback(false)
              chrome.tabs.create({
                url: 'https://chromewebstore.google.com/detail/private-bookmark-locker/fagjclghcmnfinjdkdnkejodfjgkpljd/reviews',
              })
            }}
            className="px-4 text-lg py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
          >
            {chrome.i18n.getMessage('app_feedback_button_leave')}
          </button>
          <button
            onClick={() => {
              setShowFeedback(false)
            }}
            className="px-4 text-lg py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            {chrome.i18n.getMessage('app_feedback_button_later')}
          </button>
        </div>
      </div>
    </div>
  )
}

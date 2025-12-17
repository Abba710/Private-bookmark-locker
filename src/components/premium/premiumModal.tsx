import { usePremiumModalStore } from '@/storage/statelibrary'
import type { plan } from '@/types/types'

interface UpgradeToProModalProps {
  upgrade: (newPlan: plan) => void
}

export default function UpgradeToProModal({ upgrade }: UpgradeToProModalProps) {
  const { premiumModalOpen, setPremiumModalOpen } = usePremiumModalStore()

  if (!premiumModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg w-[420px] p-6 text-white">
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Unlock Pro features</h2>
          <p className="text-sm text-white/60">
            This feature is available on the Pro plan
          </p>
        </div>

        {/* Features */}
        <ul className="mb-6 space-y-2 text-sm">
          <li className="flex items-center gap-2 text-white/80">
            <span className="text-green-400">✓</span>
            Unlimited folders
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <span className="text-green-400">✓</span>
            Cloud sync across devices
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <span className="text-green-400">✓</span>
            Priority updates and new features
          </li>
        </ul>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setPremiumModalOpen(false)
              upgrade('pro')
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition text-sm font-medium"
          >
            Go Pro
          </button>

          <button
            onClick={() => setPremiumModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

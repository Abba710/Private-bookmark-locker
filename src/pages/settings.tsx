import OptionsPanel from '@/components/optionsPanel'
import Feedback from '@/components/feedback'
import SupportDialog from '@/components/Support/supportModal'
import NotificationsModal from '@/components/notifications/notificationsModal'
import QrModalUi from '@/components/contextMenu/featuresUI/qrGenModal'
import PhDialog from '@/components/promotepanel'
import ImportBookmarksDialog from '@/components/chromeImportPanel'
import { ArrowLeft, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col bg-[#09090b] text-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-3 h-12 px-3 border-b border-white/5 bg-white/[0.03] backdrop-blur-md shrink-0">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <h1 className="text-sm font-semibold tracking-wide">
            Settings
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <OptionsPanel />
          </div>

          <Feedback />
          <SupportDialog />
          <NotificationsModal />
          <PhDialog />
          <QrModalUi />
          <ImportBookmarksDialog />
        </div>
      </div>
    </div>
  )
}

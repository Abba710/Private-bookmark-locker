import OptionsPanel from '@/components/optionsPanel'
import SupportDialog from '@/components/Support/supportModal'
import NotificationsModal from '@/components/notifications/notificationsModal'
import QrModalUi from '@/components/contextMenu/featuresUI/qrGenModal'
import PhDialog from '@/components/promotepanel'
import { ArrowLeft, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSubscription from '@/hooks/useSubscribe'
import { useAuth } from '@/hooks/useAuth'
import UpgradeToProModal from '@/components/premium/premiumModal'
import { BookmarkExample, FolderExample, Controls } from '@/components/settings/bookmarks'
import { DEFAULT_SETTINGS, type ControlsSettings } from '@/components/settings/bookmarks/controls.tsx'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rowSettings'

export default function SettingsPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { refreshSubscription } = useSubscription()

  const [saved, setSaved] = useState<ControlsSettings>(DEFAULT_SETTINGS)
  const [live, setLive] = useState<ControlsSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEY, (res) => {
      const initial = res[STORAGE_KEY] ?? DEFAULT_SETTINGS
      setSaved(initial)
      setLive(initial) // preview starts in sync with what's persisted
      setLoaded(true)
    })
  }, [])

  const handleSave = (settings: ControlsSettings) => {
    setSaved(settings)
    chrome.storage.sync.set({ [STORAGE_KEY]: settings })
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#09090b] text-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-3 h-12 px-3 border-b border-white/5 bg-white/[0.03] backdrop-blur-md shrink-0">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <h1 className="text-sm font-semibold tracking-wide">
            {chrome.i18n.getMessage('app_settings_title')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full overflow-y-auto">
        <div className="p-4 w-full space-y-4">
          <div className="rounded-2xl flex flex-col w-full gap-2 border border-white/5 bg-white/[0.02] p-4">
            {loaded && (
              <>
                <FolderExample settings={live.folder} name="Work" count={12} />
                <BookmarkExample settings={live.bookmark} name="GitHub" url="github.com" />
                <Controls initialSettings={saved} onChange={setLive} onSave={handleSave} />
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <OptionsPanel />
          </div>
          <SupportDialog />
          <NotificationsModal />
          <PhDialog />
          <QrModalUi />

          {/* Modals */}
          <UpgradeToProModal
            upgrade={refreshSubscription} // Trigger re-check after payment
            logIn={auth.signInWithGoogle}
          />
        </div>
      </div>
    </div>
  )
}

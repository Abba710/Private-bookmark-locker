import { useState } from 'preact/hooks'
import ImportDialog from '@/components/ImportExport/import'
import ExportDialog from '@/components/ImportExport/export'
import {
  useBookmarkStore,
  useSupportDialogStore,
  useNotificationDialogStore,
  useSubscribePlanStore,
  usePremiumModalStore,
} from '@/storage/statelibrary'
import exportBookmarks from '@/features/importExport/export'
import {
  getChromeBookmarks,
  saveAllOpenTabs,
} from '@/features/bookmarks/bookmarkService'
import { share } from '@/features/options/share'

// Component Imports
import ManageSubscriptionButton from '@/components/Subscribe/manageSubscribe'
import GetProButton from '@/components/Subscribe/getPro'

import {
  Upload,
  Download,
  Settings,
  Library,
  Save,
  History,
  Users,
  Star,
  Share2,
  Heart,
  Bug,
  ChevronRight,
} from 'lucide-react'

import { handleCheckPremium } from '@/util/premiumCheck'

/**
 * OptionsPanel Component
 * Main settings panel using a dark glassmorphism theme.
 */

export default function OptionsPanel() {
  // Global States
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const isPro = useSubscribePlanStore((state) => state.isPro)

  // Modal Actions
  const setPremiumModalOpen = usePremiumModalStore(
    (state) => state.setPremiumModalOpen
  )
  const setSupportOpen = useSupportDialogStore((state) => state.setSupportOpen)
  const setNotificationOpen = useNotificationDialogStore(
    (state) => state.setNotificationOpen
  )

  // Local UI States
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)

  /**
   * Style mapping for dynamic color themes
   */
  const colorMap: Record<string, string> = {
    indigo: 'group-hover:border-indigo-500/30 group-hover:text-indigo-400',
    amber: 'group-hover:border-amber-500/30 group-hover:text-amber-400',
    pink: 'group-hover:border-pink-500/30 group-hover:text-pink-400',
    red: 'group-hover:border-red-500/30 group-hover:text-red-400',
    blue: 'group-hover:border-blue-500/30 group-hover:text-blue-400',
  }

  /**
   * Reusable Row Component with Premium Indicator Logic
   */
  const OptionRow = ({
    icon: Icon,
    label,
    onClick,
    href,
    color = 'indigo',
    isPremium = false, // New prop to show the indicator
  }: any) => {
    const activeColorClasses = colorMap[color] || colorMap.indigo

    const Content = (
      <>
        <div className="flex items-center gap-3">
          <div
            className={`relative p-1.5 rounded-lg bg-white/5 border border-white/5 transition-colors duration-300 ${
              activeColorClasses.split(' ')[0]
            }`}
          >
            <Icon
              className={`w-4 h-4 text-zinc-400 transition-colors duration-300 ${
                activeColorClasses.split(' ')[1]
              }`}
            />

            {/* PREMIUM INDICATOR: Pulsing dot if feature is Pro and user is Free */}
            {isPremium && !isPro && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            )}
          </div>
          <span className="text-zinc-300 group-hover:text-white font-medium transition-colors duration-200">
            {label}
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-300" />
      </>
    )

    const classes =
      'group flex items-center justify-between p-2 rounded-xl transition-all duration-200 hover:bg-white/[0.04] cursor-pointer w-full text-sm'

    if (href) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={classes}>
          {Content}
        </a>
      )
    }

    return (
      <button onClick={onClick} className={classes}>
        {Content}
      </button>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      {/* SECTION: PREMIUM & ACCOUNT */}
      <div className="flex flex-col gap-1 p-1.5 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl shadow-sm">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-indigo-400/70 uppercase tracking-[0.15em]">
          {isPro
            ? chrome.i18n.getMessage('app_options_subscription_plan')
            : chrome.i18n.getMessage('app_options_go_premium')}
        </p>

        {isPro ? (
          <ManageSubscriptionButton />
        ) : (
          <GetProButton onClick={() => setPremiumModalOpen(true)} />
        )}
      </div>

      {/* SECTION: DATA MANAGEMENT (PRO FEATURES) */}
      <div className="flex flex-col gap-1 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl shadow-sm">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
          {chrome.i18n.getMessage('app_options_data_tools')}
        </p>
        <OptionRow
          icon={Upload}
          isPremium={true}
          label={chrome.i18n.getMessage('app_import_modal')}
          onClick={() => {
            if (!handleCheckPremium()) return
            setShowImport(true)
          }}
          color="blue"
        />
        <OptionRow
          icon={Download}
          isPremium={true}
          label={chrome.i18n.getMessage('app_modal_export')}
          onClick={() => {
            if (!handleCheckPremium()) return
            setShowExport(true)
          }}
          color="blue"
        />
        <OptionRow
          icon={Settings}
          isPremium={true}
          label={chrome.i18n.getMessage('app_options_hotkeys')}
          onClick={() => {
            if (!handleCheckPremium()) return
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
          }}
          color="indigo"
        />
        <OptionRow
          icon={Library}
          isPremium={true}
          label={chrome.i18n.getMessage('app_options_collect')}
          onClick={() => {
            if (!handleCheckPremium()) return
            getChromeBookmarks()
          }}
          color="indigo"
        />
        <OptionRow
          icon={Save}
          isPremium={true}
          label={chrome.i18n.getMessage('app_options_save_open')}
          onClick={() => {
            if (!handleCheckPremium()) return
            saveAllOpenTabs()
          }}
          color="indigo"
        />
      </div>

      {/* SECTION: COMMUNITY & SUPPORT */}
      <div className="flex flex-col gap-1 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl shadow-sm">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
          {chrome.i18n.getMessage('app_options_community_header')}
        </p>
        <OptionRow
          icon={History}
          label={chrome.i18n.getMessage('app_changelog')}
          onClick={() => setNotificationOpen(true)}
          color="indigo"
        />
        <OptionRow
          icon={Users}
          label={chrome.i18n.getMessage('app_community')}
          href="https://www.reddit.com/user/Sad-Bed-3125/submitted/"
          color="indigo"
        />
        <OptionRow
          icon={Star}
          label={chrome.i18n.getMessage('app_rate_extension')}
          href="https://chromewebstore.google.com/detail/fagjclghcmnfinjdkdnkejodfjgkpljd/reviews"
          color="amber"
        />
        <OptionRow
          icon={Share2}
          label={chrome.i18n.getMessage('app_share_extension')}
          onClick={() => share()}
          color="indigo"
        />
        <OptionRow
          icon={Heart}
          label={chrome.i18n.getMessage('app_donate_title')}
          onClick={() => setSupportOpen(true)}
          color="pink"
        />
        <OptionRow
          icon={Bug}
          label={chrome.i18n.getMessage('app_report_bug')}
          href="https://github.com/Abba710/Private-bookmark-locker/issues"
          color="red"
        />
      </div>

      {/* MODALS & DIALOGS */}
      {showImport && <ImportDialog onClose={() => setShowImport(false)} />}
      {showExport && (
        <ExportDialog
          onClose={() => setShowExport(false)}
          onExport={() => {
            exportBookmarks(bookmarks)
            setShowExport(false)
          }}
        />
      )}
    </div>
  )
}

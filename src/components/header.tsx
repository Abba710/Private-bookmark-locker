import { LogIn, LogOut, Crown, User as UserIcon } from 'lucide-react'
import { Badge } from './ui/badge'
import type { User } from '@/types/types'

interface UserHeaderProps {
  userData: User | null
  logIn: () => void
  logOut: () => void
  isPro: boolean
}

export default function UserHeader({
  userData,
  isPro,
  logIn,
  logOut,
}: UserHeaderProps) {
  const username =
    userData?.mail || chrome.i18n.getMessage('app_header_guest_name')

  return (
    <div className="relative flex items-center w-full h-[48px] px-3 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md">
      {userData ? (
        <div className="flex w-full items-center gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-indigo-300" />
            </div>

            <div className="flex items-center gap-2 overflow-hidden">
              <p className="text-white text-sm font-medium truncate max-w-[120px]">
                {username}
              </p>

              <Badge
                variant="outline"
                className={`cursor-pointer transition-colors ${
                  !isPro
                    ? 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                }`}
              >
                {!isPro ? (
                  <span className="text-[10px] uppercase tracking-wider font-bold">
                    {chrome.i18n.getMessage('app_subscribe_free')}
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold">
                    <Crown
                      className="w-3 h-3 text-indigo-400"
                      fill="currentColor"
                    />
                    {chrome.i18n.getMessage('app_subscribe_pro')}
                  </div>
                )}
              </Badge>
            </div>
          </div>

          <button
            className="ml-auto p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
            onClick={logOut}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex w-full items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-500">
              <UserIcon className="w-4 h-4" />
            </div>
            <p className="text-gray-400 text-sm font-medium">{username}</p>
          </div>
          <button
            className="ml-auto flex items-center gap-2 py-1.5 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition-all active:scale-95 text-sm font-semibold"
            onClick={logIn}
          >
            <span>{chrome.i18n.getMessage('app_header_log_in')}</span>
            <LogIn className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

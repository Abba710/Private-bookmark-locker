import { LogIn, LogOut, Crown, Settings, Maximize2 } from 'lucide-react'
import { Badge } from './ui/badge'
import type { User } from '@/types/types'
import { useNavigate,  } from "react-router-dom";



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
  const navigate = useNavigate();
  return (
    <div className="flex items-center h-12 px-3 border-b border-white/5 bg-white/[0.03] backdrop-blur-md shrink-0">
      {userData ? (
        <>
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-medium text-white max-w-[140px]">
              {username}
            </p>

            <Badge
              variant="outline"
              className={
                isPro
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                  : "border-white/10 bg-white/5 text-gray-400"
              }
            >
              {isPro ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                  <Crown className="h-3 w-3 fill-current" />
                  PRO
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  FREE
                </span>
              )}
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              title={chrome.i18n.getMessage("app_open_fullscreen")}
              onClick={() => {chrome.tabs.create({
                url: chrome.runtime.getURL("index.html")
              });
              }}
              className="flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={logOut}
              className="flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl text-zinc-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="min-w-0">
            <p className="truncate text-sm text-zinc-400">
              {username}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={logIn}
              className="flex items-center gap-2 cursor-pointer rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
            >
              <LogIn className="h-4 w-4" />
              <span>{chrome.i18n.getMessage('app_header_log_in')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

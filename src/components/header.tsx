import { LogIn, LogOut, Crown } from 'lucide-react'
import { Badge } from './ui/badge'
import type { User } from '@/types/types'

interface UserHeaderProps {
  userData: User | null
  logIn: () => void
  logOut: () => void
  plan: 'free' | 'pro'
}
function UserHeader({ userData, plan, logIn, logOut }: UserHeaderProps) {
  const username = userData?.mail || 'Guest User'
  return (
    <div className="relative flex items-center w-full h-[40px] px-4 bg-white/10 rounded-[16px]">
      {userData ? (
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-1">
            <p className="text-white text-[14px] font-medium cursor-pointer">
              {username}
            </p>
            <Badge
              variant="outline"
              className={
                plan === 'free'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border-purple-400/50'
              }
            >
              {plan === 'free' ? (
                'Free Plan'
              ) : (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Pro Plan
                </>
              )}
            </Badge>
          </div>

          <button
            className="ml-auto cursor-pointer hover:scale-105 transition-transform"
            onClick={logOut}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-1">
            <p className="text-white text-[14px] font-medium">{username}</p>
          </div>
          <Badge
            variant="outline"
            className={
              plan === 'free'
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border-purple-400/50'
            }
          >
            {plan === 'free' ? (
              'Free Plan'
            ) : (
              <>
                <Crown className="w-3 h-3 mr-1" />
                Pro Plan
              </>
            )}
          </Badge>
          <button
            className="ml-auto cursor-pointer hover:scale-105 transition-transform"
            onClick={logIn}
          >
            <LogIn className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default UserHeader

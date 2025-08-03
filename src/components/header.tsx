import { useUserProfileStore, useAuthStore } from '@/storage/statelibrary'
import { useState } from 'react'
import guestAvatar from '@/assets/guest_profile.png'

function UserHeader() {
  const [open, setOpen] = useState(false)
  const username = useUserProfileStore((s) => s.username)
  const avatar = useUserProfileStore((s) => s.avatar)
  const isPremium = useUserProfileStore((s) => s.isPremium)
  const token = useUserProfileStore((s) => s.token)
  const logout = useUserProfileStore((s) => s.logout)
  const setModalOpen = useAuthStore((state) => state.setModalOpen)

  return (
    // Wrapper container with relative positioning for dropdown
    <div className="relative flex items-center justify-between w-full h-[60px] p-3 bg-white/10 rounded-[16px]">
      {/* Left side: avatar and user info */}
      <div className="flex items-center gap-3">
        <img
          src={avatar || guestAvatar}
          alt="User Avatar"
          className="w-9 h-9 rounded-[10px] object-cover bg-white"
        />
        <div className="flex flex-col justify-center">
          <h1 className="font-medium text-white text-sm leading-none">
            {username}
          </h1>
          <h2 className="text-white text-xs opacity-70 leading-none">
            {isPremium ? 'Premium plan' : 'Free plan'}
          </h2>
        </div>
      </div>

      {/* Dropdown toggle button */}
      <button
        className="min-w-8 min-h-8 rounded-xl bg-white/20 text-white flex text-xs items-center cursor-pointer justify-center"
        onClick={() => setOpen(!open)}
      >
        🔻
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-[100%] right-0 mt-2 w-[160px] bg-white/10 backdrop-blur-sm rounded-xl shadow-lg text-sm text-white overflow-hidden z-10">
          <button className="w-full px-4 py-2 text-left hover:bg-white/20">
            Upgrade Plan
          </button>
          {!token ? (
            <button
              className="w-full px-4 py-2 text-left hover:bg-white/20"
              onClick={() => {
                setOpen(false)
                setModalOpen(true)
              }}
            >
              login
            </button>
          ) : (
            <button
              className="w-full px-4 py-2 text-left hover:bg-white/20"
              onClick={() => {
                setOpen(false)
                logout()
              }}
            >
              logout
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default UserHeader

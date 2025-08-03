import { create } from 'zustand'
import {
  type Bookmark,
  type BookmarkStore,
  type SwitchStore,
  type LockOverlayStore,
  type PremiumModalStore,
  type UserProfile,
  type AuthStore,
} from '@/types/types'

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: [],
  setBookmarks: (bookmarks: Bookmark[]) => set({ bookmarks }),
}))

export const useSwitchStore = create<SwitchStore>((set) => ({
  Switch: false,
  setSwitch: (filtered: boolean) => set({ Switch: filtered }),
}))

export const useLockOverlayStore = create<LockOverlayStore>((set) => ({
  isLocked: true,
  mode: 'unlock',
  setIsLocked: (locked) => set({ isLocked: locked }),
  setMode: (mode) => set({ mode }),
}))

export const usePremiumModalStore = create<PremiumModalStore>((set) => ({
  premiumOpen: false,
  openPremium: () => set({ premiumOpen: true }),
  closePremium: () => set({ premiumOpen: false }),
}))

export const useUserProfileStore = create<UserProfile>((set) => ({
  username: 'Guest user',
  avatar: null,
  token: null,
  isPremium: true,
  setPremium: (isPremium) => set({ isPremium }),
  logout: () =>
    set({
      username: 'Guest user',
      avatar: '',
      token: null,
      isPremium: false,
    }),
}))

export const useAuthStore = create<AuthStore>((set) => ({
  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open }),
}))

import { create } from 'zustand'
import {
  type Bookmark,
  type BookmarkStore,
  type SwitchStore,
  type LockOverlayStore,
  type FeedbackStore,
  type supportDialogProps,
  type notificationDialogProps,
  type usePremiumModalStoreProps,
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

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  showFeedback: false,
  setShowFeedback: (show) => set({ showFeedback: show }),
}))

export const useSupportDialogStore = create<supportDialogProps>((set) => ({
  supportOpen: false,
  setSupportOpen: (open) => set({ supportOpen: open }),
}))

export const useNotificationDialogStore = create<notificationDialogProps>(
  (set) => ({
    notificationOpen: false,
    setNotificationOpen: (open) => set({ notificationOpen: open }),
  })
)

export const usePremiumModalStore = create<usePremiumModalStoreProps>(
  (set) => ({
    premiumModalOpen: false,
    setPremiumModalOpen: (open) => set({ premiumModalOpen: open }),
  })
)

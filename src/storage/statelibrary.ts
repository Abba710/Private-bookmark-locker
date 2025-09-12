import { create } from 'zustand'
import {
  type Bookmark,
  type BookmarkStore,
  type SwitchStore,
  type LockOverlayStore,
  type FeedbackStore,
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

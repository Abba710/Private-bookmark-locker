import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Bookmark,
  BookmarkStore,
  SwitchStore,
  LockOverlayStore,
  FeedbackStore,
  supportDialogProps,
  notificationDialogProps,
  usePremiumModalStoreProps,
  SubscribeState,
} from '@/types/types'
import { supabase } from '@/service/supabase'

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

export const useSubscribePlanStore = create<SubscribeState>()(
  persist(
    (set, get) => ({
      isPro: false,
      isLoading: true, // Initially true for the very first load (no cache)

      setPlan: (status) => set({ isPro: status }),

      checkSubscription: async () => {
        const currentIsPro = get().isPro

        /**
         * UX Optimization:
         * If we already have a cached "isPro" status from localStorage (currentIsPro is true),
         * we DO NOT set isLoading to true. This prevents the UI from flickering
         * or showing a spinner to a user who is already known to be Pro.
         */
        if (!currentIsPro) {
          set({ isLoading: true })
        }

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            // User is not logged in -> definitely not Pro
            set({ isPro: false, isLoading: false })
            return
          }

          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', user.id)
            .single()

          if (error) throw error

          // Update store with authoritative server data
          set({ isPro: data?.is_pro ?? false, isLoading: false })
        } catch (error) {
          console.error('Subscription check error:', error)
          /**
           * Safety Fallback:
           * If the network fails, it is safer to assume false for new checks,
           * OR keep the existing state if you want "offline pro" mode.
           * Here we reset to false to prevent abuse.
           */
          set({ isPro: false, isLoading: false })
        }
      },
    }),
    {
      name: 'subscription-storage', // Key in localStorage
      storage: createJSONStorage(() => localStorage),

      /**
       * Persist ONLY 'isPro'.
       * 'isLoading' should reset on page reload to ensure logic runs correctly.
       */
      partialize: (state) => ({ isPro: state.isPro }),
    }
  )
)

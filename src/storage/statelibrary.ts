import { create } from "zustand";
import {
  type Bookmark,
  type BookmarkStore,
  type SwitchStore,
  type LockOverlayStore,
  type UserStore,
  type PremiumModalStore,
} from "@/types/types";

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: [],
  setBookmarks: (bookmarks: Bookmark[]) => set({ bookmarks }),
}));

export const useSwitchStore = create<SwitchStore>((set) => ({
  Switch: false,
  setSwitch: (filtered: boolean) => set({ Switch: filtered }),
}));

export const useLockOverlayStore = create<LockOverlayStore>((set) => ({
  isLocked: true,
  mode: "unlock",
  setIsLocked: (locked) => set({ isLocked: locked }),
  setMode: (mode) => set({ mode }),
}));

export const useUserStore = create<UserStore>((set) => ({
  isPremium: false,
  setPremium: (premium) => set({ isPremium: premium }),
}));

export const usePremiumModalStore = create<PremiumModalStore>((set) => ({
  premiumOpen: false,
  openPremium: () => set({ premiumOpen: true }),
  closePremium: () => set({ premiumOpen: false }),
}));

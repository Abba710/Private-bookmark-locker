import { create } from 'zustand'
import type { QrModalProps } from '@/components/contextMenu/contextTypes'

export const useQrModalStore = create<QrModalProps>((set) => ({
  bookmark: null,
  setSelectedBookmark: (bookmark) => set({ bookmark }),
  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open }),
}))

import { create } from 'zustand'
import type { QrModalProps } from '@/components/contextMenu/contextTypes'

export const useContextModalStore = create<QrModalProps>((set) => ({
  bookmark: null,
  setSelectedBookmark: (bookmark) => set({ bookmark }),
  qrModalOpen: false,
  setQrModalOpen: (open) => set({ qrModalOpen: open }),
  downloadModalOpen: false,
  setDownloadModalOpen: (open) => set({ downloadModalOpen: open }),
}))

import type { Bookmark } from '@/types/types'

export interface MenuItem {
  label: string
  action?: () => void
}

export interface ContextMenuProps {
  bookmark: Bookmark
  position: { x: number; y: number } // where the menu should appear
  onClose: () => void
  onOpenModal: (type: string) => void // placeholder for modal actions
}

export interface QrModalProps {
  bookmark: Bookmark | null
  setSelectedBookmark: (bookmark: Bookmark | null) => void
  qrModalOpen: boolean
  setQrModalOpen: (open: boolean) => void
}

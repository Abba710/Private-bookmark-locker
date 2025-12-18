// ContextMenu.tsx
import type {
  ContextMenuProps,
  MenuItem,
} from '@/components/contextMenu/contextTypes'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useContextModalStore } from '@/components/contextMenu/contextMenuStore'
import { openBookmarkGroup } from '@/components/contextMenu/features/openInGroup'

export function ContextMenu({
  bookmark,
  position,
  onClose,
  onOpenModal,
}: ContextMenuProps) {
  const { setQrModalOpen, setSelectedBookmark } = useContextModalStore()
  const menuRef = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState(position)

  const linkMenuItems: MenuItem[] = [
    {
      label: 'Copy link',
      action: () => {
        if (bookmark.url) {
          navigator.clipboard.writeText(bookmark.url)
        }
      },
    },
    {
      label: 'Generate QR code',
      action: () => {
        setQrModalOpen(true)
        setSelectedBookmark(bookmark)
      },
    },
    {
      label: 'Download PDF',
      action: async () => {},
    },
    {
      label: 'AI Summary',
      action: () => {
        window.open(
          `https://chat.openai.com/?q=Summary%20` + bookmark.url,
          '_blank'
        )
      },
    },
    { label: 'close', action: () => setQrModalOpen(false) },
  ]

  const folderMenuItems: MenuItem[] = [
    {
      label: 'Open in group',
      action: async () => await openBookmarkGroup(bookmark),
    },
    { label: 'Edit', action: () => onOpenModal('edit') },
    { label: 'Close', action: () => setQrModalOpen(false) },
  ]

  const menuItems = bookmark.isFolder ? folderMenuItems : linkMenuItems

  // Adjust menu position to prevent overflow
  useEffect(() => {
    const menuWidth = 220
    const menuHeight = menuItems.length * 36

    const screenW = window.innerWidth
    const screenH = window.innerHeight

    const scrollX = window.scrollX
    const scrollY = window.scrollY

    const x =
      position.x + menuWidth > scrollX + screenW
        ? scrollX + screenW - menuWidth - 10
        : position.x

    const y =
      position.y + menuHeight > scrollY + screenH
        ? scrollY + screenH - menuHeight - 10
        : position.y

    setPos({ x, y })
  }, [position, menuItems.length])

  // Close menu on any click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('contextmenu', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('contextmenu', handleClickOutside)
    }
  }, [onClose])

  return (
    <ul
      ref={menuRef}
      className="absolute bg-white/10 backdrop-blur-md rounded-lg shadow-lg min-w-55 z-50 overflow-hidden"
      style={{ top: pos.y, left: pos.x }}
    >
      {menuItems.map((item, idx) => (
        <li
          key={idx}
          className="px-4 py-2 hover:bg-white/20 cursor-pointer text-xs text-white"
          onClick={() => {
            item.action?.()
            onClose()
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export default ContextMenu

import type { ContextMenuProps } from '@/components/contextMenu/contextTypes'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useContextModalStore } from '@/components/contextMenu/contextMenuStore'
import { openBookmarkGroup } from '@/components/contextMenu/features/openInGroup'
import exportToPDF from '@/components/contextMenu/features/downloadPdf'
import { Copy, QrCode, FileDown, Sparkles, Layers, XCircle } from 'lucide-react'
import { handleCheckPremium } from '@/util/premiumCheck'

/**
 * ContextMenu component refined for Modern Dark SaaS look.
 * Features:
 * 1. Glassmorphism background (#0f0f11/90 with blur).
 * 2. Icons for every action for better scannability.
 * 3. Smooth entrance animation.
 * 4. Automatic positioning to prevent screen overflow.
 */

export function ContextMenu({ bookmark, position, onClose }: ContextMenuProps) {
  const { setQrModalOpen, setSelectedBookmark } = useContextModalStore()
  const menuRef = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState(position)

  // Define menu items with icons to match the Premium Modal look
  const linkMenuItems = [
    {
      label: chrome.i18n.getMessage('app_context_copy_link'),
      icon: <Copy className="w-4 h-4" />,
      action: () => {
        if (bookmark.url) navigator.clipboard.writeText(bookmark.url)
      },
    },
    {
      label: chrome.i18n.getMessage('app_context_qr_code'),
      icon: <QrCode className="w-4 h-4" />,
      action: () => {
        if (!handleCheckPremium()) return

        setQrModalOpen(true)
        setSelectedBookmark(bookmark)
      },
    },
    {
      label: chrome.i18n.getMessage('app_context_download_pdf'),
      icon: <FileDown className="w-4 h-4" />,
      action: async () => {
        if (!handleCheckPremium()) return

        if (bookmark.url) exportToPDF(bookmark.url)
      },
    },
    {
      label: chrome.i18n.getMessage('app_context_ai_summary'),
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />, // Sparkles icon for AI
      action: () => {
        window.open(
          `https://chat.openai.com/?q=Summary%20` + bookmark.url,
          '_blank'
        )
      },
    },
  ]

  const folderMenuItems = [
    {
      label: chrome.i18n.getMessage('app_context_open_group'),
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      action: async () => await openBookmarkGroup(bookmark),
    },
  ]

  // Add a Close action to all menus with a separator look
  const commonTailItems = [
    {
      label: chrome.i18n.getMessage('app_context_close_menu'),
      icon: <XCircle className="w-4 h-4 text-gray-500" />,
      action: () => onClose(),
    },
  ]

  const menuItems = [
    ...(bookmark.isFolder ? folderMenuItems : linkMenuItems),
    ...commonTailItems,
  ]

  // Adjust menu position to prevent overflow
  useEffect(() => {
    const menuWidth = 200
    const menuHeight = menuItems.length * 38 // Approximate height per item

    const screenW = window.innerWidth
    const screenH = window.innerHeight

    const x =
      position.x + menuWidth > screenW ? screenW - menuWidth - 12 : position.x

    const y =
      position.y + menuHeight > screenH ? screenH - menuHeight - 12 : position.y

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
      // STYLING:
      // - bg-[#0f0f11]/90: Deep dark backdrop
      // - border border-white/10: Thin elegant border
      // - shadow-2xl: Deep depth
      // - p-1.5: Modern spacing for list items
      className="fixed bg-[#0f0f11]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[200px] z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-150"
      style={{ top: pos.y, left: pos.x }}
    >
      {menuItems.map((item, idx) => (
        <li
          key={idx}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-[13px] font-medium transition-all duration-200
            ${
              idx === menuItems.length - 1 && menuItems.length > 2
                ? 'mt-1 border-t border-white/5 pt-2'
                : ''
            }
            hover:bg-white/10 hover:text-white text-zinc-300 group
          `}
          onClick={() => {
            item.action?.()
            onClose()
          }}
        >
          {/* Action Icon - Glow effect on hover */}
          <div className="text-zinc-500 group-hover:text-indigo-400 transition-colors">
            {item.icon}
          </div>

          <span className="flex-grow">{item.label}</span>

          {/* Subtle shortcut hint or arrow could go here */}
        </li>
      ))}
    </ul>
  )
}

export default ContextMenu

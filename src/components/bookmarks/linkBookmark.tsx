import { type Bookmark } from '@/types/types'
import ContextMenu from '@/components/contextMenu/contextMenu'
import { useState } from 'preact/hooks'
import { GripVertical, Pencil, Trash2, Globe } from 'lucide-react'

/**
 * LinkBookmark with dynamic title sliding.
 * Features:
 * 1. Title expands to full width when not hovered.
 * 2. Actions slide in and push the title when hovered.
 * 3. Smooth transition for all layout changes.
 */

export function LinkBookmark({
  bookmark,
  listeners,
  attributes,
  setDroppableRef,
  onDelete,
  onEdit,
}: {
  bookmark: Bookmark
  listeners: any
  attributes: any
  setDroppableRef: (node: HTMLElement | null) => void
  onDelete: (id: string) => void
  onEdit: (title: string | undefined, id: string) => void
}) {
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const getFaviconUrl = (url?: string) => {
    if (!url) return ''
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return ''
    }
  }

  const getDomain = (url?: string) => {
    if (!url) return ''
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div
      className="group relative flex items-center gap-0 w-[90vw] max-w-[300px] min-h-[52px] px-3 py-2 bg-white/[0.04] border border-white/[0.05] rounded-2xl hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuPos({ x: e.clientX, y: e.clientY })
        setMenuVisible(true)
      }}
    >
      {/* Drag handle - Absolute positioned to not take space */}
      <div
        className="absolute left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-white/20 hover:text-white p-1 z-10"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <a
        href={bookmark.url}
        onClick={(e) => {
          e.preventDefault()
          chrome.windows.getCurrent((window) => {
            if (window.incognito === bookmark.incognito) {
              chrome.tabs.create({ url: bookmark.url, windowId: window.id })
            } else {
              chrome.windows.create({
                url: bookmark.url,
                incognito: bookmark.incognito,
              })
            }
          })
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center select-none gap-3 flex-1 min-w-0 no-underline pl-2 group-hover:pl-4 transition-all duration-300"
        ref={setDroppableRef}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-indigo-500/30 transition-colors">
          {getFaviconUrl(bookmark.url) ? (
            <img
              src={getFaviconUrl(bookmark.url)}
              alt=""
              className="w-5 h-5 object-contain"
            />
          ) : (
            <Globe className="w-5 h-5 text-indigo-400/60" />
          )}
        </div>

        {/* TEXT AREA: Grows and shrinks smoothly */}
        <div className="flex flex-col justify-center min-w-0 flex-1 transition-all duration-300">
          <span className="text-white text-[14px] font-semibold truncate leading-tight group-hover:text-indigo-300 transition-colors">
            {bookmark.title || getDomain(bookmark.url)}
          </span>
          <span className="text-gray-400 text-[12px] truncate leading-none mt-1.5 font-medium opacity-80">
            {getDomain(bookmark.url)}
          </span>
        </div>
      </a>

      {/* DYNAMIC ACTIONS: Slide in effect */}
      <div className="flex items-center w-0 group-hover:w-[76px] opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden shrink-0">
        <div className="flex items-center gap-0.5 pl-2 border-l border-white/5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(bookmark.title, bookmark.id)
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(bookmark.id)
            }}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {menuVisible && (
        <ContextMenu
          bookmark={bookmark}
          position={menuPos}
          onClose={() => setMenuVisible(false)}
          onOpenModal={() => {}}
        />
      )}
    </div>
  )
}

import { useSortable } from '@dnd-kit/sortable'
import type { JSX } from 'preact/jsx-runtime'
import { CSS } from '@dnd-kit/utilities'
import { useRef, useState } from 'preact/hooks'
import { useBookmarkStore } from '@/storage/statelibrary'
import type { DragEndEvent } from '@dnd-kit/core'
import type { Bookmark } from '@/types/types'

// --- COMPONENT: Sortable ---

type DraggableItemProps = {
  id: string
  children: (props: {
    listeners: any
    attributes: any
    setDroppableRef: (node: HTMLElement | null) => void
  }) => JSX.Element
}

export function Sortable({ id, children }: DraggableItemProps) {
  const [hoverLine, setHoverLine] = useState<
    'top' | 'bottom' | 'inside' | null
  >(null)
  const ref = useRef<HTMLElement | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    setDroppableNodeRef,
    isOver,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id,
    data: { hoverLine },
  })

  // PREMIUM SAAS DRAG & DROP STYLES
  const style: JSX.CSSProperties = {
    // 1. DRAGGING STATE (Floating card effect)
    ...(isDragging && transform
      ? {
          transform: CSS.Transform.toString(transform),
          zIndex: 999,
          position: 'relative',
          pointerEvents: 'none',
          opacity: 0.7,
          // Deep shadow and subtle indigo glow like in your Pro Modal
          boxShadow:
            '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(99, 102, 241, 0.2)',
          borderRadius: '12px',
          scale: '1.02',
        }
      : {}),

    // 2. REORDER INDICATORS (Top/Bottom subtle indigo lines)
    ...(isOver && hoverLine === 'top'
      ? {
          borderTop: '2px solid #6366f1',
          boxShadow: 'inset 0 10px 20px -10px rgba(99, 102, 241, 0.3)',
        }
      : {}),
    ...(isOver && hoverLine === 'bottom'
      ? {
          borderBottom: '2px solid #6366f1',
          boxShadow: 'inset 0 -10px 20px -10px rgba(99, 102, 241, 0.3)',
        }
      : {}),

    // 3. FOLDER INSERTION (Inside glow effect)
    ...(isOver && hoverLine === 'inside'
      ? {
          outline: '2px solid #6366f1',
          outlineOffset: '-2px',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderRadius: '12px',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)',
        }
      : {}),

    transition: isDragging ? transition : 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
  }

  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const currentBookmark = findBookmarkById(bookmarks, id)
  const isFolder = currentBookmark?.isFolder

  return (
    <div
      ref={(el) => {
        ref.current = el
        setNodeRef(el)
        setDroppableNodeRef(el)
      }}
      style={style}
      className="relative rounded-xl"
      onPointerMove={(e) => {
        if (!ref.current || !isOver || isDragging) return

        const rect = ref.current.getBoundingClientRect()
        const y = e.clientY - rect.top
        const height = rect.height

        // Define drop zones (25% top, 25% bottom, 50% middle for folders)
        const topZone = height * 0.25
        const bottomZone = height * 0.75

        if (isFolder && y > topZone && y < bottomZone) {
          setHoverLine('inside')
        } else if (y <= topZone) {
          setHoverLine('top')
        } else {
          setHoverLine('bottom')
        }
      }}
      onPointerLeave={() => setHoverLine(null)}
    >
      {children({
        listeners: listeners ?? {},
        attributes: attributes ?? {},
        setDroppableRef: setDroppableNodeRef,
      })}
    </div>
  )
}

// --- LOGIC: Drag End Handler ---

export function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return

  const activeId = active.id as string
  const overId = over.id as string

  const bookmarks = useBookmarkStore.getState().bookmarks
  const setBookmarks = useBookmarkStore.getState().setBookmarks

  const hoverLine = over.data?.current?.hoverLine as
    | 'top'
    | 'bottom'
    | 'inside'
    | null

  // Validate if move is necessary
  const { shouldMove, reason } = getInsertPosition(
    activeId,
    overId,
    hoverLine,
    bookmarks
  )

  if (!shouldMove) {
    console.log('Drag cancelled:', reason)
    return
  }

  const activePath = findBookmarkPath(bookmarks, activeId)
  const overPath = findBookmarkPath(bookmarks, overId)

  if (!activePath || !overPath) return

  try {
    // 1. Remove from old position
    const [bookmarksAfterRemove, movedBookmark] = removeBookmarkAtPath(
      bookmarks,
      activePath
    )

    // 2. Adjust target path
    let adjustedOverPath = [...overPath]
    const sameParent =
      activePath.length === overPath.length &&
      activePath.slice(0, -1).every((val, i) => val === overPath[i])

    if (
      sameParent &&
      activePath[activePath.length - 1] < overPath[overPath.length - 1]
    ) {
      adjustedOverPath[adjustedOverPath.length - 1]--
    }

    // 3. Calculate position type
    let insertPosition: 'before' | 'after' | 'inside'
    if (hoverLine === 'inside') {
      insertPosition = 'inside'
    } else if (hoverLine === 'top') {
      insertPosition = 'before'
    } else {
      insertPosition = 'after'
    }

    // 4. Final insertion and state update
    const finalBookmarks = insertBookmarkAtPath(
      bookmarksAfterRemove,
      adjustedOverPath,
      movedBookmark,
      insertPosition
    )

    setBookmarks(finalBookmarks)
    chrome.storage.local.set({ bookmarks: finalBookmarks })
  } catch (error) {
    console.error('Error during drag and drop:', error)
  }
}

// --- UTILITIES: Nested Structure Management ---

function findBookmarkById(bookmarks: Bookmark[], id: string): Bookmark | null {
  for (const bookmark of bookmarks) {
    if (bookmark.id === id) return bookmark
    if (bookmark.children) {
      const found = findBookmarkById(bookmark.children, id)
      if (found) return found
    }
  }
  return null
}

function findBookmarkPath(
  bookmarks: Bookmark[],
  id: string,
  path: number[] = []
): number[] | null {
  for (let i = 0; i < bookmarks.length; i++) {
    if (bookmarks[i].id === id) return [...path, i]
    if (bookmarks[i].children) {
      const found = findBookmarkPath(bookmarks[i].children!, id, [...path, i])
      if (found) return found
    }
  }
  return null
}

function removeBookmarkAtPath(
  bookmarks: Bookmark[],
  path: number[]
): [Bookmark[], Bookmark] {
  const newBookmarks = JSON.parse(JSON.stringify(bookmarks))
  let current = newBookmarks
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]].children!
  }
  const removed = current.splice(path[path.length - 1], 1)[0]
  return [newBookmarks, removed]
}

function insertBookmarkAtPath(
  bookmarks: Bookmark[],
  path: number[],
  bookmark: Bookmark,
  position: 'before' | 'after' | 'inside'
): Bookmark[] {
  const newBookmarks = JSON.parse(JSON.stringify(bookmarks))
  let current = newBookmarks
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]].children!
  }
  const targetIndex = path[path.length - 1]

  if (position === 'inside') {
    const targetFolder = current[targetIndex]
    if (targetFolder.isFolder) {
      if (!targetFolder.children) targetFolder.children = []
      targetFolder.children.push(bookmark)
    }
  } else if (position === 'before') {
    current.splice(targetIndex, 0, bookmark)
  } else if (position === 'after') {
    current.splice(targetIndex + 1, 0, bookmark)
  }
  return newBookmarks
}

function getInsertPosition(
  activeId: string,
  overId: string,
  hoverLine: string | null,
  bookmarks: Bookmark[]
) {
  if (!hoverLine) return { shouldMove: false, reason: 'No hover direction' }
  const activePath = findBookmarkPath(bookmarks, activeId)
  const overPath = findBookmarkPath(bookmarks, overId)
  if (!activePath || !overPath)
    return { shouldMove: false, reason: 'Path missing' }

  const sameParent =
    activePath.length === overPath.length &&
    activePath.slice(0, -1).every((val, i) => val === overPath[i])
  if (sameParent) {
    const activeIdx = activePath[activePath.length - 1]
    const overIdx = overPath[overPath.length - 1]
    if (hoverLine === 'top' && activeIdx === overIdx - 1)
      return { shouldMove: false, reason: 'Already before' }
    if (hoverLine === 'bottom' && activeIdx === overIdx + 1)
      return { shouldMove: false, reason: 'Already after' }
  }

  if (hoverLine === 'inside') {
    const overBookmark = findBookmarkById(bookmarks, overId)
    if (!overBookmark?.isFolder)
      return { shouldMove: false, reason: 'Not a folder' }
    if (activeId === overId)
      return { shouldMove: false, reason: 'Recursive move' }
  }
  return { shouldMove: true }
}

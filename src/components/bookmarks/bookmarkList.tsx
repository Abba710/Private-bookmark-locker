import {
  deleteBookmarks,
  editBookmarkTitle,
} from '@/features/bookmarks/bookmarkService'
import { useBookmarkStore, useSwitchStore } from '@/storage/statelibrary'
import { useMemo } from 'preact/hooks'
import Instructions from './instruction'
import { SortableContext } from '@dnd-kit/sortable'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { Sortable, handleDragEnd } from '@/features/bookmarks/bookmarkSort'
import { FolderBookmark } from './folderBookmark'
import { LinkBookmark } from './linkBookmark'
import type { Bookmark } from '@/types/types'
import { BookmarkSearch } from './bookmarksearch'

function BookmarkList() {
  const sensors = useSensors(useSensor(PointerSensor))
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const isIncognito = useSwitchStore((state) => state.Switch)

  const filtered = useMemo(() => {
    return isIncognito
      ? bookmarks.filter((bookmark) => bookmark.incognito)
      : bookmarks.filter((bookmark) => !bookmark.incognito)
  }, [bookmarks, isIncognito])

  const getAllIds = (bookmarks: Bookmark[]): string[] => {
    let ids: string[] = []
    for (const bookmark of bookmarks) {
      ids.push(bookmark.id)
      if (bookmark.children) {
        ids.push(...getAllIds(bookmark.children))
      }
    }
    return ids
  }

  const allIds = getAllIds(filtered)

  const handleDelete = (id: string) => {
    deleteBookmarks(bookmarks, id)
  }

  const handleEdit = (title: string | undefined, id: string) => {
    editBookmarkTitle(bookmarks, title, id)
  }

  const handleBookmarkSelect = (bookmark: Bookmark) => {
    if (bookmark.url) {
      window.open(bookmark.url, '_blank')
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* Decorative Glow - copied modal effect for background depth behind the list */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Search Header Section */}
      <div className="px-1 relative z-10">
        <BookmarkSearch
          onBookmarkSelect={handleBookmarkSelect}
          placeholder={chrome.i18n.getMessage('app_search_placeholder')}
        />
      </div>

      {/* Main List Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e: DragEndEvent) => handleDragEnd(e)}
      >
        <SortableContext items={allIds}>
          <div
            className={`
              flex flex-wrap items-start content-start justify-start gap-3 w-full 
              min-h-[70vh] max-h-[100vh] overflow-y-auto overflow-x-hidden p-2
              /* Custom Scrollbar - Indigo style */
              scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent
              hover:scrollbar-thumb-indigo-500/20 transition-all duration-300
            `}
          >
            {filtered.length < 1 ? (
              <div className="w-full flex justify-center animate-in fade-in zoom-in duration-500">
                <Instructions />
              </div>
            ) : (
              filtered.map((bookmark) => (
                <Sortable id={bookmark.id} key={bookmark.id}>
                  {({ listeners, attributes, setDroppableRef }) => (
                    /* Card entrance animation.
                       The bookmark layout now features consistent gaps and smooth transitions.
                    */
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {bookmark.isFolder ? (
                        <FolderBookmark
                          bookmark={bookmark}
                          listeners={listeners}
                          attributes={attributes}
                          setDroppableRef={setDroppableRef}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
                        />
                      ) : (
                        <LinkBookmark
                          bookmark={bookmark}
                          listeners={listeners}
                          attributes={attributes}
                          setDroppableRef={setDroppableRef}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
                        />
                      )}
                    </div>
                  )}
                </Sortable>
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default BookmarkList

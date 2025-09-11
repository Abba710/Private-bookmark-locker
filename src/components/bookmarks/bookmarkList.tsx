// Обновленный компонент BookmarkList
import { deleteBookmarks } from '@/features/bookmarks/bookmarkService'
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

  // Collect all IDs for SortableContext (including nested ones)
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

  // Handle bookmark selection from search results
  const handleBookmarkSelect = (bookmark: Bookmark) => {
    if (bookmark.url) {
      // Open bookmark in new tab
      window.open(bookmark.url, '_blank')
    }
    // You can add additional logic here, such as:
    // - Highlighting the selected bookmark in the list
    // - Adding to recently accessed
    // - Custom navigation logic
  }

  return (
    <div className="w-full">
      {/* Search input */}
      <BookmarkSearch
        onBookmarkSelect={handleBookmarkSelect}
        placeholder={`🔍 ${chrome.i18n.getMessage('app_search_placeholder')}`}
      />{' '}
      {/* Bookmark list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e: DragEndEvent) => handleDragEnd(e)}
      >
        <SortableContext items={allIds}>
          <div className="flex flex-wrap items-start content-start overflow-x-hidden gap-1 w-full min-h-[70vh] max-h-[70vh] overflow-y-auto p-1">
            {filtered.length < 1 ? (
              <Instructions />
            ) : (
              filtered.map((bookmark) => (
                <Sortable id={bookmark.id} key={bookmark.id}>
                  {({ listeners, attributes, setDroppableRef }) =>
                    bookmark.isFolder ? (
                      <FolderBookmark
                        bookmark={bookmark}
                        listeners={listeners}
                        attributes={attributes}
                        setDroppableRef={setDroppableRef}
                        onDelete={handleDelete}
                      />
                    ) : (
                      <LinkBookmark
                        bookmark={bookmark}
                        listeners={listeners}
                        attributes={attributes}
                        setDroppableRef={setDroppableRef}
                        onDelete={handleDelete}
                      />
                    )
                  }
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

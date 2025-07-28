// Обновленный компонент BookmarkList
import { deleteBookmarks } from "@/features/bookmarks/bookmarkService";
import { useBookmarkStore, useSwitchStore } from "@/storage/statelibrary";
import { useMemo } from "preact/hooks";
import Instructions from "./instruction";
import { SortableContext } from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { Sortable, handleDragEnd } from "@/features/bookmarks/bookmarkSort";
import { FolderBookmark } from "./folderBookmark";
import { LinkBookmark } from "./linkBookmark";
import type { Bookmark } from "@/types/types";

function BookmarkList() {
  const sensors = useSensors(useSensor(PointerSensor));
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const isIncognito = useSwitchStore((state) => state.Switch);

  const filtered = useMemo(() => {
    return isIncognito
      ? bookmarks.filter((bookmark) => bookmark.incognito)
      : bookmarks.filter((bookmark) => !bookmark.incognito);
  }, [bookmarks, isIncognito]);

  // Собираем все ID для SortableContext (включая вложенные)
  const getAllIds = (bookmarks: Bookmark[]): string[] => {
    let ids: string[] = [];
    for (const bookmark of bookmarks) {
      ids.push(bookmark.id);
      if (bookmark.children) {
        ids.push(...getAllIds(bookmark.children));
      }
    }
    return ids;
  };

  const allIds = getAllIds(filtered);

  const handleDelete = (id: string) => {
    deleteBookmarks(bookmarks, id);
  };

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="🔍 Search"
          className="w-full px-4 py-2 text-sm text-white bg-white/10 rounded-xl placeholder-white/60"
        />
        <span className="absolute right-3 top-2.5 text-white/50">👑</span>
      </div>

      {/* Bookmark list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e: DragEndEvent) => handleDragEnd(e)}
      >
        <SortableContext items={allIds}>
          <div className="flex flex-wrap items-start content-start overflow-x-hidden gap-1 w-full min-h-[400px] max-h-[400px] overflow-y-auto p-1">
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
  );
}

export default BookmarkList;

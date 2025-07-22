import { deleteBookmarks } from "@/features/bookmarks/bookmarkService";
import { Draggable } from "@/features/bookmarks/bookmarkSort";
import { useBookmarkStore, useSwitchStore } from "@/storage/statelibrary";
import { useMemo } from "preact/hooks";
import Instructions from "./instruction";
import { DndContext } from "@dnd-kit/core";

function BookmarkList() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const isIncognito = useSwitchStore((state) => state.Switch);
  const filtered = useMemo(() => {
    return isIncognito
      ? bookmarks.filter((bookmark) => bookmark.incognito)
      : bookmarks.filter((bookmark) => !bookmark.incognito);
  }, [bookmarks, isIncognito]);
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
      <DndContext>
        <div className="flex flex-wrap items-start content-start overflow-x-hidden gap-x-1 gap-y-2 min-h-[400px] max-h-[400px] overflow-y-auto">
          {filtered.length < 1 ? (
            <Instructions />
          ) : (
            filtered.map((bookmark) => (
              <Draggable id={`item-${bookmark.id}`} key={bookmark.id}>
                {({ listeners, attributes }) => (
                  <div className="flex items-center justify-start min-h-[50px] w-[320px] px-2 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
                    {/* Drag handle */}
                    <button
                      type="button"
                      className="cursor-grab min-w-[10px] min-h-[10px] text-white/40 hover:text-white text-xl"
                      {...listeners}
                      {...attributes}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      ⠿
                    </button>

                    {/* link */}
                    <a
                      href={bookmark.url}
                      onClick={(e) => {
                        chrome.windows.getCurrent((window) => {
                          if (window.incognito === bookmark.incognito) {
                            chrome.tabs.create({
                              url: bookmark.url,
                              windowId: window.id,
                            });
                          } else {
                            chrome.windows.create({
                              url: bookmark.url,
                              incognito: bookmark.incognito,
                            });
                          }
                        });
                        e.preventDefault();
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-start ml-[3px] gap-2 no-underline"
                    >
                      {bookmark.isFolder && (
                        <span className=" text-lg">📁</span>
                      )}
                      <div className="flex flex-col">
                        <span className="text-white text-sm truncate max-w-[200px]">
                          {bookmark.title || bookmark.url}
                        </span>
                        <span className="text-white/50 text-xs truncate max-w-[200px]">
                          {bookmark.url}
                        </span>
                      </div>
                    </a>

                    {/* Delete */}
                    <button
                      className="text-white/50 ml-auto hover:text-white text-base"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteBookmarks(bookmarks, bookmark.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </Draggable>
            ))
          )}
        </div>
      </DndContext>
    </div>
  );
}

export default BookmarkList;

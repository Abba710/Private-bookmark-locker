import { type Bookmark } from "../types/types";
import { LinkBookmark } from "./linkBookmark";
import { useState } from "preact/hooks";
import { Sortable } from "@/features/bookmarks/bookmarkSort";

export function FolderBookmark({
  bookmark,
  listeners,
  attributes,
  setDroppableRef,
  onDelete,
}: {
  bookmark: Bookmark;
  listeners: any;
  attributes: any;
  setDroppableRef: (node: HTMLElement | null) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childCount = bookmark.children?.length || 0;

  return (
    <div className="w-full">
      {/* Основной элемент папки */}
      <div className="flex items-center gap-1 min-h-[32px] w-[160px] px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition group">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab text-white/30 hover:text-white/60 text-sm shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          {...listeners}
          {...attributes}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          ⋮⋮
        </button>

        {/* Expand button */}
        <button
          className="text-white/60 hover:text-white text-xs shrink-0 w-3 h-3 flex items-center justify-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "▼" : "▶"}
        </button>

        {/* Folder content */}
        <div
          ref={setDroppableRef}
          className="flex items-center gap-1 cursor-pointer flex-grow min-w-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-sm shrink-0">{isExpanded ? "📂" : "📁"}</span>
          <span className="text-white text-xs truncate flex-grow">
            {bookmark.title}
          </span>
          {childCount > 0 && (
            <span className="text-white/40 text-xs shrink-0 bg-white/10 px-1 rounded">
              {childCount}
            </span>
          )}
        </div>

        {/* Delete button */}
        <button
          className="text-white/30 hover:text-white/80 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(bookmark.id);
          }}
        >
          ✕
        </button>
      </div>

      {/* Дочерние элементы - в grid layout для компактности */}
      {isExpanded && bookmark.children && bookmark.children.length > 0 && (
        <div className="ml-4 mt-1 pl-2 border-l border-white/10">
          <div className="flex flex-wrap gap-1">
            {bookmark.children.map((child) => (
              <Sortable id={child.id} key={child.id}>
                {({ listeners, attributes, setDroppableRef }) =>
                  child.isFolder ? (
                    <FolderBookmark
                      bookmark={child}
                      listeners={listeners}
                      attributes={attributes}
                      setDroppableRef={setDroppableRef}
                      onDelete={onDelete}
                    />
                  ) : (
                    <LinkBookmark
                      bookmark={child}
                      listeners={listeners}
                      attributes={attributes}
                      setDroppableRef={setDroppableRef}
                      onDelete={onDelete}
                    />
                  )
                }
              </Sortable>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

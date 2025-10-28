import { type Bookmark } from '../../types/types'
import { LinkBookmark } from './linkBookmark'
import { useState } from 'preact/hooks'
import { Sortable } from '@/features/bookmarks/bookmarkSort'

export function FolderBookmark({
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
  const [isExpanded, setIsExpanded] = useState(false)
  const childCount = bookmark.children?.length || 0

  return (
    <div className=" bg-white/10 w-[100vw] max-w-[300px] rounded-lg hover:bg-white/20">
      {/* Main element folder */}
      <div className="flex items-center gap-1 px-2 py-1 transition group">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab text-white/30 select-none hover:text-white/60 text-xl text-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          {...listeners}
          {...attributes}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          ⋮⋮
        </button>

        {/* Folder content */}
        <div
          ref={setDroppableRef}
          className="flex items-center gap-1 cursor-pointer flex-grow min-w-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-sm select-none shrink-0">
            {isExpanded ? '📂' : '📁'}
          </span>
          <span className="text-white text-xs truncate flex-grow">
            {bookmark.title}
          </span>
          {childCount > 0 && (
            <span className="text-white/40 text-xs select-none shrink-0 bg-white/10 px-1 rounded">
              {childCount}
            </span>
          )}
        </div>

        {/* Expand button */}
        <button
          className="text-white/60 hover:text-white select-none text-xs shrink-0 w-3 h-3 flex items-center justify-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {/* Edit button */}
        <button
          className="text-white/30 select-none hover:text-white/80 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onEdit(bookmark.title, bookmark.id)
          }}
        >
          🖊
        </button>

        {/* Delete button */}
        <button
          className="text-white/30 select-none hover:text-white/80 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(bookmark.id)
          }}
        >
          🗑
        </button>
      </div>

      {/* Child elements - in grid layout for compactness */}
      {isExpanded && bookmark.children && bookmark.children.length > 0 && (
        <div className=" mt-1 rounded-2xl">
          <div className="flex-row gap-1">
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
                      onEdit={onEdit}
                    />
                  ) : (
                    <LinkBookmark
                      bookmark={child}
                      listeners={listeners}
                      attributes={attributes}
                      setDroppableRef={setDroppableRef}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  )
                }
              </Sortable>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

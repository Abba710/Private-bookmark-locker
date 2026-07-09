import { type Bookmark } from "../../types/types";
import { LinkBookmark } from "./linkBookmark";
import { useState } from "preact/hooks";
import { Sortable } from "@/features/bookmarks/bookmarkSort";
import ContextMenu from "@/components/contextMenu/contextMenu";
import {
  Folder,
  FolderOpen,
  GripVertical,
  Pencil,
  Trash2,
  Menu,
} from "lucide-react";

export function FolderBookmark({
  bookmark,
  listeners,
  attributes,
  setDroppableRef,
  onDelete,
  onEdit,
}: {
  bookmark: Bookmark;
  listeners: any;
  attributes: any;
  setDroppableRef: (node: HTMLElement | null) => void;
  onDelete: (id: string) => void;
  onEdit: (title: string | undefined, id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childCount = bookmark.children?.length || 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  function handleMenuClick(
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuVisible(true);
  }

  return (
    <div className="flex flex-col gap-0.5 w-full">
      <div
        className={`
          relative flex items-center gap-0 h-full max-h-[100px] w-[100vw] max-w-[350px] px-2 py-1 transition-all duration-300 group border overflow-y-auto
          ${
            isExpanded
              ? "bg-white/[0.08] border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
              : "bg-white/[0.04] border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10"
          }
        `}
        onContextMenu={(e) => {
          handleMenuClick(e);
        }}
      >
        {/* Drag Handle */}
        <button
          className="absolute left-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-white/20 hover:text-white p-0.5 z-10"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="w-3 h-3" />
        </button>

        <div
          ref={setDroppableRef}
          className="flex items-center gap-2 cursor-pointer flex-grow min-w-0 pl-1 group-hover:pl-2.5 transition-all duration-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-[#1a1a1a] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-colors">
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </div>

          <div className="flex flex-col justify-center min-w-0 flex-grow transition-all duration-300">
            <span className="text-white text-[12px] font-semibold truncate group-hover:text-indigo-300 transition-colors">
              {bookmark.title}
            </span>
          </div>

          {childCount > 0 && !isExpanded && (
            <span className="text-[10px] font-mono text-gray-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/5 shrink-0 transition-opacity group-hover:opacity-0">
              {childCount}
            </span>
          )}
        </div>

        {/* ACTIONS & TOGGLE: Slide in together */}
        <div className="flex items-center w-0 group-hover:w-[78px] opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden shrink-0">
          <div className="flex items-center gap-0 pl-1 border-l border-white/5">
            <button
              className="p-1 text-gray-500 hover:text-emerald-400 cursor-pointer transition-colors"
              onClick={(e) => handleMenuClick(e)}
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark.title, bookmark.id);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bookmark.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && bookmark.children && (
        <div className="flex flex-col max-h-[300px] gap-1 w-full border-l-2 bg-white/[0.08] border-indigo-500 my-1 shadow-[0_0_10px_rgba(99,102,241,0.1)] overflow-y-auto">
          {bookmark.children.map((child) => (
            <Sortable id={child.id} key={child.id}>
              {(props) =>
                child.isFolder ? (
                  <FolderBookmark
                    {...props}
                    bookmark={child}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ) : (
                  <LinkBookmark
                    {...props}
                    bookmark={child}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                )
              }
            </Sortable>
          ))}
        </div>
      )}

      {menuVisible && (
        <ContextMenu
          bookmark={bookmark}
          position={menuPos}
          onClose={() => setMenuVisible(false)}
          onOpenModal={() => {}}
        />
      )}
    </div>
  );
}

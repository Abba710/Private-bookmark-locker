import { type Bookmark } from "../../types/types";
import { LinkBookmark } from "./linkBookmark";
import { useState } from "preact/hooks";
import { Sortable } from "@/features/bookmarks/bookmarkSort";
import ContextMenu from "@/components/contextMenu/contextMenu";
import {
  computeFolderMetrics,
  type BookmarkRowSettings,
  type FolderRowSettings,
} from "@/components/settings/bookmarks/controls.tsx";

import {
  Folder,
  FolderOpen,
  GripVertical,
  Pencil,
  Trash2,
  Menu,
  Check,
} from "lucide-react";

export function FolderBookmark({
  bookmark,
  listeners,
  attributes,
  setDroppableRef,
  onDelete,
  confirmDeleteId,
  onEdit,
  settingsFolder,
  settingsBookmark,
}: {
  bookmark: Bookmark;
  listeners: any;
  attributes: any;
  setDroppableRef: (node: HTMLElement | null) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onEdit: (title: string | undefined, id: string) => void;
  settingsFolder: FolderRowSettings;
  settingsBookmark: BookmarkRowSettings;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childCount = bookmark.children?.length || 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const { icon, font, actionIcon, dragIcon } = computeFolderMetrics(settingsFolder.height);

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
        style={{ height: settingsFolder.height }}
        className={`
          relative flex items-center gap-0 max-h-[100px] w-[100vw] max-w-[350px] px-2 py-1 transition-all duration-300 group border overflow-hidden
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
          <GripVertical style={{ width: dragIcon, height: dragIcon }} />
        </button>

        <div
          ref={setDroppableRef}
          className="flex items-center gap-2 cursor-pointer flex-grow min-w-0 pl-1 group-hover:pl-2.5 transition-all duration-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {settingsFolder.iconEnabled && (
            <div  style={{ width: icon + 2, height: icon + 2 }} className="flex-shrink-0 rounded-md bg-[#1a1a1a] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-colors">
              {isExpanded ? (
                <FolderOpen style={{ width: icon * 0.58, height: icon * 0.58 }}  className="text-indigo-400" />
              ) : (
                <Folder style={{ width: icon * 0.58, height: icon * 0.58 }}  className="text-indigo-400" />
              )}
            </div>
          )}

          <div className="flex flex-col justify-center min-w-0 flex-grow transition-all duration-300">
            <span style={{ fontSize: font }} className="text-white font-semibold truncate group-hover:text-indigo-300 transition-colors">
              {bookmark.title}
            </span>
          </div>

          {childCount > 0 && !isExpanded && (
            <span style={{ fontSize: Math.max(font - 2, 8) }} className="font-mono text-gray-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/5 shrink-0 transition-opacity group-hover:opacity-0">
              {childCount}
            </span>
          )}
        </div>

        {/* ACTIONS & TOGGLE: Slide in together */}
        <div style={{ "--actions-width": `${(actionIcon * 3) + 25}px` } as React.CSSProperties} className={`flex items-center w-0 group-hover:w-[var(--actions-width)] opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden shrink-0`}>
          <div className="flex items-center gap-0 pl-1 border-l border-white/5">
            <button
              className="p-1 text-gray-500 hover:text-emerald-400 cursor-pointer transition-colors"
              onClick={(e) => handleMenuClick(e)}
            >
              <Menu style={{ width: actionIcon, height: actionIcon }} />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark.title, bookmark.id);
              }}
            >
              <Pencil style={{ width: actionIcon, height: actionIcon }} />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bookmark.id);
              }}
            >
              {confirmDeleteId === bookmark.id ? <Check style={{ width: actionIcon, height: actionIcon }} /> : <Trash2 style={{ width: actionIcon, height: actionIcon }} />}
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
                    confirmDeleteId={confirmDeleteId}
                    onEdit={onEdit}
                    settingsFolder={settingsFolder}
                    settingsBookmark={settingsBookmark}
                  />
                ) : (
                  <LinkBookmark
                    {...props}
                    bookmark={child}
                    onDelete={onDelete}
                    confirmDeleteId={confirmDeleteId}
                    onEdit={onEdit}
                    settingsBookmark={settingsBookmark}
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

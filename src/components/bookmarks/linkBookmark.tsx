import { type Bookmark } from "@/types/types";
import ContextMenu from "@/components/contextMenu/contextMenu";
import { useState } from "preact/hooks";
import { GripVertical, Pencil, Trash2, Globe, Menu, Check } from "lucide-react";
import { computeBookmarkMetrics, type BookmarkRowSettings } from "@/components/settings/bookmarks/controls";


export function LinkBookmark({
  bookmark,
  listeners,
  attributes,
  setDroppableRef,
  onDelete,
  confirmDeleteId,
  onEdit,
  settingsBookmark,
}: {
  bookmark: Bookmark;
  listeners: any;
  attributes: any;
  setDroppableRef: (node: HTMLElement | null) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onEdit: (title: string | undefined, id: string) => void;
  settingsBookmark: BookmarkRowSettings;
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const { icon, titleFont, urlFont, actionIcon, dragIcon } = computeBookmarkMetrics(settingsBookmark.height)

  const getFaviconUrl = (url?: string) => {
    if (!url) return "";
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return "";
    }
  };

  const getDomain = (url?: string) => {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  function handleMenuClick(
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuVisible(true);
  }

  return (
    <div
      style={{ height: settingsBookmark.height }}
      className="group relative flex items-center gap-0 w-[100vw] max-w-[350px] min-h-[36px] px-2 py-1 bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 overflow-hidden"
      onContextMenu={(e) => handleMenuClick(e)}
    >
      {/* Drag handle - Absolute positioned to not take space */}
      <div
        className="absolute left-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-white/20 hover:text-white p-0.5 z-10"
        {...listeners}
        {...attributes}
      >
        <GripVertical style={{ width: dragIcon, height: dragIcon }} />
      </div>


        <a href={bookmark.url}
          onClick={(e) => {
            e.preventDefault();
            chrome.windows.getCurrent((window) => {
              if (window.incognito === bookmark.incognito) {
                chrome.tabs.create({ url: bookmark.url, windowId: window.id });
              } else {
                chrome.windows.create({
                  url: bookmark.url,
                  incognito: bookmark.incognito,
                });
              }
            });
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center select-none gap-2 flex-1 min-w-0 no-underline pl-1 group-hover:pl-2.5 transition-all duration-300"
          ref={setDroppableRef}
        >
        {settingsBookmark.iconEnabled && <div style={{ width: icon + 2, height: icon + 2 }} className="flex-shrink-0 rounded-md bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-indigo-500/30 transition-colors">
          {getFaviconUrl(bookmark.url) ? (
            <img
              src={getFaviconUrl(bookmark.url)}
              alt=""
              className="object-contain"
              style={{ width: icon * 0.58, height: icon * 0.58 }}
            />
          ) : (
            <Globe className="text-indigo-400/60" style={{ width: icon * 0.58, height: icon * 0.58 }} />
          )}
        </div>}

        {/* TEXT AREA: Grows and shrinks smoothly */}
        <div className="flex flex-col justify-center min-w-0 flex-1 transition-all duration-300">
          <span style={{ fontSize: titleFont }} className="text-white font-semibold truncate leading-tight group-hover:text-indigo-300 transition-colors">
            {bookmark.title || getDomain(bookmark.url)}
          </span>
          {settingsBookmark.showUrl && (<span style={{ fontSize: urlFont }} className="text-gray-400 truncate leading-none mt-0.5 font-medium opacity-80">
            {getDomain(bookmark.url)}
          </span>)}
        </div>
      </a>

      {/* DYNAMIC ACTIONS: Slide in effect */}
      <div style={{ "--actions-width": `${(actionIcon * 3) + 25}px` } as React.CSSProperties} className={`flex items-center w-0 group-hover:w-[var(--actions-width)] opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="flex items-center gap-0 pl-1 border-l border-white/5">
          <button
            className="p-1 text-gray-500 hover:text-emerald-400 cursor-pointer transition-colors"
            onClick={(e) => handleMenuClick(e)}
          >
            <Menu style={{ width: actionIcon, height: actionIcon }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(bookmark.title, bookmark.id);
            }}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer rounded-md transition-colors"
          >
            <Pencil style={{ width: actionIcon, height: actionIcon }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bookmark.id);
            }}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-md transition-colors"
          >
            {confirmDeleteId === bookmark.id ? <Check style={{ width: actionIcon, height: actionIcon }} /> : <Trash2 style={{ width: actionIcon, height: actionIcon }} />}
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
  );
}

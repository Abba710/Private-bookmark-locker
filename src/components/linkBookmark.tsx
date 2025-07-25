import { type Bookmark } from "@/types/types";

export function LinkBookmark({
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
  // Извлекаем favicon из URL
  const getFaviconUrl = (url?: string) => {
    if (!url) return "🔗";
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return "🔗";
    }
  };

  // Извлекаем домен для отображения
  const getDomain = (url?: string) => {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="flex items-center gap-1 min-h-[32px] w-[300px] px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition group">
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

      {/* Link content */}
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
        className="flex items-center gap-1 no-underline flex-grow min-w-0"
        ref={setDroppableRef}
        title={`${bookmark.title}\n${bookmark.url}`}
      >
        {/* Favicon */}
        <img
          src={getFaviconUrl(bookmark.url)}
          alt=""
          className="w-3 h-3 shrink-0"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            const sibling = img.nextElementSibling as HTMLElement | null;

            img.style.display = "none";
            if (sibling) sibling.style.display = "inline";
          }}
        />
        <span className="text-xs shrink-0 hidden">🔗</span>

        {/* Title and domain */}
        <div className="flex flex-col justify-center min-w-0 flex-grow">
          <span className="text-white text-xs truncate leading-tight">
            {bookmark.title || getDomain(bookmark.url)}
          </span>
          {bookmark.title && (
            <span className="text-white/40 text-xs truncate leading-tight">
              {getDomain(bookmark.url)}
            </span>
          )}
        </div>

        {/* Incognito indicator */}
        {bookmark.incognito && (
          <span className="text-white/50 text-xs shrink-0">🕶️</span>
        )}
      </a>

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
  );
}

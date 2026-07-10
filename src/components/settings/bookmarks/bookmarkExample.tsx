import { GripVertical, Pencil, Trash2, Menu } from "lucide-react";
import {
  computeBookmarkMetrics,
  type BookmarkRowSettings,
} from "./controls.tsx";

interface BookmarkExampleProps {
  settings: BookmarkRowSettings;
  name: string;
  url: string;
}

function BookmarkExample({ settings, name, url }: BookmarkExampleProps) {
  const { icon, titleFont, urlFont, actionIcon, dragIcon } = computeBookmarkMetrics(settings.height);

  return (
    <div
      style={{ height: settings.height }}
      className="group relative flex items-center gap-0 w-full px-2 bg-white/[0.04] border border-white/[0.05] overflow-hidden"
    >
      {/* Drag handle */}
      <div className="absolute left-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 p-0.5 z-10">
        <GripVertical style={{ width: dragIcon, height: dragIcon }} />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0 pl-1 group-hover:pl-2.5 transition-all duration-300">
        {settings.iconEnabled && (
          <div
            className="flex-shrink-0 rounded-md bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-indigo-500/30 transition-colors"
            style={{ width: icon + 2, height: icon + 2 }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
              alt=""
              className="object-contain"
              style={{ width: icon * 0.58, height: icon * 0.58 }}
            />
          </div>
        )}

        <div className="flex flex-col justify-center min-w-0 flex-1 transition-all duration-300">
          <span
            style={{ fontSize: titleFont }}
            className="text-white font-semibold truncate leading-tight group-hover:text-indigo-300 transition-colors"
          >
            {name}
          </span>
          {settings.showUrl && (
            <span
              style={{ fontSize: urlFont }}
              className="text-gray-400 truncate leading-none mt-0.5 font-medium opacity-80"
            >
              {url}
            </span>
          )}
        </div>
      </div>

      {/* Preview actions */}
      <div className="flex items-center w-0 group-hover:w-[78px] opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden shrink-0">
        <div className="flex items-center gap-0 pl-1 border-l border-white/5">
          <button disabled className="p-1 text-gray-500 cursor-default">
            <Menu style={{ width: actionIcon, height: actionIcon }} />
          </button>
          <button disabled className="p-1 text-gray-400 rounded-md">
            <Pencil style={{ width: actionIcon, height: actionIcon }} />
          </button>
          <button disabled className="p-1 text-gray-400 rounded-md">
            <Trash2 style={{ width: actionIcon, height: actionIcon }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkExample;

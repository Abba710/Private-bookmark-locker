import { Folder, GripVertical, Pencil, Trash2, Menu } from "lucide-react";
import {
  computeFolderMetrics,
  type FolderRowSettings,
} from "./controls.tsx";

interface FolderExampleProps {
  settings: FolderRowSettings;
  name: string;
  count: number;
}

function FolderExample({ settings, name, count }: FolderExampleProps) {
  const { icon, font, actionIcon, dragIcon } = computeFolderMetrics(settings.height);

  return (
    <div className="flex flex-col gap-0.5 w-full">
      <div
        style={{ height: settings.height }}
        className="relative flex items-center gap-0 w-full px-2 bg-white/[0.04] border border-white/[0.05] overflow-hidden group"
      >
        {/* Drag Handle */}
        <div className="absolute left-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 p-0.5 z-10">
          <GripVertical style={{ width: dragIcon, height: dragIcon }} />
        </div>

        <div className="flex items-center gap-2 flex-grow min-w-0 pl-1 group-hover:pl-2.5 transition-all duration-300">
          {settings.iconEnabled && (
            <div
              className="flex-shrink-0 rounded-md bg-[#1a1a1a] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-colors"
              style={{ width: icon + 2, height: icon + 2 }}
            >
              <Folder style={{ width: icon * 0.58, height: icon * 0.58 }} className="text-indigo-400" />
            </div>
          )}

          <div className="flex flex-col justify-center min-w-0 flex-grow">
            <span
              style={{ fontSize: font }}
              className="text-white font-semibold truncate group-hover:text-indigo-300 transition-colors"
            >
              {name}
            </span>
          </div>

          <span
            style={{ fontSize: Math.max(font - 2, 8) }}
            className="font-mono text-gray-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/5 shrink-0 transition-opacity group-hover:opacity-0"
          >
            {count}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center w-0 group-hover:w-[78px] opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden shrink-0">
          <div className="flex items-center gap-0 pl-1 border-l border-white/5">
            <button disabled className="p-1 text-gray-500">
              <Menu style={{ width: actionIcon, height: actionIcon }} />
            </button>
            <button disabled className="p-1 text-gray-400">
              <Pencil style={{ width: actionIcon, height: actionIcon }} />
            </button>
            <button disabled className="p-1 text-gray-400">
              <Trash2 style={{ width: actionIcon, height: actionIcon }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FolderExample;

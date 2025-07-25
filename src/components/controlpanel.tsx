import {
  createBookmarkFolder,
  saveCurrentPage,
} from "@/features/bookmarks/bookmarkService";
import { useSwitchStore } from "@/storage/statelibrary";

function ControlPanel() {
  const setSwitch = useSwitchStore((state) => state.setSwitch);

  return (
    <div className="flex items-center justify-center w-full rounded-2xl">
      <div className="flex gap-2">
        <button className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition">
          🔒
        </button>
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={() => setSwitch(false)}
        >
          👁
        </button>
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={() => setSwitch(true)}
        >
          🕵️
        </button>
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={() => {
            createBookmarkFolder();
          }}
        >
          📁
        </button>
        <button
          className="w-10 h-10 bg-white/20 rounded-xl flex text-2xl  items-center justify-center cursor-pointer hover:bg-white/30 transition"
          onClick={saveCurrentPage}
        >
          💾
        </button>
      </div>
    </div>
  );
}
export default ControlPanel;

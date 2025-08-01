import { useState } from "preact/hooks";
import ImportDialog from "@/components/ImportExport/import";
import ExportDialog from "@/components/ImportExport/export";
import { useBookmarkStore } from "@/storage/statelibrary";
import exportBookmarks from "@/features/importExport/export";
import { getChromeBookmarks } from "@/features/bookmarks/bookmarkService";
import { PremiumGate } from "@/features/premium/premiumGate";

export default function OptionsPanel() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  return (
    <div>
      {/* ✅ Container same as original */}
      <div className="w-full bg-white/10 rounded-2xl px-1 flex flex-col">
        {/* Import */}
        <PremiumGate action={() => setShowImport(true)}>
          <button className="flex items-center justify-between p-1 text-white/90 text-sm rounded-lg transition hover:bg-white/20 cursor-pointer w-full">
            <div className="flex items-center gap-2">
              <span>📥</span>
              <span>Import</span>
            </div>
          </button>
        </PremiumGate>

        {/* Export */}
        <PremiumGate action={() => setShowExport(true)}>
          <button className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full ">
            <div className="flex items-center gap-2">
              <span>📤</span>
              <span>Export</span>
            </div>
          </button>
        </PremiumGate>

        {/* Settings */}
        <PremiumGate action={() => alert("⚙️ Settings are coming soon")}>
          <button className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full ">
            <div className="flex items-center gap-2">
              <span>⚙️</span>
              <span>Settings</span>
            </div>
          </button>
        </PremiumGate>

        {/* Collect */}
        <PremiumGate action={() => getChromeBookmarks()}>
          <button className="flex items-center justify-between text-white/90 text-sm p-1 rounded-lg transition hover:bg-white/20 cursor-pointer w-full ">
            <div className="flex items-center gap-2">
              <span>🔃</span>
              <span>Collect</span>
            </div>
          </button>
        </PremiumGate>
      </div>

      {/* ✅ Import/Export Modals */}
      {showImport && <ImportDialog onClose={() => setShowImport(false)} />}
      {showExport && (
        <ExportDialog
          onClose={() => setShowExport(false)}
          onExport={() => {
            exportBookmarks(bookmarks);
            setShowExport(false);
          }}
        />
      )}
    </div>
  );
}

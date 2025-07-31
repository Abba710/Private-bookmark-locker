import { useState } from "preact/hooks";
import ImportDialog from "@/components/ImportExport/import";
import ExportDialog from "@/components/ImportExport/export";
import { useBookmarkStore } from "@/storage/statelibrary";
import exportBookmarks from "@/features/importExport/export";
import { getChromeBookmarks } from "@/features/bookmarks/bookmarkService";

const options = [
  { label: "Import", icon: "📥", premium: true, action: "import" },
  { label: "Export", icon: "📤", premium: true, action: "export" },
  { label: "Settings", icon: "⚙️", premium: true, action: "settings" },
  { label: "Collect", icon: "🔃", premium: true, action: "Collect" },
];

export default function OptionsPanel() {
  // States for dialogs
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Example: flag for premium user (true = user has premium)
  const isPremiumUser = true;

  // Action handler
  const handleAction = (opt: (typeof options)[number]) => {
    if (opt.premium && !isPremiumUser) {
      alert("🚫 This feature is available for Premium users only.");
      return;
    }
    switch (opt.action) {
      case "import":
        setShowImport(true);
        break;
      case "export":
        setShowExport(true);
        break;
      case "settings":
        alert("⚙️ Settings are cooming soon");
        break;
      case "Collect":
        getChromeBookmarks();
        break;
    }
  };

  return (
    <div>
      {/* Panel with clickable options */}
      <div className="w-full px-4 py-3 bg-white/10 rounded-2xl flex flex-col gap-1">
        {options.map((opt, index) => (
          <button
            key={index}
            onClick={() => handleAction(opt)}
            disabled={opt.premium && !isPremiumUser}
            className={`flex items-center justify-between text-white/90 text-sm px-1 rounded-lg transition
              ${
                opt.premium && !isPremiumUser
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-white/20 cursor-pointer"
              }`}
          >
            <div className="flex items-center gap-2">
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </div>
            {opt.premium && <span className="text-white/40">👑</span>}
          </button>
        ))}
      </div>

      {/* Modals */}
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

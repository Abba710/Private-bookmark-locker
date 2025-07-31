import { handleFileImport } from "@/features/importExport/import";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "preact/hooks";

export default function ImportDialog({ onClose }: { onClose: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: "import-dropzone" });
  const [dragActive, setDragActive] = useState(false);

  // Handle drag over
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Handle file drop
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileImport(file, onClose); // ✅ Auto close modal
    }
  };

  // Clickable hidden input
  const triggerFileInput = () => {
    const input = document.getElementById(
      "importFileInput"
    ) as HTMLInputElement;
    if (input) input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg w-[400px] p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">📥 Import Bookmarks</h2>

        {/* Dropzone / Upload area */}
        <div
          ref={setNodeRef}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border rounded-lg p-6 text-center cursor-pointer transition
            ${
              dragActive || isOver
                ? "border-blue-400 bg-white/20"
                : "border-white/30 hover:bg-white/10"
            }`}
        >
          <p className="text-sm text-white/70">
            Drag & drop your file here or click to select
          </p>

          {/* Hidden input for manual file selection */}
          <input
            id="importFileInput"
            type="file"
            className="hidden"
            accept=".json"
            aria-label="Select JSON file to import bookmarks" // ✅ accessibility
            onChange={(e) => {
              const input = e.target as HTMLInputElement | null;
              if (input?.files && input.files[0]) {
                handleFileImport(input.files[0], onClose);
              }
            }}
          />
        </div>

        {/* Cancel button only */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

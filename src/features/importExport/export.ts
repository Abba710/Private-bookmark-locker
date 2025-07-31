import type { Bookmark } from "@/types/types";
export default function exportBookmarks(bookmarks: Bookmark[]) {
  // Convert bookmarks to JSON
  const data = JSON.stringify(bookmarks, null, 2);

  // Create a blob
  const blob = new Blob([data], { type: "application/json" });

  // Create a download link
  const url = URL.createObjectURL(blob);

  // Create temporary <a> element
  const a = document.createElement("a");
  a.href = url;
  a.download = "bookmarks.json"; // file name
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

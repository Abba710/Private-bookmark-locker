import type { Bookmark } from "@/types/types";
import { useBookmarkStore, useSwitchStore } from "@/storage/statelibrary";

export function saveCurrentPage() {
  const setBookmarks = useBookmarkStore.getState().setBookmarks;

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const { url, title, incognito } = tab;

    const bookmarks = await loadBookmarks();
    if (!bookmarks.some((b) => b.url === url)) {
      const id = crypto.randomUUID(); // Generate a unique ID for the bookmark
      bookmarks.push({ id, url, title, incognito });

      chrome.storage.local.set({ bookmarks }, () => {
        setBookmarks(bookmarks);
      });
    }
  });
}
export function loadBookmarks(): Promise<Bookmark[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["bookmarks"], (result) => {
      const bookmarks = (result.bookmarks as Bookmark[]) || [];
      resolve(bookmarks);
    });
  });
}

function removeById(list: Bookmark[], id: string): Bookmark[] {
  return list
    .filter((b) => b.id !== id)
    .map((b) =>
      b.children ? { ...b, children: removeById(b.children, id) } : b
    );
}

export function deleteBookmarks(bookmarks: Bookmark[], id?: string) {
  if (!id) return;

  const updated = removeById(bookmarks, id);

  chrome.storage.local.set({ bookmarks: updated }, () => {
    useBookmarkStore.getState().setBookmarks(updated);
  });
}

export function createBookmarkFolder() {
  const folderName = prompt("Enter folder name:");
  if (folderName === null) return;

  const bookmarks = useBookmarkStore.getState().bookmarks;
  const newFolder: Bookmark = {
    id: crypto.randomUUID(),
    title: folderName || "",
    incognito: useSwitchStore.getState().Switch,
    isFolder: true,
    children: [],
  };

  const updated = [...bookmarks, newFolder];
  chrome.storage.local.set({ bookmarks: updated }, () => {
    useBookmarkStore.getState().setBookmarks(updated);
  });
}

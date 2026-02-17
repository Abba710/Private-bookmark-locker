import { useBookmarkStore } from '@/storage/statelibrary'
import type { Bookmark } from '@/types/types'
import {
  loadBookmarks,
  withTimestamp,
} from '@/features/bookmarks/bookmarkService'

export async function saveInCurrentFolder(folder: Bookmark) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0]
    if (!tab) return
    const { url, title, incognito } = tab

    const bookmarks = await loadBookmarks()

    // Check if this bookmark already exists in the folder
    const children = folder.children || []
    if (children.some((child) => child.url === url)) return

    // Recursively update the folder in the tree
    function updateFolder(list: Bookmark[]): Bookmark[] {
      return list.map((b) => {
        if (b.id === folder.id) {
          const id = crypto.randomUUID()
          const dateAdded = Date.now()
          const newBookmark = withTimestamp({
            id,
            url,
            title,
            incognito,
            dateAdded,
          })

          return withTimestamp({
            ...b,
            children: [...(b.children || []), newBookmark],
          })
        }

        if (b.children) {
          return { ...b, children: updateFolder(b.children) }
        }

        return b
      })
    }

    const updated = updateFolder(bookmarks)

    chrome.storage.local.set({ bookmarks: updated }, () => {
      useBookmarkStore.getState().setBookmarks(updated)
    })
  })
}

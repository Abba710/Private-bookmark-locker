import { useBookmarkStore } from '@/storage/statelibrary'

async function deleteBookmarks() {
  const updated: any = []
  chrome.storage.local.set({ bookmarks: updated }, () => {
    useBookmarkStore.getState().setBookmarks(updated)
  })
}

export default deleteBookmarks

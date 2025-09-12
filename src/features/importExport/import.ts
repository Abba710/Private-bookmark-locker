import { loadBookmarks } from '../bookmarks/bookmarkService'
import { useBookmarkStore } from '@/storage/statelibrary'
import type { Bookmark } from '@/types/types'

/**
 * Imports bookmarks from a JSON string.
 * - Merges imported bookmarks with existing ones.
 * - Avoids duplicates (based on URL).
 * - Saves merged data to chrome.storage.
 * - Updates Zustand store to trigger UI re-render.
 */
export async function importBookmarks(importedData: string) {
  try {
    // Parse JSON from the imported file
    const imported: Bookmark[] = JSON.parse(importedData)

    // Load current bookmarks from storage
    const existing: Bookmark[] = await loadBookmarks()

    // Create a new merged array (important for reactivity)
    const merged: Bookmark[] = [...existing]
    for (const b of imported) {
      if (!merged.some((eb) => eb.url === b.url)) {
        merged.push({
          id: crypto.randomUUID(),
          url: b.url,
          title: b.title || 'Untitled',
          incognito: b.incognito ?? false,
          isFolder: b.isFolder ?? false,
          children: b.children ? b.children : undefined,
        })
      }
    }

    // Save updated list to chrome.storage
    chrome.storage.local.set({ bookmarks: merged }, () => {
      console.log('✅ Imported bookmarks saved to storage')
    })

    // ✅ Update Zustand store to trigger UI refresh
    useBookmarkStore.getState().setBookmarks(merged)

    return merged
  } catch (err) {
    console.error('❌ Failed to import bookmarks:', err)
    throw err
  }
}

/**
 * Reads a selected .json file and triggers bookmark import.
 * - Uses FileReader to read the file content.
 * - Passes the content to importBookmarks().
 */
export function handleFileImport(file: File, onClose?: () => void) {
  const reader = new FileReader()

  reader.onload = async (e) => {
    const text = e.target?.result as string
    await importBookmarks(text)
    alert('✅ Bookmarks imported successfully!')

    // ✅ Close modal if callback provided
    if (onClose) onClose()
  }

  reader.readAsText(file)
}

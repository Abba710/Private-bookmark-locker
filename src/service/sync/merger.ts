// src/service/sync/merger.ts
import type { Bookmark } from '@/types/types'

export function mergeBookmarks(
  local: Bookmark[],
  server: Bookmark[]
): Bookmark[] {
  const urlMap = new Map<string, Bookmark>()
  const folderMap = new Map<string, Bookmark>()

  // 1. Process server bookmarks (they act as the "base")
  for (const b of server) {
    if (b.isFolder) folderMap.set(b.id, b)
    else if (b.url) urlMap.set(b.url, b)
  }

  // 2. Overlay local bookmarks (priority based on dateAdded)
  for (const b of local) {
    if (b.isFolder) {
      const existing = folderMap.get(b.id)
      if (existing) {
        // Recursive folder merge
        const mergedChildren = mergeBookmarks(
          b.children || [],
          existing.children || []
        )
        folderMap.set(b.id, { ...existing, children: mergedChildren })
      } else {
        folderMap.set(b.id, b)
      }
    } else if (b.url) {
      const existing = urlMap.get(b.url)
      // If the local bookmark is newer or doesn't exist on the server -> take the local one
      if (
        !existing ||
        (b.dateAdded && existing.dateAdded && b.dateAdded > existing.dateAdded)
      ) {
        urlMap.set(b.url, b)
      }
    }
  }

  return [...Array.from(folderMap.values()), ...Array.from(urlMap.values())]
}

export function countBookmarks(bookmarks: Bookmark[]): number {
  return bookmarks.reduce(
    (acc, b) => acc + 1 + (b.children ? countBookmarks(b.children) : 0),
    0
  )
}

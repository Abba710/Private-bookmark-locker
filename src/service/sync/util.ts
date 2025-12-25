// src/service/sync/utils.ts
import type { Bookmark } from '@/types/types'

// Hashing to compare states
export async function hashBookmarks(bookmarks: Bookmark[]): Promise<string> {
  const json = JSON.stringify(bookmarks)
  const msgBuffer = new TextEncoder().encode(json)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function countBookmarks(bookmarks: Bookmark[]): number {
  return bookmarks.reduce(
    (acc, b) => acc + 1 + (b.children ? countBookmarks(b.children) : 0),
    0
  )
}

// Smart merge (Local + Server)
export function mergeBookmarks(
  local: Bookmark[],
  server: Bookmark[]
): Bookmark[] {
  const urlMap = new Map<string, Bookmark>()
  const folderMap = new Map<string, Bookmark>()

  // 1. Give priority to server folders for structure consistency
  for (const b of server) {
    if (b.isFolder) folderMap.set(b.id, b)
    else if (b.url) urlMap.set(b.url, b)
  }

  // 2. Overlay local changes
  for (const b of local) {
    if (b.isFolder) {
      const existing = folderMap.get(b.id)
      if (existing) {
        // Recursion for nested folders
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
      // If the local bookmark is newer or doesn't exist on the server
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

import { useCallback } from 'preact/hooks'
import { useBookmarkStore, useSubscribePlanStore } from '@/storage/statelibrary'
import type { Bookmark } from '@/types/types'

export default function useSubscription() {
  // 1. Select atomic values to prevent unnecessary re-renders
  const isPro = useSubscribePlanStore((state) => state.isPro)
  const isLoading = useSubscribePlanStore((state) => state.isLoading)
  const checkSubscription = useSubscribePlanStore(
    (state) => state.checkSubscription
  )

  // Get bookmarks to calculate limits
  const bookmarks = useBookmarkStore((state) => state.bookmarks)

  // 2. Business Logic: Folder Limits
  // Memoized to recalculate only when Pro status or Bookmarks change
  const canCreateFolders = useCallback((): boolean => {
    // If user is PRO, there are no limits
    if (isPro) return true

    /**
     * Helper function to recursively count all folders within the tree structure.
     * It traverses through the 'children' arrays to ensure nested folders are counted.
     * * @param items - Array of bookmarks or folders
     * @returns Total number of folders found
     */
    const countFoldersRecursive = (items: Bookmark[]): number => {
      return items.reduce((count, item) => {
        if (item.isFolder) {
          // Count the current folder and then check its children recursively
          const nestedFoldersCount = item.children
            ? countFoldersRecursive(item.children)
            : 0

          return count + 1 + nestedFoldersCount
        }

        // If it's not a folder (e.g., a simple bookmark), skip it
        return count
      }, 0)
    }

    // Calculate the total number of folders across the entire hierarchy
    const totalFolderCount = countFoldersRecursive(bookmarks)

    // Free tier limit: Allow creation only if total folders are less than 3
    return totalFolderCount < 3
  }, [isPro, bookmarks])

  // 3. Helper: "I paid, check now"
  // Wraps the store action for easy use in UI
  const refreshSubscription = useCallback(async () => {
    await checkSubscription()
  }, [checkSubscription])

  return {
    isPro,
    isLoading,
    canCreateFolders,
    refreshSubscription,
  }
}

// src/service/sync/tombstoneService.ts
import type { Bookmark } from '@/types/types'
import { log } from './logger'

const STORAGE_KEY = 'deleted_ids'

export const TombstoneService = {
  /**
   * Records the ID of a deleted bookmark into local storage
   */
  async trackDeletion(id: string) {
    const data = await chrome.storage.local.get(STORAGE_KEY)
    const deletedIds: string[] = data[STORAGE_KEY] || []

    if (!deletedIds.includes(id)) {
      deletedIds.push(id)
      await chrome.storage.local.set({ [STORAGE_KEY]: deletedIds })
      log(`[Tombstone] Bookmark ${id} marked for remote deletion`)
    }
  },

  /**
   * Retrieves a list of all accumulated deletions
   */
  async getPendingDeletions(): Promise<string[]> {
    const data = await chrome.storage.local.get(STORAGE_KEY)
    return data[STORAGE_KEY] || []
  },

  /**
   * Clears the list of accumulated deletions
   */
  async clearDeletions() {
    await chrome.storage.local.remove(STORAGE_KEY)
    log('[Tombstone] All pending deletions cleared')
  },

  /**
   * Removes all nodes from the bookmark tree whose IDs are in the deleted list
   */
  filterTree(nodes: Bookmark[], deletedIds: string[]): Bookmark[] {
    if (deletedIds.length === 0) return nodes

    return nodes
      .filter((node) => !deletedIds.includes(node.id))
      .map((node) => ({
        ...node,
        children: node.children
          ? this.filterTree(node.children, deletedIds)
          : undefined,
      }))
  },
}

import type { Bookmark } from '@/types/types'

export interface SyncConfig {
  enableLogging: boolean
  timeThreshold: number
  changeThreshold: number
  debounceDelay: number
  maxRetries: number
  retryDelay: number
  offlineCheckInterval: number
}

export interface SyncState {
  isSyncing: boolean
  isOnline: boolean
  changeCounter: number
  lastSyncTime: number
  hasPendingChanges: boolean
  queuedSync: boolean
}

export interface EncryptedData {
  iv: string // Initialization Vector (public)
  content: string // Encrypted data (Base64)
}

export interface RemoteBookmarkPayload {
  user_id: string
  // Supports both legacy (unencrypted) and new encrypted data formats
  bookmarks: EncryptedData | Bookmark[]
  updated_at: string
}

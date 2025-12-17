import type { JSX } from 'preact/jsx-runtime'

export type Bookmark = {
  id: string
  url?: string
  title?: string
  incognito?: boolean
  isFolder?: boolean
  children?: Bookmark[]
}
export interface BookmarkStore {
  bookmarks: Bookmark[]
  setBookmarks: (bookmarks: Bookmark[]) => void
}

export interface SwitchStore {
  Switch: boolean
  setSwitch: (filtered: boolean) => void
}

export type DraggableItemProps = {
  id: string
  children: (props: {
    listeners: Record<string, any>
    attributes: Record<string, any>
    setDroppableRef?: (node: HTMLElement | null) => void
  }) => JSX.Element
}

export interface LockOverlayStore {
  isLocked: boolean
  mode: 'unlock' | 'setup'
  setIsLocked: (locked: boolean) => void
  setMode: (mode: 'unlock' | 'setup') => void
}

export interface FeedbackStore {
  showFeedback: boolean
  setShowFeedback: (show: boolean) => void
}

export type StorageSchema = {
  bookmarks: Bookmark[]
}

export type StorageChanges<T> = {
  [K in keyof T]?: {
    oldValue?: T[K]
    newValue?: T[K]
  }
}

export type supportDialogProps = {
  supportOpen: boolean
  setSupportOpen: (open: boolean) => void
}

export type notificationDialogProps = {
  notificationOpen: boolean
  setNotificationOpen: (open: boolean) => void
}

export interface User {
  id: string
  mail: string | undefined
}

export type plan = 'free' | 'pro'

export interface UserSubscription {
  plan: plan
  folderCount: number
  setFolderCount?: (count: number) => void
}

export interface usePremiumModalStoreProps {
  premiumModalOpen: boolean
  setPremiumModalOpen: (open: boolean) => void
}

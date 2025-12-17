import { useCallback, useState } from 'preact/hooks'
import type { UserSubscription, plan } from '@/types/types'
import { useBookmarkStore } from '@/storage/statelibrary'

export default function useSubscribe() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const [subscribe, setSubscribe] = useState<UserSubscription>({
    plan: 'free',
    folderCount: 3,
  })

  const canCreateFolders = useCallback((): boolean => {
    if (subscribe.plan !== 'free') return true

    const folderCount = bookmarks.filter((bookmark) => bookmark.isFolder).length

    return folderCount < 3
  }, [subscribe.plan, bookmarks])

  const canUseContextMenu = useCallback((): boolean => {
    return subscribe.plan !== 'free'
  }, [subscribe])

  const upgradePlan = useCallback((newPlan: plan): void => {
    setSubscribe((prev) => ({
      ...prev,
      plan: newPlan,
    }))
  }, [])

  return {
    subscribe,
    setSubscribe,
    canCreateFolders,
    canUseContextMenu,
    upgradePlan,
  }
}

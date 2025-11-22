import { useSupportDialogStore } from '@/storage/statelibrary'
import { useEffect } from 'react'

export function useCallSupport() {
  const setSupportOpen = useSupportDialogStore.getState().setSupportOpen

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)

    chrome.storage.local.get(
      { lastUsedDate: null, w: 7 },
      ({ lastUsedDate, w }) => {
        if (today === lastUsedDate) return

        const newW = w - 1

        if (newW <= 0) {
          setSupportOpen(true)
          chrome.storage.local.set({ lastUsedDate: today, w: 7 })
        } else {
          chrome.storage.local.set({ lastUsedDate: today, w: newW })
        }
      }
    )
  }, [])
}

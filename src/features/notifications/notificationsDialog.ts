import { useNotificationDialogStore } from '@/storage/statelibrary'
import { useEffect } from 'react'

export default function useNotificationsDialog() {
  const setNotificationOpen = useNotificationDialogStore(
    (state) => state.setNotificationOpen
  )

  useEffect(() => {
    // Check the flag in storage when the component mounts
    chrome.storage.local.get('showUpdateNotification').then((data) => {
      if (data.showUpdateNotification) {
        setNotificationOpen(true)
        // Reset the flag so the notification does not show again
        chrome.storage.local.set({ showUpdateNotification: false })
      }
    })
  }, [])
}

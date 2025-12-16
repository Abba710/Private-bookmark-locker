// downloadPdf.ts
import type { Bookmark } from '@/types/types'

export function downloadPdf(bookmark: Bookmark) {
  chrome.runtime.sendMessage(
    {
      action: 'downloadPDF',
      url: bookmark.url,
    },
    (response) => {
      if (response?.success) {
        console.log('PDF downloaded!')
      } else {
        console.error('Error:', response?.error)
      }
    }
  )
}

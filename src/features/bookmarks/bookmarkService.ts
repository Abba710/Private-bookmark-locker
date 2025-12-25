import type { Bookmark } from '@/types/types'
import {
  useBookmarkStore,
  useSwitchStore,
  useFeedbackStore,
  useSubscribePlanStore,
  usePremiumModalStore,
} from '@/storage/statelibrary'
import { TombstoneService } from '@/service/sync/tombstone'
import { supabase } from '@/service/supabase'

function withTimestamp(b: Bookmark): Bookmark {
  return { ...b, updatedAt: Date.now() }
}

export function saveCurrentPage() {
  const setBookmarks = useBookmarkStore.getState().setBookmarks

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0]
    if (!tab) return
    const { url, title, incognito } = tab

    const bookmarks = await loadBookmarks()
    if (!bookmarks.some((b) => b.url === url)) {
      const id = crypto.randomUUID()
      const dateAdded = Date.now()

      // Add updatedAt during creation
      bookmarks.push(withTimestamp({ id, url, title, incognito, dateAdded }))

      if (bookmarks.length % 5 === 0) feedbackCall()

      chrome.storage.local.set({ bookmarks }, () => {
        setBookmarks(bookmarks)
      })
    }
  })
}

export function loadBookmarks(): Promise<Bookmark[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['bookmarks'], (result) => {
      const bookmarks = (result.bookmarks as Bookmark[]) || []

      let updated = false

      const updatedBookmarks = bookmarks.map((b) => {
        if (!b.id) {
          updated = true
          return { ...b, id: crypto.randomUUID() }
        }
        return b
      })

      // If new uids were added, save them back
      if (updated) {
        chrome.storage.local.set({ bookmarks: updatedBookmarks })
      }

      resolve(updatedBookmarks)
    })
  })
}

function removeById(list: Bookmark[], id: string): Bookmark[] {
  return list
    .filter((b) => b.id !== id)
    .map((b) =>
      b.children ? { ...b, children: removeById(b.children, id) } : b
    )
}

export async function deleteBookmarks(bookmarks: Bookmark[], id?: string) {
  if (!id) return

  // CHECK: Create a tombstone only if the user is authorized
  const { data } = await supabase.auth.getSession()
  const isPro = useSubscribePlanStore.getState().isPro
  if (data.session?.user && !isPro) {
    await TombstoneService.trackDeletion(id)
  }

  // Delete locally (always performed, regardless of authorization)
  const updated = removeById(bookmarks, id)

  chrome.storage.local.set({ bookmarks: updated }, () => {
    useBookmarkStore.getState().setBookmarks(updated)
  })
}

function updateTitleById(
  list: Bookmark[],
  id: string,
  newTitle: string
): Bookmark[] {
  return list.map((b) =>
    b.id === id
      ? withTimestamp({ ...b, title: newTitle }) // Update timestamp when editing
      : b.children
      ? { ...b, children: updateTitleById(b.children, id, newTitle) }
      : b
  )
}

export function editBookmarkTitle(
  bookmarks: Bookmark[],
  title: string | undefined,
  id: string
) {
  const newTitle = prompt(
    `${chrome.i18n.getMessage('app_edit_title')}: ${title}`
  )
  if (newTitle === null) return

  const updated = updateTitleById(bookmarks, id, newTitle)

  chrome.storage.local.set({ bookmarks: updated }, () => {
    useBookmarkStore.getState().setBookmarks(updated)
  })
}

function createFolder(title: string, children: Bookmark[] = []): Bookmark {
  const dateAdded = Date.now()

  return withTimestamp({
    // Add timestamp to the folder
    id: crypto.randomUUID(),
    title,
    incognito: useSwitchStore.getState().Switch,
    isFolder: true,
    children,
    dateAdded,
  })
}

function addFolderToBookmarks(newFolder: Bookmark) {
  const bookmarks = useBookmarkStore.getState().bookmarks
  const updated = [...bookmarks, newFolder]

  chrome.storage.local.set({ bookmarks: updated }, () => {
    useBookmarkStore.getState().setBookmarks(updated)
  })
}

export function createBookmarkFolder() {
  const folderName = prompt(`${chrome.i18n.getMessage('app_create_folder')}`)
  if (folderName === null) return

  addFolderToBookmarks(createFolder(folderName || ''))
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'save_tabs') {
    const isPro = useSubscribePlanStore.getState().isPro
    const openPremiumModal = usePremiumModalStore.getState().setPremiumModalOpen
    if (!isPro) {
      openPremiumModal(true)
      return
    }
    addFolderToBookmarks(createFolder('', message.data))
  }
})

export function getChromeBookmarks() {
  chrome.runtime.sendMessage({ action: 'collect_bookmarks' }, (response) => {
    if (response?.data) {
      addFolderToBookmarks(createFolder('ChromeBookmarks', response.data))
    }
  })
}

export function saveAllOpenTabs() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  const folderName = `${day}.${month}.${year}  ${hours}:${minutes}`

  chrome.runtime.sendMessage({ action: 'save_all_open' }, (response) => {
    if (response?.data) {
      addFolderToBookmarks(createFolder(folderName, response.data))
    }
  })
}

function feedbackCall() {
  console.log('feedbackCall')
  const { setShowFeedback } = useFeedbackStore.getState()
  chrome.storage.local.get(['feedbackGiven'], (result) => {
    const feedbackGiven = Boolean(result.feedbackGiven)
    if (!feedbackGiven) {
      setShowFeedback(true)
    }
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'save_current_tab') {
    saveCurrentPage()
  }
})

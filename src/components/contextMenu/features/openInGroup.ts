import type { Bookmark } from '@/types/types'

export async function openBookmarkGroup(bookmark: Bookmark) {
  if (!bookmark.children || bookmark.children.length === 0) return

  const tabIds: number[] = []

  for (const child of bookmark.children) {
    if (!child.url) continue

    const tab = await chrome.tabs.create({
      url: child.url,
      active: true,
    })

    if (tab.id != null) {
      tabIds.push(tab.id)
    }
  }

  if (tabIds.length === 0) return

  const groupId = await chrome.tabs.group({
    tabIds: tabIds as [number, ...number[]],
  })

  await chrome.tabGroups.update(groupId, {
    title: bookmark.title || 'Unnamed group',
    collapsed: false,
  })
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab) return

      const url = tab.url
      const params = new URLSearchParams(new URL(url).search)
      const partnerId = params.get('aff')

      if (partnerId) {
        chrome.storage.local.set({ 'partner-id': partnerId })
        console.log('Partner ID:', partnerId)
      }
    })
    chrome.tabs.create({ url: 'https://abbablog.me/blog/quick-start' })
    await chrome.storage.local.set({ showImportChromeBookmarks: true })
  } else if (details.reason === 'update') {
    // Set a flag to show update notification
    await chrome.storage.local.set({ showUpdateNotification: true })
  }

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  console.log('Extension installed')
})

chrome.runtime.setUninstallURL('https://forms.gle/XpMKk9XjGLPMhhri8')

function getActiveTabs(callback) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const formatted = tabs.map((tab) => ({
      id: crypto.randomUUID(),
      incognito: tab.incognito || false,
      title: tab.title || 'Untitled',
      url: tab.url || '',
    }))
    callback(formatted)
  })
}

function sendTabsToUI() {
  getActiveTabs((bookmarks) => {
    chrome.runtime.sendMessage({ action: 'save_tabs', data: bookmarks })
  })
}

// ✅ Opens a new empty tab and closes all other tabs
function closeAllTabsButKeepOne() {
  // 1. Open a new blank tab
  chrome.tabs.create({ url: 'chrome://newtab' }, (newTab) => {
    const keepId = newTab.id

    // 2. Query all tabs in all windows
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      // 3. Collect IDs of all tabs except the newly created one
      const tabIds = tabs.map((t) => t.id).filter((id) => id && id !== keepId)

      // 4. Close all other tabs
      if (tabIds.length > 0) {
        chrome.tabs.remove(tabIds)
        console.log(`✅ Closed ${tabIds.length} tabs, kept one new tab`)
      }
    })
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'save_all_open') {
    getActiveTabs((bookmarks) => {
      sendResponse({ data: bookmarks })
    })
    return true // Indicates that we will send a response asynchronously
  }
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'close_all_tabs') {
    // Get all tabs in all windows
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const firstTabId = tabs[0]?.id
      if (!firstTabId) return

      // Open sidePanel on the first tab of the first window
      chrome.sidePanel.open({ tabId: firstTabId }).then(() => {
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: 'check_pro' }, (response) => {
            if (response?.reply === false) return

            // Execute actions for all tabs
            sendTabsToUI() // make sure your function handles all windows
            closeAllTabsButKeepOne() // also handle all windows
          })
        }, 100)
      })
    })
  }
})

function save_tab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id
    chrome.sidePanel
      .open({ tabId })
      .then(() => {
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: 'save_current_tab' })
        }, 100)
      })
      .catch((error) => {
        console.error('Failed to open side panel:', error)
      })
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'open_sidepanel') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      chrome.sidePanel.open({ tabId })
    })
  }
})
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save_tab') {
    console.log('alt+s pressed')
    save_tab()
  }
})

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'save_tab') {
    save_tab()
  }
})

// import chrome bookmakrs
function collectBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((nodes) => {
      const list = []

      function traverse(items) {
        for (const node of items) {
          if (node.url) {
            list.push({
              id: crypto.randomUUID(),
              incognito: false,
              title: node.title,
              url: node.url,
            })
          }
          if (node.children) traverse(node.children)
        }
      }

      traverse(nodes)
      resolve(list)
    })
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'collect_bookmarks') {
    collectBookmarks().then((bookmarks) => {
      sendResponse({ data: bookmarks })
    })
    return true
  }
})

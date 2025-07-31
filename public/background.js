chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

function getActiveTabs(callback) {
  chrome.tabs.query({}, (tabs) => {
    const formatted = tabs.map((tab) => ({
      id: crypto.randomUUID(),
      incognito: tab.incognito || false,
      title: tab.title || "Untitled",
      url: tab.url || "",
    }));
    callback(formatted);
  });
}

function sendTabsToUI() {
  getActiveTabs((bookmarks) => {
    chrome.runtime.sendMessage({ action: "save_tabs", data: bookmarks });
  });
}

// ✅ Opens a new empty tab and closes all other tabs
function closeAllTabsButKeepOne() {
  // 1. Open a new blank tab
  chrome.tabs.create({ url: "chrome://newtab" }, (newTab) => {
    const keepId = newTab.id;

    // 2. Query all tabs in all windows
    chrome.tabs.query({}, (tabs) => {
      // 3. Collect IDs of all tabs except the newly created one
      const tabIds = tabs.map((t) => t.id).filter((id) => id && id !== keepId);

      // 4. Close all other tabs
      if (tabIds.length > 0) {
        chrome.tabs.remove(tabIds);
        console.log(`✅ Closed ${tabIds.length} tabs, kept one new tab`);
      }
    });
  });
}

// ✅ Use it inside the command listener
chrome.commands.onCommand.addListener((command) => {
  if (command === "close_all_tabs") {
    sendTabsToUI(); // send all tabs to UI for saving
    closeAllTabsButKeepOne(); // close everything except one new tab
  }
});

// import chrome bookmakrs
function collectBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((nodes) => {
      const list = [];

      function traverse(items) {
        for (const node of items) {
          if (node.url) {
            list.push({
              id: crypto.randomUUID(),
              incognito: false,
              title: node.title,
              url: node.url,
            });
          }
          if (node.children) traverse(node.children);
        }
      }

      traverse(nodes);
      resolve(list);
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "collect_bookmarks") {
    collectBookmarks().then((bookmarks) => {
      sendResponse({ data: bookmarks });
    });
    return true;
  }
});

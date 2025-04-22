let panelWindow = null;
let activeTabId = null;

// Track active tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
});

// Register side panel on extension install
chrome.runtime.onInstalled.addListener(() => {
  // Set default side panel options
  chrome.sidePanel.setOptions({
    path: "popup.html",
    enabled: true,
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open side panel
  chrome.windows.getCurrent(async (window) => {
    await chrome.sidePanel.open({ windowId: window.id });
  });
});

// Handle window removal
chrome.windows.onRemoved.addListener((windowId) => {
  if (panelWindow && panelWindow.id === windowId) {
    panelWindow = null;
  }
});

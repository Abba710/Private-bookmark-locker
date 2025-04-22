let sidebar = null;
let sidebarVisible = false;

// Notify background script that content script is loaded
chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });

function createSidebar() {
  if (sidebar) return;

  sidebar = document.createElement("div");
  sidebar.id = "bookmark-save-sidebar";

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("popup.html");

  sidebar.appendChild(iframe);
  document.body.appendChild(sidebar);

  // Add margin to body when sidebar opens
  document.body.style.transition = "margin-right 0.3s ease-in-out";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleSidebar") {
    if (!sidebar) {
      createSidebar();
    }

    sidebarVisible = !sidebarVisible;
    sidebar.classList.toggle("visible");
    document.body.style.marginRight = sidebarVisible ? "400px" : "0";

    sendResponse({ success: true });
  }
  return true; // Important for async responses
});

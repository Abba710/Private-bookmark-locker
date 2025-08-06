// Public URL for your Firebase-hosted auth page
const _URL = "https://pbl-firebase-2f62e.web.app/";

// Create hidden iframe to run Firebase UI
const iframe = document.createElement("iframe");
iframe.src = _URL;
iframe.style.display = "none";
document.documentElement.appendChild(iframe);

// ✅ Handle LOGIN requests (from background.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "firebase-auth") {
    // Listen for a single response from the iframe
    function handleIframeMessage({ data }) {
      try {
        if (typeof data !== "string" || data.startsWith("!_{")) return; // ignore firebase internals
        const parsed = JSON.parse(data);
        globalThis.removeEventListener("message", handleIframeMessage);
        sendResponse(parsed);
      } catch (e) {
        console.error("Failed to parse iframe message", e);
        sendResponse({ error: e.message });
      }
    }

    globalThis.addEventListener("message", handleIframeMessage);

    // Tell the iframe to start auth flow
    iframe.contentWindow.postMessage({ initAuth: true }, new URL(_URL).origin);
    return true; // async
  }
});
// ✅ Handle LOGOUT requests (from background.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === "offscreen-auth" && message.action === "signout") {
    // Listen for response from iframe
    function handleIframeLogoutMessage({ data }) {
      try {
        // Use the same approach as for authentication
        if (typeof data === "object" && data !== null) {
          // Data is already an object - just use it
          globalThis.removeEventListener("message", handleIframeLogoutMessage);
          sendResponse(data);
        } else if (typeof data === "string") {
          // Data is a JSON string - parse it
          const parsed = JSON.parse(data);
          if (parsed.success) {
            console.log("Logout successful, reloading iframe");
            iframe.src = _URL;
          }
          globalThis.removeEventListener("message", handleIframeLogoutMessage);
          sendResponse(parsed);
        }
      } catch (e) {
        console.error("Failed to parse iframe logout message", e);
        sendResponse({ success: false, error: e.message });
      }
    }

    globalThis.addEventListener("message", handleIframeLogoutMessage);

    // Send logout request to iframe
    iframe.contentWindow.postMessage({ signOut: true }, new URL(_URL).origin);
    return true; // async
  }
});

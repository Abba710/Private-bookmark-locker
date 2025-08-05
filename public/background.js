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

// UNSCREEN document
const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// A global promise to avoid concurrency issues
let creatingOffscreenDocument;

// Chrome only allows for a single offscreenDocument. This is a helper function
// that returns a boolean indicating if a document is already active.
async function hasDocument() {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const matchedClients = await clients.matchAll();
  return matchedClients.some(
    (c) => c.url === chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)
  );
}

async function setupOffscreenDocument(path) {
  // If we do not have a document, we are already setup and can skip
  if (!(await hasDocument())) {
    // create offscreen document
    if (creatingOffscreenDocument) {
      await creatingOffscreenDocument;
    } else {
      creatingOffscreenDocument = chrome.offscreen.createDocument({
        url: path,
        reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
        justification: "authentication",
      });
      await creatingOffscreenDocument;
      creatingOffscreenDocument = null;
    }
  }
}

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

function getAuth() {
  return new Promise(async (resolve, reject) => {
    const auth = await chrome.runtime.sendMessage({
      type: "firebase-auth",
      target: "offscreen",
    });
    auth?.name !== "FirebaseError" ? resolve(auth) : reject(auth);
  });
}

async function firebaseAuth() {
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  const auth = await getAuth()
    .then((auth) => {
      console.log("User Authenticated", auth);
      return auth;
    })
    .catch((err) => {
      if (err.code === "auth/operation-not-allowed") {
        console.error(
          "You must enable an OAuth provider in the Firebase" +
            " console in order to use signInWithPopup. This sample" +
            " uses Google by default."
        );
      } else {
        console.error(err);
        return err;
      }
    })
    .finally(closeOffscreenDocument);

  return auth;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "firebase-googleauth") {
    firebaseAuth().then(sendResponse);
    return true;
  }

  if (message.type === "firebase-signout") {
    setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH).then(() => {
      chrome.runtime.sendMessage(
        { target: "offscreen-auth", action: "signout" },
        (response) => {
          sendResponse(response);
          closeOffscreenDocument();
        }
      );
    });
    return true;
  }
});

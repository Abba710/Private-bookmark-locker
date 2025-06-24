// Constants
const SESSION_UNLOCKED_KEY = "sessionUnlocked";
const BOOKMARK_COUNT_KEY = "bookmarkCount";
const FEEDBACK_DISABLED_KEY = "feedbackDisabled";
const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/private-bookmark-locker/fagjclghcmnfinjdkdnkejodfjgkpljd/reviews";
const BOOKMARK_SWITCH_KEY = "switchKey";

// DOMContentLoaded initialization
document.addEventListener("DOMContentLoaded", () => {
  localizeHtmlPage();
  initalizeSwitchButtons();
  bookmarkSwitch(false); // Default to basic bookmarks
  initializePopup();
  initializeLock();
  initializeFeedback();
  turnOffWarning();
  trunOffInstructions();
});

function turnOffWarning() {
  const warning = document.getElementById("passwordWarning");
  chrome.storage.local.get(["hash", "salt"], (result) => {
    const passwordSet = result.hash && result.salt;
    if (passwordSet) {
      warning.classList.add("hidden");
    }
  });
}

function trunOffInstructions() {
  const instructions = document.getElementById("instructions");
  chrome.storage.local.get(["bookmarks"], (result) => {
    const bookmarks = result.bookmarks || [];
    if (bookmarks && bookmarks.length > 0) {
      instructions.classList.add("hidden");
    } else {
      instructions.classList.remove("hidden");
    }
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "bookmarks" in changes) {
    displayBookmarks();
  }
});

function localizeHtmlPage() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const messageKey = el.getAttribute("data-i18n");
    const message = chrome.i18n.getMessage(messageKey);
    if (message) {
      if (
        el.tagName.toLowerCase() === "input" ||
        el.tagName.toLowerCase() === "textarea"
      ) {
        el.setAttribute("placeholder", message);
      } else if (el.tagName.toLowerCase() === "title") {
        document.title = message;
      } else {
        el.textContent = message;
      }
    }
  });
}

// Popup logic
function initializePopup() {
  const lockButton = document.getElementById("lockButton");
  const saveButton = document.getElementById("saveCurrentPage");

  // Check if password is not set, show initial setup
  chrome.storage.local.get(["hash", "salt"], (result) => {
    if (!result.hash || !result.salt) {
      showInitialPasswordSetup();
    }
  });

  // Event listeners
  lockButton.addEventListener("click", () => {
    // Set session flag to false to lock the extension
    chrome.storage.session.set({ [SESSION_UNLOCKED_KEY]: false }, () => {
      // Show the lock overlay
      showLockOverlay();
    });
  });
  saveButton.addEventListener("click", saveCurrentPage);
  window.onload = displayBookmarks;
}

// Initial password setup
function showInitialPasswordSetup() {
  const lockOverlay = document.getElementById("lockOverlay");
  const submitPassword = document.getElementById("submitPassword");
  const passwordInput = document.getElementById("passwordInput");

  document.querySelector("#lockOverlay h2").textContent =
    chrome.i18n.getMessage("app_create_password");
  submitPassword.textContent = chrome.i18n.getMessage("app_set_password");
  passwordInput.placeholder = chrome.i18n.getMessage(
    "app_create_password_placeholder"
  );

  lockOverlay.classList.remove("hidden");
  lockOverlay.classList.add("flex", "flex-col");
  passwordInput.focus();

  submitPassword.onclick = async () => {
    const input = document.getElementById("passwordInput").value;
    if (input.length < 4) {
      showError(chrome.i18n.getMessage("app_pass_short_error"));
      return;
    }

    await savePassword(input); // Save salt + hash
    hideLockOverlay();
  };

  passwordInput.onkeypress = (e) => {
    if (e.key === "Enter") submitPassword.onclick();
  };
}

// Lock check logic
function initializeLock() {
  chrome.storage.local.get(["hash", "salt"], (result) => {
    const passwordSet = result.hash && result.salt;
    chrome.storage.session.get([SESSION_UNLOCKED_KEY], (sessionResult) => {
      const unlocked = sessionResult[SESSION_UNLOCKED_KEY];
      if (passwordSet && !unlocked) showLockOverlay();
    });
  });

  const submitPassword = document.getElementById("submitPassword");
  const passwordInput = document.getElementById("passwordInput");

  submitPassword.addEventListener("click", handlePasswordSubmit);
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handlePasswordSubmit();
  });
}

function initalizeSwitchButtons() {
  const basicBookmarksSwitch = document.getElementById("basicBookmarks");
  const incognitoBookmarksSwitch =
    document.getElementById("incognitoBookmarks");
  basicBookmarksSwitch.addEventListener("click", () => {
    bookmarkSwitch(false);
  });
  incognitoBookmarksSwitch.addEventListener("click", () => {
    bookmarkSwitch(true);
  });
}

function bookmarkSwitch(state) {
  chrome.storage.local.set({ [BOOKMARK_SWITCH_KEY]: state }, () => {
    console.log("Bookmark switch initialized.");
  });
  displayBookmarks();
}

// Lock overlay functions
function showLockOverlay() {
  const overlay = document.getElementById("lockOverlay");
  const input = document.getElementById("passwordInput");
  const error = document.getElementById("passwordError");

  overlay.classList.remove("hidden");
  overlay.classList.add("flex", "flex-col");
  input.value = "";
  input.placeholder = chrome.i18n.getMessage("app_enter_password_placeholder");
  error.classList.add("hidden");
  input.focus();
}

function hideLockOverlay() {
  const overlay = document.getElementById("lockOverlay");
  overlay.classList.remove("flex", "flex-col");
  overlay.classList.add("hidden");
}

function showError(msg) {
  const error = document.getElementById("passwordError");
  error.textContent = msg;
  error.classList.remove("hidden");
}

// Crypto functions
function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const byteArray = Array.from(new Uint8Array(buffer));
  return btoa(String.fromCharCode(...byteArray));
}

async function savePassword(password) {
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);
  chrome.storage.local.set({ salt, hash }, () => {
    chrome.storage.session.set(
      { [SESSION_UNLOCKED_KEY]: true },
      hideLockOverlay
    );
  });
}

async function checkPassword(inputPassword) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["salt", "hash"], async (result) => {
      if (!result.salt || !result.hash) return resolve(false);
      const inputHash = await hashPassword(inputPassword, result.salt);
      resolve(inputHash === result.hash);
    });
  });
}

async function handlePasswordSubmit() {
  const input = document.getElementById("passwordInput").value;
  if (input.length < 4) {
    showError(chrome.i18n.getMessage("app_pass_short_error"));
    return;
  }

  chrome.storage.local.get(["hash", "salt"], async (result) => {
    if (!result.hash || !result.salt) {
      await savePassword(input); // first time
    } else {
      const valid = await checkPassword(input);
      if (valid) {
        chrome.storage.session.set(
          { [SESSION_UNLOCKED_KEY]: true },
          hideLockOverlay
        );
      } else {
        showError(chrome.i18n.getMessage("app_pass_incorrect_error"));
      }
    }
  });
}

// Bookmark logic
function saveCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const { url, title, incognito } = tab;

    chrome.storage.local.get(
      ["bookmarks", BOOKMARK_COUNT_KEY, FEEDBACK_DISABLED_KEY],
      (result) => {
        const bookmarks = result.bookmarks || [];
        if (!bookmarks.some((b) => b.url === url)) {
          bookmarks.push({ url, title, incognito });
          const bookmarkCount = (result[BOOKMARK_COUNT_KEY] || 0) + 1;

          chrome.storage.local.set(
            {
              bookmarks,
              [BOOKMARK_COUNT_KEY]: bookmarkCount,
            },
            () => {
              displayBookmarks();
              chrome.storage.local.getBytesInUse(null, (bytes) => {
                console.log(`Used: ${bytes} bytes`);
              });

              // Show feedback dialog every 5 bookmarks if not disabled
              if (!result[FEEDBACK_DISABLED_KEY] && bookmarkCount % 5 === 0) {
                showFeedbackDialog();
              }
            }
          );
        }
      }
    );
  });
}

function displayBookmarks() {
  trunOffInstructions();
  chrome.storage.local.get(["bookmarks", BOOKMARK_SWITCH_KEY], (result) => {
    const bookmarks = result.bookmarks || [];
    const switchState = result[BOOKMARK_SWITCH_KEY];
    const list = document.getElementById("bookmarkList");
    list.innerHTML = "";

    bookmarks.forEach((bookmark, index) => {
      if (bookmark.incognito === switchState) {
        const li = document.createElement("li");
        li.className =
          "flex justify-between items-center bg-[#25262b] p-4 rounded-xl hover:bg-[#2c2d33] transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 border border-gray-700/20 hover:border-gray-700/30 group cursor-pointer mb-3";

        const container = document.createElement("div");
        container.className = "flex items-center flex-grow min-w-0 gap-3";

        const icon = document.createElement("span");
        icon.textContent = bookmark.incognito ? "🕶️" : "👁️";
        icon.className = "flex-shrink-0 opacity-50";

        const text = document.createElement("div");
        text.textContent = bookmark.title || bookmark.url;
        text.title = bookmark.url;
        text.className =
          "text-blue-400 hover:text-blue-300 truncate text-base transition-all duration-300 hover:translate-x-1 font-medium";

        container.appendChild(icon);
        container.appendChild(text);

        const delBtn = document.createElement("button");
        delBtn.innerHTML = "🗑️";
        delBtn.className =
          "text-red-400/70 hover:text-red-500 text-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90";
        delBtn.setAttribute("aria-label", "Delete bookmark");

        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          bookmarks.splice(index, 1);
          chrome.storage.local.set({ bookmarks }, displayBookmarks);
        });

        li.addEventListener("click", () => {
          chrome.windows.getCurrent((window) => {
            if (window.incognito === bookmark.incognito) {
              chrome.tabs.create({ url: bookmark.url, windowId: window.id });
            } else {
              chrome.windows.create({
                url: bookmark.url,
                incognito: bookmark.incognito,
              });
            }
          });
        });

        li.appendChild(container);
        li.appendChild(delBtn);
        list.appendChild(li);
      }
    });
  });
}

// Feedback dialog functions
function initializeFeedback() {
  const dialog = document.getElementById("feedbackDialog");
  const dialogContent = dialog.querySelector("div");

  // Review button
  document.getElementById("feedbackReview").addEventListener("click", () => {
    chrome.storage.local.set({ [FEEDBACK_DISABLED_KEY]: true }, () => {
      window.open(CHROME_STORE_URL, "_blank");
      hideFeedbackDialog();
    });
  });

  // Later button
  document
    .getElementById("feedbackLater")
    .addEventListener("click", hideFeedbackDialog);

  // Never button
  document.getElementById("feedbackNever").addEventListener("click", () => {
    chrome.storage.local.set(
      { [FEEDBACK_DISABLED_KEY]: true },
      hideFeedbackDialog
    );
  });

  // Handle click outside the dialog
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      hideFeedbackDialog();
    }
  });
}

function showFeedbackDialog() {
  const dialog = document.getElementById("feedbackDialog");
  const dialogContent = dialog.querySelector("div");

  dialog.classList.remove("hidden");
  dialog.classList.add("flex");

  // Trigger animation
  requestAnimationFrame(() => {
    dialogContent.classList.remove("scale-95", "opacity-0");
    dialogContent.classList.add("scale-100", "opacity-100");
  });
}

function hideFeedbackDialog() {
  const dialog = document.getElementById("feedbackDialog");
  const dialogContent = dialog.querySelector("div");

  dialogContent.classList.remove("scale-100", "opacity-100");
  dialogContent.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    dialog.classList.remove("flex");
    dialog.classList.add("hidden");
  }, 300); // Match the duration in the CSS transition
}

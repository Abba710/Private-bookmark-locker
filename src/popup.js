// Constants
const SESSION_UNLOCKED_KEY = "sessionUnlocked";

// DOMContentLoaded initialization
document.addEventListener("DOMContentLoaded", () => {
  initializePopup();
  initializeLock();
});

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
  lockButton.addEventListener("click", () => showLockOverlay());
  saveButton.addEventListener("click", saveCurrentPage);
  window.onload = displayBookmarks;
}

// Initial password setup
function showInitialPasswordSetup() {
  const lockOverlay = document.getElementById("lockOverlay");
  const submitPassword = document.getElementById("submitPassword");
  const passwordInput = document.getElementById("passwordInput");

  document.querySelector("#lockOverlay h2").textContent = "🔐 Create Password";
  submitPassword.textContent = "Set Password";
  passwordInput.placeholder = "Create your password";

  lockOverlay.classList.remove("hidden");
  lockOverlay.classList.add("flex", "flex-col");
  passwordInput.focus();

  submitPassword.onclick = async () => {
    const input = passwordInput.value;
    if (input.length < 4) {
      showError("Password must be at least 4 characters long");
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

// Lock overlay functions
function showLockOverlay() {
  const overlay = document.getElementById("lockOverlay");
  const input = document.getElementById("passwordInput");
  const error = document.getElementById("passwordError");

  overlay.classList.remove("hidden");
  overlay.classList.add("flex", "flex-col");
  input.value = "";
  input.placeholder = "Enter your password";
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
    showError("Password must be at least 4 characters long");
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
        showError("Incorrect password");
      }
    }
  });
}

// Bookmark logic
function saveCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const { url, title, incognito } = tab;

    chrome.storage.local.get(["bookmarks"], (result) => {
      const bookmarks = result.bookmarks || [];
      if (!bookmarks.some((b) => b.url === url)) {
        bookmarks.push({ url, title, incognito });
        chrome.storage.local.set({ bookmarks }, displayBookmarks);
      }
    });
  });
}

function displayBookmarks() {
  chrome.storage.local.get(["bookmarks"], (result) => {
    const bookmarks = result.bookmarks || [];
    const list = document.getElementById("bookmarkList");
    list.innerHTML = "";

    bookmarks.forEach((bookmark, index) => {
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
    });
  });
}

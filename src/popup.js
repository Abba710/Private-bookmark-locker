document.addEventListener("DOMContentLoaded", () => {
  // Initialize popup elements
  const lockButton = document.getElementById("lockButton");
  const saveButton = document.getElementById("saveCurrentPage");

  // Check if this is first launch
  chrome.storage.local.get([STORED_PASSWORD_KEY], (result) => {
    if (!result[STORED_PASSWORD_KEY]) {
      showInitialPasswordSetup();
    }
  });

  // Function for initial password setup
  function showInitialPasswordSetup() {
    const lockOverlay = document.getElementById("lockOverlay");
    const submitPassword = document.getElementById("submitPassword");
    const passwordInput = document.getElementById("passwordInput");
    const passwordError = document.getElementById("passwordError");

    // Change text for first-time setup
    document.querySelector("#lockOverlay h2").textContent =
      "🔐 Create Password";
    submitPassword.textContent = "Set Password";
    passwordInput.placeholder = "Create your password";

    lockOverlay.classList.remove("hidden");
    lockOverlay.classList.add("flex", "flex-col");
    passwordInput.focus();

    // Override submit handler for initial setup
    submitPassword.onclick = () => {
      if (passwordInput.value.length < 4) {
        showError("Password must be at least 4 characters long");
        return;
      }

      // Save the password
      chrome.storage.local.set(
        { [STORED_PASSWORD_KEY]: passwordInput.value },
        () => {
          chrome.storage.session.set({ [SESSION_UNLOCKED_KEY]: true }, () => {
            // Reset overlay text back to normal
            document.querySelector("#lockOverlay h2").textContent =
              "🔒 Enter Password";
            submitPassword.textContent = "Unlock";
            passwordInput.placeholder = "Enter your password";
            hideLockOverlay();
          });
        }
      );
    };

    passwordInput.onkeypress = (e) => {
      if (e.key === "Enter") {
        submitPassword.onclick();
      }
    };
  }

  // Function for saving current page
  function saveCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      const url = currentTab.url;
      const title = currentTab.title; // Get the tab title
      const isIncognito = currentTab.incognito;

      chrome.storage.local.get(["bookmarks"], (result) => {
        const bookmarks = result.bookmarks || [];
        // Check if bookmark already exists
        if (!bookmarks.some((b) => b.url === url)) {
          bookmarks.push({
            url: url,
            title: title, // Save the title
            incognito: isIncognito,
          });
          chrome.storage.local.set({ bookmarks: bookmarks }, displayBookmarks);
        }
      });
    });
  }

  // Add event listener for save button
  saveButton.addEventListener("click", saveCurrentPage);

  // Display bookmarks list
  function displayBookmarks() {
    chrome.storage.local.get(["bookmarks"], (result) => {
      const bookmarks = result.bookmarks || [];
      const bookmarksList = document.getElementById("bookmarkList");

      bookmarksList.innerHTML = "";

      bookmarks.forEach((bookmark, index) => {
        const li = document.createElement("li");
        li.className =
          "flex justify-between items-center bg-[#25262b] p-4 rounded-xl hover:bg-[#2c2d33] transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 border border-gray-700/20 hover:border-gray-700/30 group cursor-pointer mb-3";

        const linkContainer = document.createElement("div");
        linkContainer.className = "flex items-center flex-grow min-w-0 gap-3";

        const modeIcon = document.createElement("span");
        modeIcon.textContent = bookmark.incognito ? "🕶️" : "👁️";
        modeIcon.className = "flex-shrink-0 opacity-50";

        const linkDiv = document.createElement("div");
        linkDiv.textContent = bookmark.title || bookmark.url; // Use title if available, otherwise URL
        linkDiv.title = bookmark.url; // Show full URL on hover
        linkDiv.className =
          "text-blue-400 hover:text-blue-300 truncate text-base transition-all duration-300 hover:translate-x-1 font-medium";

        linkContainer.appendChild(modeIcon);
        linkContainer.appendChild(linkDiv);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.className =
          "text-red-400/70 hover:text-red-500 text-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90";
        deleteBtn.setAttribute("aria-label", "Delete bookmark");

        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          bookmarks.splice(index, 1);
          chrome.storage.local.set({ bookmarks: bookmarks }, displayBookmarks);
        });

        li.addEventListener("click", () => {
          chrome.windows.getCurrent(async (currentWindow) => {
            if (currentWindow.incognito === bookmark.incognito) {
              // If current window matches bookmark mode
              window.open(bookmark.url, "_blank");
            } else {
              // If modes don't match, create a new window
              await chrome.windows.create({
                url: bookmark.url,
                incognito: bookmark.incognito,
              });
            }
          });
        });

        li.appendChild(linkContainer);
        li.appendChild(deleteBtn);
        bookmarksList.appendChild(li);
      });
    });
  }
  window.onload = displayBookmarks;
  // Lock button functionality
  lockButton.addEventListener("click", () => {
    showLockOverlay();
  });
});

// Lock functionality
const STORED_PASSWORD_KEY = "bookmarkSavePassword";
const SESSION_UNLOCKED_KEY = "sessionUnlocked";

function initializeLock() {
  chrome.storage.local.get([STORED_PASSWORD_KEY], (result) => {
    const storedPassword = result[STORED_PASSWORD_KEY];

    // Check lock state via chrome.storage.session
    chrome.storage.session.get([SESSION_UNLOCKED_KEY], (sessionResult) => {
      const sessionUnlocked = sessionResult[SESSION_UNLOCKED_KEY];

      // If password exists but session is not unlocked - show lock screen
      if (storedPassword && !sessionUnlocked) {
        showLockOverlay();
      }
    });
  });

  // Setup event listeners
  const lockButton = document.getElementById("lockButton");
  const submitPassword = document.getElementById("submitPassword");
  const passwordInput = document.getElementById("passwordInput");

  lockButton.addEventListener("click", () => {
    // Clear session state for re-authentication
    chrome.storage.session.remove([SESSION_UNLOCKED_KEY], () => {
      showLockOverlay();
    });
  });

  submitPassword.addEventListener("click", handlePasswordSubmit);
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handlePasswordSubmit();
    }
  });
}

function showLockOverlay() {
  const lockOverlay = document.getElementById("lockOverlay");
  const passwordInput = document.getElementById("passwordInput");
  const passwordError = document.getElementById("passwordError");

  lockOverlay.classList.remove("hidden");
  lockOverlay.classList.add("flex", "flex-col");
  passwordInput.value = "";
  passwordError.classList.add("hidden");
  passwordInput.focus();
}

function handlePasswordSubmit() {
  const passwordInput = document.getElementById("passwordInput");
  const passwordError = document.getElementById("passwordError");

  chrome.storage.local.get([STORED_PASSWORD_KEY], (result) => {
    const storedPassword = result[STORED_PASSWORD_KEY];

    if (!storedPassword) {
      // First time password setup
      if (passwordInput.value.length < 4) {
        showError("Password must be at least 4 characters long");
        return;
      }
      chrome.storage.local.set(
        { [STORED_PASSWORD_KEY]: passwordInput.value },
        () => {
          chrome.storage.session.set({ [SESSION_UNLOCKED_KEY]: true }, () => {
            hideLockOverlay();
          });
        }
      );
    } else {
      // Verify existing password
      if (passwordInput.value === storedPassword) {
        chrome.storage.session.set({ [SESSION_UNLOCKED_KEY]: true }, () => {
          hideLockOverlay();
        });
      } else {
        showError("Incorrect password");
      }
    }
  });
}

function hideLockOverlay() {
  const lockOverlay = document.getElementById("lockOverlay");
  lockOverlay.classList.remove("flex", "flex-col");
  lockOverlay.classList.add("hidden");
}

function showError(message) {
  const passwordError = document.getElementById("passwordError");
  passwordError.textContent = message;
  passwordError.classList.remove("hidden");
}

// Initialize lock functionality when popup opens
document.addEventListener("DOMContentLoaded", () => {
  initializeLock();
});

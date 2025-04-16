document.addEventListener("DOMContentLoaded", () => {
  // Initialize popup elements
  const lockButton = document.getElementById("lockButton");
  const addButton = document.getElementById("addBookmark");
  const bookmarkInput = document.getElementById("bookmarkInput");

  // Check if this is first launch
  const storedPassword = localStorage.getItem(STORED_PASSWORD_KEY);
  if (!storedPassword) {
    showInitialPasswordSetup();
  }

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
      localStorage.setItem(STORED_PASSWORD_KEY, passwordInput.value);
      chrome.storage.session.set({ [SESSION_UNLOCKED_KEY]: true }, () => {
        // Reset overlay text back to normal
        document.querySelector("#lockOverlay h2").textContent =
          "🔒 Enter Password";
        submitPassword.textContent = "Unlock";
        passwordInput.placeholder = "Enter your password";
        hideLockOverlay();
      });
    };

    passwordInput.onkeypress = (e) => {
      if (e.key === "Enter") {
        submitPassword.onclick();
      }
    };
  }

  // Функция для нормализации URL
  function normalizeUrl(url) {
    // Удаляем пробелы в начале и конце
    url = url.trim();

    // Если URL не содержит протокол, добавляем https://
    if (!url.match(/^https?:\/\//i)) {
      url = "https://" + url;
    }

    try {
      // Пробуем создать URL объект для валидации
      const urlObject = new URL(url);
      return urlObject.href;
    } catch (e) {
      // Если URL некорректный, возвращаем null
      return null;
    }
  }

  // Функция добавления закладки
  function addBookmark() {
    const bookmarkInputValue = bookmarkInput.value;

    // Проверка на пустую строку
    if (!bookmarkInputValue.trim()) return;

    const normalizedUrl = normalizeUrl(bookmarkInputValue);
    if (!normalizedUrl) {
      // Можно добавить визуальное отображение ошибки здесь
      console.error("Invalid URL");
      return;
    }

    const stored = localStorage.getItem("bookmarks");
    const bookmarks = stored ? JSON.parse(stored) : [];

    bookmarks.push(normalizedUrl);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    bookmarkInput.value = ""; // Очищаем input
    displayBookmarks();
  }

  // Добавляем обработчик для кнопки
  addButton.addEventListener("click", addBookmark);

  // Добавляем обработчик Enter для поля ввода
  bookmarkInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addBookmark();
    }
  });

  function displayBookmarks() {
    const stored = localStorage.getItem("bookmarks");
    const bookmarks = stored ? JSON.parse(stored) : [];
    const bookmarksList = document.getElementById("bookmarkList");

    bookmarksList.innerHTML = "";

    bookmarks.forEach((bookmark, index) => {
      // Создаем li
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center bg-[#25262b] px-6 py-4 rounded-xl hover:bg-[#2c2d33] transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 border border-gray-700/20 hover:border-gray-700/30 group cursor-pointer";

      // Создаем div для ссылки вместо прямой ссылки
      const linkDiv = document.createElement("div");
      linkDiv.textContent = bookmark;
      linkDiv.className =
        "text-blue-400 hover:text-blue-300 truncate text-lg transition-all duration-300 hover:translate-x-1 font-medium flex-grow";

      // Кнопка удаления
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.className =
        "text-red-400/70 hover:text-red-500 text-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90";
      deleteBtn.setAttribute("aria-label", "Delete bookmark");

      // Обработчик на удаление
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события
        bookmarks.splice(index, 1);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        displayBookmarks();
      });

      // Обработчик клика на весь элемент
      li.addEventListener("click", () => {
        window.open(bookmark, "_blank");
      });

      // Вставляем элементы в DOM
      li.appendChild(linkDiv);
      li.appendChild(deleteBtn);
      bookmarksList.appendChild(li);
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
  const storedPassword = localStorage.getItem(STORED_PASSWORD_KEY);

  // Проверяем состояние блокировки через chrome.storage.session
  chrome.storage.session.get([SESSION_UNLOCKED_KEY], (result) => {
    const sessionUnlocked = result[SESSION_UNLOCKED_KEY];

    // Если есть пароль, но сессия не разблокирована - показываем экран блокировки
    if (storedPassword && !sessionUnlocked) {
      showLockOverlay();
    }
  });

  // Setup event listeners
  const lockButton = document.getElementById("lockButton");
  const submitPassword = document.getElementById("submitPassword");
  const passwordInput = document.getElementById("passwordInput");

  lockButton.addEventListener("click", () => {
    // Очищаем состояние сессии для повторной аутентификации
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
  const lockOverlay = document.getElementById("lockOverlay");
  const storedPassword = localStorage.getItem(STORED_PASSWORD_KEY);

  if (!storedPassword) {
    // First time password setup
    if (passwordInput.value.length < 4) {
      showError("Password must be at least 4 characters long");
      return;
    }
    localStorage.setItem(STORED_PASSWORD_KEY, passwordInput.value);
    chrome.storage.session.set({ [SESSION_UNLOCKED_KEY]: true }, () => {
      hideLockOverlay();
    });
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

document.addEventListener("DOMContentLoaded", () => {
  // Initialize popup elements
  const lockButton = document.getElementById("lockButton");
  const addButton = document.getElementById("addBookmark");
  addButton.addEventListener("click", () => {
    const bookmarkInput = document.getElementById("bookmarkInput");
    const bookmarkInputValue = bookmarkInput.value;

    // Проверка на пустую строку
    if (!bookmarkInputValue.trim()) return;

    const stored = localStorage.getItem("bookmarks");
    const bookmarks = stored ? JSON.parse(stored) : [];

    bookmarks.push(bookmarkInputValue);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    bookmarkInput.value = ""; // Очищаем input
    displayBookmarks();
  });

  function displayBookmarks() {
    const stored = localStorage.getItem("bookmarks");
    const bookmarks = stored ? JSON.parse(stored) : [];
    const bookmarksList = document.getElementById("bookmarkList");

    bookmarksList.innerHTML = ""; // Очищаем старый список

    bookmarks.forEach((bookmark, index) => {
      // Создаем li
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center bg-[#25262b] px-6 py-4 rounded-xl hover:bg-[#2c2d33] transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 border border-gray-700/20 hover:border-gray-700/30 group";

      // Создаем ссылку
      const link = document.createElement("a");
      link.href = bookmark;
      link.textContent = bookmark;
      link.target = "_blank";
      link.className =
        "text-blue-400 hover:text-blue-300 truncate text-lg transition-all duration-300 hover:translate-x-1 font-medium";

      // Кнопка удаления
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.className =
        "text-red-400/70 hover:text-red-500 text-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90";
      deleteBtn.setAttribute("aria-label", "Delete bookmark");

      // Обработчик на удаление
      deleteBtn.addEventListener("click", () => {
        bookmarks.splice(index, 1);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        displayBookmarks(); // Обновляем отрисовку
      });

      // Вставляем элементы в DOM
      li.appendChild(link);
      li.appendChild(deleteBtn);
      bookmarksList.appendChild(li);
    });
  }
  window.onload = displayBookmarks;
  // Lock button functionality
  lockButton.addEventListener("click", () => {
    // TODO: Implement locking functionality in the future
    console.log("Lock button clicked");
  });
});

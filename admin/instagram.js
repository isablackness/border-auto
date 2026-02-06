(() => {
  // Проверка авторизации
  (async () => {
    try {
      const r = await fetch("/api/admin/check");
      if (!r.ok) location.href = "/admin/login.html";
    } catch {
      location.href = "/admin/login.html";
    }
  })();

  const importBtn = document.getElementById("importBtn");
  const input = document.getElementById("instagramUrl");

  if (!importBtn || !input) {
    console.error("Instagram import: элементы формы не найдены");
    return;
  }

  function isValidInstagramPost(url) {
    return /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?$/.test(url);
  }

  importBtn.onclick = async () => {
    const url = input.value.trim();

    if (!url) {
      alert("Вставь ссылку на пост Instagram");
      return;
    }

    if (!isValidInstagramPost(url)) {
      alert("Это не ссылка на пост Instagram");
      return;
    }

    importBtn.disabled = true;
    const originalText = importBtn.textContent;
    importBtn.textContent = "Импортируем…";

    try {
      const r = await fetch("/api/admin/instagram/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Ошибка сервера");
      }

      alert("Пост импортирован как черновик");
      input.value = "";
    } catch (e) {
      alert("Ошибка импорта: " + e.message);
    } finally {
      importBtn.disabled = false;
      importBtn.textContent = originalText;
    }
  };
})();

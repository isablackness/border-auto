(() => {
  const btn = document.getElementById("importBtn");
  const input = document.getElementById("instagramUrl");
  const frame = document.getElementById("igFrame");

  function normalizeUrl(url) {
    const m = url.match(/instagram\.com\/(?:[^/]+\/)?p\/([A-Za-z0-9_-]+)/);
    return m ? `https://www.instagram.com/p/${m[1]}/` : null;
  }

  btn.onclick = () => {
    const rawUrl = input.value.trim();
    const url = normalizeUrl(rawUrl);

    if (!url) {
      alert("Неверная ссылка Instagram");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Получаем данные…";

    frame.src = url;

    frame.onload = () => {
      try {
        const doc = frame.contentDocument;

        // 1️⃣ описание
        let caption = "";
        const meta = doc.querySelector('meta[property="og:description"]');
        if (meta) caption = meta.content;

        // 2️⃣ изображения
        const images = [];
        doc.querySelectorAll('meta[property="og:image"]').forEach(m => {
          images.push(m.content);
        });

        if (!caption && images.length === 0) {
          throw new Error("Не удалось получить данные. Убедись, что ты залогинен в Instagram.");
        }

        sessionStorage.setItem(
          "ig_import",
          JSON.stringify({ caption, images })
        );

        location.href = "/admin/edit.html";
      } catch (e) {
        alert(e.message);
        btn.disabled = false;
        btn.textContent = "Получить данные";
      }
    };
  };
})();

(async () => {
  const r = await fetch("/api/admin/check");
  if (!r.ok) location.href = "/admin/login.html";
})();

const list = document.getElementById("draftList");
const importBtn = document.getElementById("importBtn");

async function loadDrafts() {
  const r = await fetch("/api/admin/instagram/drafts");
  const drafts = await r.json();

  list.innerHTML = "";

  if (!drafts.length) {
    list.innerHTML = "<p>Черновиков пока нет</p>";
    return;
  }

  drafts.forEach(d => {
    const card = document.createElement("div");
    card.className = "admin-card";

    card.innerHTML = `
      <img src="${d.images?.[0] || "/images/no-image.png"}">
      <div class="info">
        <h3>${d.brand || "Без названия"} ${d.model || ""}</h3>
        <div class="price">${d.price ? d.price + " €" : ""}</div>
        <div class="actions">
          <button onclick="location.href='/admin/edit.html?mode=draft&id=${d.id}'">
            ✏️ Редактировать
          </button>
        </div>
      </div>
    `;

    list.appendChild(card);
  });
}

importBtn.onclick = async () => {
  importBtn.disabled = true;
  importBtn.textContent = "Импортируем...";

  try {
    await fetch("/api/admin/instagram/import", {
      method: "POST"
    });
    await loadDrafts();
  } catch (e) {
    alert("Ошибка импорта");
  } finally {
    importBtn.disabled = false;
    importBtn.textContent = "⬇️ Импортировать из Instagram";
  }
};

loadDrafts();

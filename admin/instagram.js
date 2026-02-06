(async () => {
  const r = await fetch("/api/admin/check");
  if (!r.ok) location.href = "/admin/login.html";
})();

const importBtn = document.getElementById("importBtn");
const input = document.getElementById("instagramUrl");

importBtn.onclick = async () => {
  const url = input.value.trim();
  if (!url) return alert("Вставь ссылку на пост");

  importBtn.disabled = true;
  importBtn.textContent = "Импортируем...";

  try {
    const r = await fetch("/api/admin/instagram/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!r.ok) throw new Error();

    alert("Импортировано как черновик");
    input.value = "";
  } catch {
    alert("Ошибка импорта");
  } finally {
    importBtn.disabled = false;
    importBtn.textContent = "⬇️ Импортировать";
  }
};

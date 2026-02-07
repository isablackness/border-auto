const catalog = document.getElementById("adminCatalog");
const addBtn = document.querySelector(".add-btn");

let draggedId = null;

/* ===== AUTH CHECK ===== */
(async () => {
  const r = await fetch("/api/admin/check");
  if (!r.ok) location.href = "/admin/login.html";
})();

/* ===== LOAD ===== */
async function loadCars() {
  const res = await fetch("/api/cars");
  const cars = await res.json();

  catalog.innerHTML = "";

  cars.forEach(car => {
    const card = document.createElement("div");
    card.className = "admin-card";
    card.draggable = true;
    card.dataset.id = car.id;

    card.innerHTML = `
      ${
        car.images?.[0]
          ? `<img src="${car.images[0]}">`
          : `
            <div class="no-photo">
              <svg width="40" height="40" viewBox="0 0 24 24">
                <path fill="#777" d="M21 5h-3.2l-1.8-2H8L6.2 5H3v14h18V5zm-9 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm8.5-11.5L2.5 22.5l-1-1L19.5 3.5l1 1z"/>
              </svg>
              <span>Нет фото</span>
            </div>
          `
      }

      <div class="info">
        <h3>${car.brand} ${car.model}</h3>
        <div class="price">${car.price} €</div>
        <div class="actions">
          <button onclick="location.href='/admin/edit.html?id=${car.id}'">
            ✏️ Редактировать
          </button>
          <button onclick="deleteCar(${car.id})">
            🗑 Удалить
          </button>
        </div>
      </div>
    `;

    card.addEventListener("dragstart", () => {
      draggedId = car.id;
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      draggedId = null;
      card.classList.remove("dragging");
    });

    card.addEventListener("dragover", e => e.preventDefault());

    card.addEventListener("drop", async () => {
      const nodes = [...catalog.children];
      const from = nodes.findIndex(n => n.dataset.id == draggedId);
      const to = nodes.findIndex(n => n === card);

      if (from === to) return;

      const moved = nodes[from];
      nodes.splice(from, 1);
      nodes.splice(to, 0, moved);

      nodes.forEach(n => catalog.appendChild(n));

      const order = nodes.map(n => Number(n.dataset.id));

      await fetch("/api/admin/cars/sort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order })
      });
    });

    catalog.appendChild(card);
  });
}

/* ===== DELETE (PUBLIC API) ===== */
async function deleteCar(id) {
  if (!confirm("Удалить автомобиль?")) return;

  const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });

  if (!res.ok) {
    alert("Ошибка удаления");
    return;
  }

  loadCars();
}

addBtn.onclick = () => {
  location.href = "/admin/edit.html";
};

loadCars();

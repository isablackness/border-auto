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
      <img src="${car.images?.[0] || "/images/no-image.png"}">
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

    card.addEventListener("dragover", e => {
      e.preventDefault();
    });

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

async function deleteCar(id) {
  if (!confirm("Удалить автомобиль?")) return;

  await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
  loadCars();
}

addBtn.onclick = () => {
  location.href = "/admin/edit.html";
};

loadCars();

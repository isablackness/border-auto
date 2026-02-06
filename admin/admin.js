/* ===== LOAD ADMIN CARS ===== */
async function loadAdminCars() {
  const container = document.getElementById("adminCatalog");
  if (!container) return;

  const res = await fetch("/api/cars"); // ⬅️ ОБЯЗАТЕЛЬНО с /
  const cars = await res.json();

  container.innerHTML = "";

  cars.forEach(car => {
    const img = car.images?.[0] || "/images/no-image.png";

    const card = document.createElement("div");
    card.className = "admin-card";

    card.innerHTML = `
      <img src="${img}">
      <div class="info">
        <h3>${car.brand} ${car.model}</h3>
        <div class="price">${car.price} €</div>
        <div class="admin-actions">
          <button onclick="location.href='/admin/edit.html?id=${car.id}'">
            ✏️ Редактировать
          </button>
          <button onclick="deleteCar(${car.id})">
            🗑 Удалить
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

loadAdminCars();

/* ===== ADD BUTTON ===== */
const addBtn = document.querySelector(".add-btn");
if (addBtn) {
  addBtn.addEventListener("click", () => {
    location.href = "/admin/edit.html";
  });
}

/* ===== DELETE ===== */
async function deleteCar(id) {
  if (!confirm("Удалить автомобиль?")) return;

  const res = await fetch(`/api/admin/cars/${id}`, {
    method: "DELETE"
  });

  if (res.ok) loadAdminCars();
  else alert("Ошибка удаления");
}

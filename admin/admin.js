/* ===== ADMIN CATALOG ===== */
async function loadAdminCars() {
  const container = document.getElementById("adminCatalog");
  if (!container) return;

  const res = await fetch("/api/cars");
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
          <button onclick="location.href='/admin/edit.html?id=${car.id}'">✏️ Редактировать</button>
          <button>🗑 Удалить</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

loadAdminCars();

/* ===== ADD CAR ===== */
const form = document.getElementById("carForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const payload = {
      brand: data.get("brand"),
      model: data.get("model"),
      year: Number(data.get("year")),
      price: Number(data.get("price")),
      mileage: Number(data.get("mileage")),
      description: data.get("description"),
      images: data
        .get("images")
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean)
    };

    const res = await fetch("/api/admin/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      location.href = "/admin/";
    } else {
      alert("Ошибка при сохранении");
    }
  });
}

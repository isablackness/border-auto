async function loadAdminCars() {
  const res = await fetch("/api/cars");
  const cars = await res.json();

  const container = document.getElementById("adminCatalog");
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
          <button class="edit-btn">✏️ Редактировать</button>
          <button class="delete-btn">🗑 Удалить</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

loadAdminCars();

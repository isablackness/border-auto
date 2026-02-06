(async () => {
  const r = await fetch("/api/admin/check");
  if (!r.ok) {
    location.href = "/admin/login.html";
  }
})();


const catalog = document.getElementById("adminCatalog");
const addBtn = document.querySelector(".add-btn");

async function loadCars() {
  const res = await fetch("/api/cars");
  if (!res.ok) return;

  const cars = await res.json();
  catalog.innerHTML = "";

  cars.forEach(car => {
    const card = document.createElement("div");
    card.className = "admin-card";

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

    catalog.appendChild(card);
  });
}

async function deleteCar(id) {
  if (!confirm("Удалить автомобиль?")) return;

  const res = await fetch(`/api/admin/cars/${id}`, {
    method: "DELETE"
  });

  if (res.ok) loadCars();
}

addBtn.onclick = () => {
  location.href = "/admin/edit.html";
};

loadCars();

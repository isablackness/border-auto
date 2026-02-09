const list = document.getElementById("carList");

/* ================= HELPERS ================= */

function formatPrice(n) {
  if (!n && n !== 0) return "";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* ================= LOAD ================= */

async function loadCars() {
  const res = await fetch("/api/cars");

  if (!res.ok) {
    alert("Ошибка загрузки автомобилей");
    return;
  }

  const cars = await res.json();
  list.innerHTML = "";

  if (!cars.length) {
    list.innerHTML = "<p>Автомобили не найдены</p>";
    return;
  }

  cars.forEach(car => {
    const div = document.createElement("div");
    div.className = "admin-car";

    div.innerHTML = `
      <div class="info">
        <strong>${car.brand} ${car.model}</strong>
        <span>${car.year}</span>
        <span>${formatPrice(car.price)} €</span>
      </div>

      <div class="actions">
        <button onclick="editCar('${car.id}')">✏️</button>
        <button onclick="deleteCar('${car.id}')">🗑</button>
      </div>
    `;

    list.appendChild(div);
  });
}

loadCars();

/* ================= ACTIONS ================= */

window.editCar = id => {
  location.href = `/admin/edit.html?id=${id}`;
};

window.deleteCar = async id => {
  if (!confirm("Удалить автомобиль?")) return;

  const res = await fetch(`/api/admin/cars/${id}`, {
    method: "DELETE"
  });

  if (res.ok) {
    loadCars();
  } else {
    alert("Ошибка удаления");
  }
};

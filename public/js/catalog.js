const container = document.getElementById("catalog");
const yearSelect = document.getElementById("filter-year");

// Заполняем годы
for (let y = 2025; y >= 2000; y--) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}

async function loadCars() {
  const res = await fetch("/api/cars");
  const cars = await res.json();

  container.innerHTML = "";

  if (!cars.length) {
    container.innerHTML = "<p>Автомобили не найдены</p>";
    return;
  }

  cars.forEach(car => {
    container.innerHTML += `
      <div class="car-card">
        <a href="/car.html?id=${car.id}">
          <img src="${car.images?.[0] || '/images/no-photo.jpg'}">
        </a>
        <div class="info">
          <h3>${car.brand} ${car.model}</h3>
          <p>${car.year} · ${car.mileage} км</p>
          <strong>${car.price} €</strong>
        </div>
      </div>
    `;
  });
}

loadCars();

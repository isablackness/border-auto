const container = document.getElementById("catalog");

const brandInput = document.getElementById("filter-brand");
const yearSelect = document.getElementById("filter-year");
const priceInput = document.getElementById("filter-price");
const mileageInput = document.getElementById("filter-mileage");
const applyBtn = document.getElementById("applyFilters");

// Годы 2000–2025
for (let y = 2025; y >= 2000; y--) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}

async function loadCars(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`/api/cars?${params.toString()}`);
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

applyBtn.addEventListener("click", () => {
  const filters = {};

  if (brandInput.value) filters.brand = brandInput.value;
  if (yearSelect.value) filters.year = yearSelect.value;
  if (priceInput.value) filters.price = priceInput.value;
  if (mileageInput.value) filters.mileage = mileageInput.value;

  loadCars(filters);
});

// первая загрузка
loadCars();

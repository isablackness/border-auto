const catalog = document.getElementById("catalog");
let allCars = [];

// заполняем годы
const yearSelect = document.getElementById("filter-year");
for (let y = 2025; y >= 2000; y--) {
  yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
}

async function loadCars() {
  const res = await fetch("/api/cars");
  allCars = await res.json();
  renderCatalog(allCars);
}

function renderCatalog(cars) {
  catalog.innerHTML = "";

  if (!cars.length) {
    catalog.innerHTML = "<p>Автомобили не найдены</p>";
    return;
  }

  cars.forEach(car => {
    const preview =
      car.images && car.images.length
        ? car.images[0]
        : "/images/no-photo.jpg";

    const card = document.createElement("div");
    card.className = "car-card";

    card.innerHTML = `
      <a class="car-image-link" href="/car.html?id=${car.id}">
        <img src="${preview}" alt="">
      </a>

      <div class="car-cta">
        <a class="instagram" target="_blank"
           href="https://www.instagram.com/border.auto/">Instagram</a>
        <a class="whatsapp" target="_blank"
           href="https://api.whatsapp.com/send?phone=48668989731">WhatsApp</a>
      </div>

      <div class="info">
        <strong>${car.brand} ${car.model}</strong><br>
        ${car.year} · ${car.mileage} км<br>
        <b>${car.price} €</b>
      </div>
    `;

    catalog.appendChild(card);
  });
}

function applyFilters() {
  const brand = document.getElementById("filter-brand").value.toLowerCase();
  const model = document.getElementById("filter-model").value.toLowerCase();
  const year = document.getElementById("filter-year").value;
  const price = document.getElementById("filter-price").value;
  const mileage = document.getElementById("filter-mileage").value;

  const filtered = allCars.filter(car =>
    (!brand || car.brand.toLowerCase().includes(brand)) &&
    (!model || car.model.toLowerCase().includes(model)) &&
    (!year || car.year == year) &&
    (!price || car.price <= price) &&
    (!mileage || car.mileage <= mileage)
  );

  renderCatalog(filtered);
}

loadCars();

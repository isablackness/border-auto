const catalog = document.getElementById("catalog");

async function loadCars() {
  try {
    const res = await fetch("/api/cars");
    const cars = await res.json();
    renderCatalog(cars);
  } catch (e) {
    catalog.innerHTML = "<p>Ошибка загрузки автомобилей</p>";
  }
}

function renderCatalog(cars) {
  if (!cars.length) {
    catalog.innerHTML = "<p>Автомобили не найдены</p>";
    return;
  }

  catalog.innerHTML = "";

  cars.forEach(car => {
    const preview =
      car.images && car.images.length
        ? car.images[0]
        : "/images/no-photo.jpg";

    const card = document.createElement("div");
    card.className = "car-card";

    card.innerHTML = `
      <img src="${preview}" alt="">

      <div class="car-actions">
        <a class="instagram" target="_blank"
           href="https://www.instagram.com/border.auto/">Instagram</a>
        <a class="whatsapp" target="_blank"
           href="https://api.whatsapp.com/send?phone=48668989731">WhatsApp</a>
      </div>

      <div class="info">
        <strong>${car.brand} ${car.model}</strong><br>
        ${car.year} · ${car.mileage} км<br>
        <b>${car.price} €</b><br>
        <a href="/car.html?id=${car.id}">Подробнее</a>
      </div>
    `;

    catalog.appendChild(card);
  });
}

loadCars();

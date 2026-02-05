async function loadCatalog() {
  const res = await fetch("/api/cars");
  const cars = await res.json();

  const container = document.getElementById("catalog");
  container.innerHTML = "";

  if (!cars.length) {
    container.innerHTML = "<p>Автомобили не найдены</p>";
    return;
  }

  cars.forEach(car => {
    const image = car.images?.[0] || "/images/no-photo.jpg";

    container.innerHTML += `
      <div class="car-card">
        <img src="${image}" alt="${car.brand} ${car.model}" />
        <div class="info">
          <h3>${car.brand} ${car.model}</h3>
          <p>${car.year} · ${car.mileage} км</p>
          <strong>${car.price} €</strong>
        </div>
      </div>
    `;
  });
}

loadCatalog();

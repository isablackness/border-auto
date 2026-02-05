async function loadCars() {
  const res = await fetch("/api/cars");
  const cars = await res.json();
  renderCars(cars);
}

function renderCars(list) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>Автомобили не найдены</p>";
    return;
  }

  list.forEach(car => {
    container.innerHTML += `
      <div class="card">
        <div class="card-image"></div>
        <div class="card-content">
          <h3>${car.brand} ${car.model}</h3>
          <p>${car.year} • ${car.mileage} км</p>
          <p><strong>${car.price} €</strong></p>
          <a href="car.html?id=${car.id}">Подробнее</a>
        </div>
      </div>
    `;
  });
}

loadCars();

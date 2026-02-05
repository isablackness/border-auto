fetch("/api/cars")
  .then(res => res.json())
  .then(cars => {
    const grid = document.getElementById("catalog");
    grid.innerHTML = "";

    cars.forEach(car => {
      const img = car.images?.[0] || "/images/no-photo.jpg";

      grid.innerHTML += `
        <div class="car-card">
          <img src="${img}" />
          <div class="info">
            <h3>${car.brand} ${car.model}</h3>
            <p>${car.year} · ${car.mileage} км</p>
            <strong>${car.price} €</strong>
          </div>
        </div>
      `;
    });
  });

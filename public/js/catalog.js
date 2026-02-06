let cars = [];

async function loadCars() {
  const res = await fetch('/api/cars');
  cars = await res.json();
  renderCars(cars);
}

function renderCars(list) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  if (!list.length) {
    catalog.innerHTML = '<p>Автомобили не найдены</p>';
    return;
  }

  list.forEach(car => {
    const img = car.images?.[0] || '/images/no-image.png';

    const card = document.createElement('div');
    card.className = 'car-card';

    card.innerHTML = `
      <a href="/car.html?id=${car.id}">
        <img src="${img}" alt="">
      </a>

      <div class="info">
        <h3>${car.brand} ${car.model}</h3>
        <p>${car.year} · ${car.mileage} км</p>
        <p><strong>${car.price} €</strong></p>

        <div class="card-actions">
          <a class="instagram" href="https://www.instagram.com/border.auto/" target="_blank">Instagram</a>
          <a class="whatsapp" href="https://api.whatsapp.com/send?phone=48668989731" target="_blank">WhatsApp</a>
        </div>
      </div>
    `;

    catalog.appendChild(card);
  });
}

function applyFilters() {
  const brand = document.getElementById('brand').value.toLowerCase();
  const model = document.getElementById('model').value.toLowerCase();
  const year = document.getElementById('year').value;
  const price = document.getElementById('price').value;
  const mileage = document.getElementById('mileage').value;

  const filtered = cars.filter(car => {
    return (
      (!brand || car.brand.toLowerCase().includes(brand)) &&
      (!model || car.model.toLowerCase().includes(model)) &&
      (!year || car.year == year) &&
      (!price || car.price <= price) &&
      (!mileage || car.mileage <= mileage)
    );
  });

  renderCars(filtered);
}

loadCars();

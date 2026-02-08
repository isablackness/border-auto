let cars = [];
let currentSort = 'position';
let sortDir = 'desc';

async function loadCars() {
  const res = await fetch('/api/cars');
  cars = await res.json();
  sortAndRender();
}

function sortAndRender(list = cars) {
  const sorted = [...list];

  sorted.sort((a, b) => {
    let valA = a[currentSort] ?? 0;
    let valB = b[currentSort] ?? 0;

    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  renderCars(sorted);
}

function renderCars(list) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  list.forEach(car => {
    const hasImage = car.images && car.images.length > 0;

    const card = document.createElement('div');
    card.className = 'car-card';

    card.innerHTML = `
      <div class="image-wrapper">

        ${
          hasImage
            ? `<img src="${car.images[0]}" alt="${car.brand} ${car.model}">`
            : `
              <div class="no-photo">
                <svg width="48" height="48" viewBox="0 0 24 24">
                  <path fill="#888" d="M21 5h-3.2l-1.8-2H8L6.2 5H3v14h18V5zm-9 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm8.5-11.5L2.5 22.5l-1-1L19.5 3.5l1 1z"/>
                </svg>
                <span>Нет фото</span>
              </div>
            `
        }

        <a class="card-overlay" href="/car.html?id=${car.id}">
          <div class="overlay-button">Подробнее</div>
        </a>
      </div>

      <div class="info">
        <h3>${car.brand} ${car.model}</h3>

        <div class="meta">
          <div>${car.year}</div>
          <div>${car.mileage} км</div>
        </div>
      </div>
    `;

    catalog.appendChild(card);
  });
}

loadCars();

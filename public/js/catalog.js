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

    if (currentSort === 'position') {
      valA = a.position;
      valB = b.position;
    }

    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  renderCars(sorted);
}

function renderCars(list) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  if (!list.length) {
    catalog.innerHTML = '<p>Автомобили не найдены</p>';
    return;
  }

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
                  <path fill="#999" d="M21 5h-3.2l-1.8-2H8L6.2 5H3v14h18V5zm-9 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm8.5-11.5L2.5 22.5l-1-1L19.5 3.5l1 1z"/>
                </svg>
                <span>Нет фото</span>
              </div>
            `
        }

        <div class="price-badge">${car.price} €</div>

        <a class="card-overlay" href="/car.html?id=${car.id}">
          Подробнее
        </a>
      </div>

      <div class="info">
        <h3>${car.brand} ${car.model}</h3>

        <div class="meta">
          <div class="meta-item year">${car.year}</div>
          <div class="meta-item mileage">${car.mileage} км</div>
        </div>

        <button class="delete-btn">Удалить</button>
      </div>
    `;

    // DELETE (PUBLIC)
    card.querySelector('.delete-btn').addEventListener('click', async () => {
      const ok = confirm('Удалить автомобиль?');
      if (!ok) return;

      const res = await fetch(`/api/cars/${car.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        card.remove();
      } else {
        alert('Ошибка удаления');
      }
    });

    catalog.appendChild(card);
  });
}

/* ===== SORT HANDLER ===== */
document.addEventListener('click', e => {
  const btn = e.target.closest('.sort-bar button');
  if (!btn) return;

  const sortKey = btn.dataset.sort;

  if (currentSort === sortKey) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort = sortKey;
    sortDir = 'desc';
  }

  document.querySelectorAll('.sort-bar button').forEach(b => {
    b.classList.remove('active');
    const arrow = b.querySelector('.arrow');
    if (arrow) arrow.textContent = '↓';
  });

  btn.classList.add('active');
  const arrow = btn.querySelector('.arrow');
  if (arrow && sortDir === 'asc') arrow.textContent = '↑';

  sortAndRender();
});

/* ===== FILTER ===== */
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

  sortAndRender(filtered);
}

loadCars();

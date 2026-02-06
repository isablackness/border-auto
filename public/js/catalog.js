let cars = [];
let currentSort = 'position';
let sortDir = 'desc'; // asc | desc

async function loadCars() {
  const res = await fetch('/api/cars');
  cars = await res.json();
  sortAndRender();
}

function sortAndRender(list = cars) {
  let sorted = [...list];

  sorted.sort((a, b) => {
    let valA = a[currentSort] || 0;
    let valB = b[currentSort] || 0;

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
    const img = car.images?.[0] || '/images/no-image.png';

    const card = document.createElement('div');
    card.className = 'car-card';

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${img}" alt="">
        <div class="card-overlay">
          <span>Подробнее</span>
        </div>
        <a class="card-link" href="/car.html?id=${car.id}"></a>
      </div>

      <div class="info">
        <h3>${car.brand} ${car.model}</h3>
        <p>${car.year} · ${car.mileage} км</p>
        <p><strong>${car.price} €</strong></p>
      </div>
    `;

    catalog.appendChild(card);
  });
}

/* ===== SORT HANDLER ===== */
document.addEventListener('click', e => {
  const btn = e.target.closest('button[data-sort]');
  if (!btn) return;

  const sortKey = btn.dataset.sort;

  if (currentSort === sortKey) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort = sortKey;
    sortDir = 'desc';
  }

  document.querySelectorAll('.sort-bar button').forEach(b => {
    b.classList.remove('active', 'asc');
    b.querySelector('.arrow').textContent = '↓';
  });

  btn.classList.add('active');
  if (sortDir === 'asc') {
    btn.classList.add('asc');
    btn.querySelector('.arrow').textContent = '↑';
  }

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

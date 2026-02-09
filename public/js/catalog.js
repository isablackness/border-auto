let cars = [];
let filteredCars = [];

let currentSort = 'position';
let sortDir = 'desc';

/* ================= HELPERS ================= */

/* форматирование цены: 11111 -> 11 111 */
function formatPrice(value) {
  if (value == null) return '';
  return value
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/* ================= LOAD ================= */

async function loadCars() {
  const res = await fetch('/api/cars');
  cars = await res.json();
  filteredCars = [...cars];
  sortAndRender();
}

/* ================= SORT ================= */

function sortAndRender() {
  const sorted = [...filteredCars];

  sorted.sort((a, b) => {
    let valA = a[currentSort] ?? 0;
    let valB = b[currentSort] ?? 0;
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  renderCars(sorted);
}

/* ================= FILTER ================= */

window.applyFilters = function () {
  const brand = document.getElementById('brand').value.toLowerCase();
  const model = document.getElementById('model').value.toLowerCase();
  const year = document.getElementById('year').value;
  const price = document.getElementById('price').value;
  const mileage = document.getElementById('mileage').value;

  filteredCars = cars.filter(car => {
    if (brand && !car.brand.toLowerCase().includes(brand)) return false;
    if (model && !car.model.toLowerCase().includes(model)) return false;
    if (year && car.year != year) return false;
    if (price && car.price > price) return false;
    if (mileage && car.mileage > mileage) return false;
    return true;
  });

  sortAndRender();
};

/* ================= SORT BUTTONS ================= */

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-sort]');
  if (!btn) return;

  const sort = btn.dataset.sort;

  if (currentSort === sort) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort = sort;
    sortDir = 'desc';
  }

  document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  sortAndRender();
});

/* ================= VIEW SWITCH ================= */

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-view]');
  if (!btn) return;

  const view = btn.dataset.view;
  const catalog = document.getElementById('catalog');

  catalog.className = view === 'list' ? 'view-list' : 'view-grid';
  localStorage.setItem('catalogView', view);

  document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

/* ================= RENDER ================= */

function renderCars(list) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  list.forEach(car => {
    const images = car.images || [];
    let currentIndex = 0;

    const card = document.createElement('a');
    card.className = 'car-card';
    card.href = `/car.html?id=${car.id}`;

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${images[0] || ''}" alt="">
      </div>

      <div class="info">
        <div class="car-title">${car.brand} ${car.model}</div>
        <div class="meta">
          <div>${car.year}</div>
          <div>${formatPrice(car.mileage)} км</div>
        </div>
      </div>

      <div class="price-badge">
        ${formatPrice(car.price)} €
      </div>
    `;

    const img = card.querySelector('img');

    /* hover-перелистывание фото */
    card.querySelector('.image-wrapper').addEventListener('mousemove', e => {
      if (images.length < 2) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const index = Math.floor((x / rect.width) * images.length);

      if (index !== currentIndex && images[index]) {
        currentIndex = index;
        img.src = images[index];
      }
    });

    card.querySelector('.image-wrapper').addEventListener('mouseleave', () => {
      currentIndex = 0;
      img.src = images[0];
    });

    catalog.appendChild(card);
  });
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('catalogView') || 'grid';
  const catalog = document.getElementById('catalog');
  catalog.className = saved === 'list' ? 'view-list' : 'view-grid';

  document.querySelector(`[data-view="${saved}"]`)?.classList.add('active');
});

loadCars();

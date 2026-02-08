let cars = [];
let filteredCars = [];

let currentSort = 'position';
let sortDir = 'desc';

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

/* ================= FILTERS ================= */
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

/* ================= RENDER ================= */
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
            ? `<img src="${car.images[0]}" alt="${car.brand} ${car.model}" data-images='${JSON.stringify(car.images)}'>`
            : `
              <div class="no-photo">
                <svg width="48" height="48" viewBox="0 0 24 24">
                  <path fill="#888" d="M21 5h-3.2l-1.8-2H8L6.2 5H3v14h18V5zm-9 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                </svg>
                <span>Нет фото</span>
              </div>
            `
        }

        <div class="price-badge">${car.price} €</div>

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

    if (hasImage && car.images.length > 1) {
      enableHoverPreview(card, car.images);
    }
  });
}

/* ================= HOVER PREVIEW ================= */
function enableHoverPreview(card, images) {
  if (window.matchMedia('(hover: none)').matches) return;

  const wrapper = card.querySelector('.image-wrapper');
  const img = wrapper.querySelector('img');
  const total = images.length;
  let lastIndex = 0;

  wrapper.addEventListener('mousemove', e => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const index = Math.min(
      total - 1,
      Math.max(0, Math.floor(percent * total))
    );

    if (index !== lastIndex) {
      img.src = images[index];
      lastIndex = index;
    }
  });

  wrapper.addEventListener('mouseleave', () => {
    img.src = images[0];
    lastIndex = 0;
  });
}

loadCars();

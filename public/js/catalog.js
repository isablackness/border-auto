let cars = [];
let filteredCars = [];

let currentSort = 'position';
let sortDir = 'desc';

async function loadCars() {
  const res = await fetch('/api/cars');
  cars = await res.json();
  filteredCars = [...cars];
  sortAndRender();
}

function sortAndRender() {
  const sorted = [...filteredCars];

  sorted.sort((a, b) => {
    let valA = a[currentSort] ?? 0;
    let valB = b[currentSort] ?? 0;
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  renderCars(sorted);
}

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

function renderCars(list) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  list.forEach(car => {
    const images = car.images || [];
    const hasImages = images.length > 0;

    const card = document.createElement('div');
    card.className = 'car-card';

    card.innerHTML = `
      <div class="image-wrapper">
        ${
          hasImages
            ? `<img src="${images[0]}" alt="${car.brand} ${car.model}">`
            : `<div class="no-photo"><span>Нет фото</span></div>`
        }

        <div class="price-badge">${car.price} €</div>

        ${images.length > 1 ? `
          <div class="photo-dots">
            ${images.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}
          </div>
        ` : ''}
      </div>

      <div class="info">
        <a href="/car.html?id=${car.id}" class="car-title">
          ${car.brand} ${car.model}
        </a>
        <div class="meta">
          <div>${car.year}</div>
          <div>${car.mileage} км</div>
        </div>
      </div>
    `;

    catalog.appendChild(card);

    if (images.length > 1) {
      enableHoverPreview(card, images);
    }
  });
}

function enableHoverPreview(card, images) {
  if (window.matchMedia('(hover: none)').matches) return;

  const wrapper = card.querySelector('.image-wrapper');
  const img = wrapper.querySelector('img');
  const dots = wrapper.querySelectorAll('.photo-dots span');
  const total = images.length;

  wrapper.addEventListener('mousemove', e => {
    const rect = wrapper.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const index = Math.min(total - 1, Math.max(0, Math.floor(percent * total)));

    img.src = images[index];
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  });

  wrapper.addEventListener('mouseleave', () => {
    img.src = images[0];
    dots.forEach((d, i) => d.classList.toggle('active', i === 0));
  });
}

loadCars();

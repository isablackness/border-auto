let cars = [];
let filteredCars = [];

let currentSort = 'position';
let sortDir = 'desc';

function formatPrice(value) {
  if (value == null) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

async function loadCars() {
  const res = await fetch('/api/cars');
  cars = await res.json();
  filteredCars = [...cars];
  sortAndRender();
}

function sortAndRender() {
  const sorted = [...filteredCars];

  sorted.sort((a, b) => {
    let aVal = a[currentSort] ?? 0;
    let bVal = b[currentSort] ?? 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  renderCars(sorted);
}

window.applyFilters = function () {
  const brand = brandInput().toLowerCase();
  const model = modelInput().toLowerCase();
  const year = yearInput();
  const price = priceInput();
  const mileage = mileageInput();

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

function renderCars(list) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  list.forEach(car => {
    const card = document.createElement('a');
    card.className = 'car-card';
    card.href = `/car.html?id=${car.id}`;

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${car.images?.[0] || ''}">
      </div>

      <div class="info">
        <div class="car-title">${car.brand} ${car.model}</div>
        <div class="meta">
          ${car.year ? `<div>${car.year}</div>` : ''}
          ${car.mileage ? `<div>${formatPrice(car.mileage)} км</div>` : ''}
          ${car.gearbox ? `<div>${car.gearbox}</div>` : ''}
          ${car.engine_volume ? `<div>${car.engine_volume} л</div>` : ''}
          ${car.fuel_type ? `<div>${car.fuel_type}</div>` : ''}
        </div>
      </div>

      <div class="price-badge">${formatPrice(car.price)} €</div>
    `;

    catalog.appendChild(card);
  });
}

function brandInput() { return document.getElementById('brand').value || ''; }
function modelInput() { return document.getElementById('model').value || ''; }
function yearInput() { return document.getElementById('year').value || ''; }
function priceInput() { return document.getElementById('price').value || ''; }
function mileageInput() { return document.getElementById('mileage').value || ''; }

document.addEventListener('DOMContentLoaded', loadCars);

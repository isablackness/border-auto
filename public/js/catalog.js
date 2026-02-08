var cars = [];
var filteredCars = [];

/* LOAD */
function loadCars() {
  fetch('/api/cars')
    .then(res => res.json())
    .then(data => {
      cars = data || [];
      filteredCars = cars.slice();
      fillYears();
      renderCars(filteredCars);
    });
}

/* YEARS */
function fillYears() {
  var yearSelect = document.getElementById('year');
  var years = [...new Set(cars.map(c => c.year))].sort((a,b)=>b-a);
  years.forEach(y => {
    var opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });
}

/* FILTERS */
window.applyFilters = function () {
  var brand = brandInput.value.toLowerCase();
  var model = modelInput.value.toLowerCase();
  var year = yearSelect.value;
  var price = priceInput.value;
  var mileage = mileageInput.value;

  filteredCars = cars.filter(c => {
    if (brand && !c.brand.toLowerCase().includes(brand)) return false;
    if (model && !c.model.toLowerCase().includes(model)) return false;
    if (year && c.year != year) return false;
    if (price && c.price > price) return false;
    if (mileage && c.mileage > mileage) return false;
    return true;
  });

  renderCars(filteredCars);
};

/* RESET */
window.resetFilters = function () {
  brandInput.value = '';
  modelInput.value = '';
  yearSelect.value = '';
  priceInput.value = '';
  mileageInput.value = '';
  filteredCars = cars.slice();
  renderCars(filteredCars);
};

/* RENDER */
function renderCars(list) {
  catalog.innerHTML = '';
  list.forEach(car => {
    var card = document.createElement('div');
    card.className = 'car-card';
    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${car.images?.[0] || ''}">
        <div class="price-badge">${format(car.price)} €</div>
        <a class="card-overlay" href="/car.html?id=${car.id}">
          <div class="overlay-button">Подробнее</div>
        </a>
      </div>
      <div class="info">
        <h3>${car.brand} ${car.model}</h3>
        <div class="meta">
          <div>${car.year}</div>
          <div>${format(car.mileage)} км</div>
        </div>
      </div>`;
    catalog.appendChild(card);
  });
}

/* HELPERS */
function format(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/* INIT */
var brandInput = document.getElementById('brand');
var modelInput = document.getElementById('model');
var yearSelect = document.getElementById('year');
var priceInput = document.getElementById('price');
var mileageInput = document.getElementById('mileage');
var catalog = document.getElementById('catalog');

loadCars();

var cars = [];
var filteredCars = [];

var currentSort = 'position';
var sortDir = 'desc';

/* ================= LOAD ================= */
function loadCars() {
  fetch('/api/cars')
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      cars = data || [];
      filteredCars = cars.slice();
      sortAndRender();
    })
    .catch(function (err) {
      console.error('Ошибка загрузки авто:', err);
    });
}

/* ================= SORT ================= */
function sortAndRender() {
  var sorted = filteredCars.slice();

  sorted.sort(function (a, b) {
    var valA = a[currentSort] !== undefined ? a[currentSort] : 0;
    var valB = b[currentSort] !== undefined ? b[currentSort] : 0;

    if (sortDir === 'asc') {
      return valA - valB;
    } else {
      return valB - valA;
    }
  });

  renderCars(sorted);
}

/* ================= FILTERS ================= */
window.applyFilters = function () {
  var brand = document.getElementById('brand').value.toLowerCase();
  var model = document.getElementById('model').value.toLowerCase();
  var year = document.getElementById('year').value;
  var price = document.getElementById('price').value;
  var mileage = document.getElementById('mileage').value;

  filteredCars = cars.filter(function (car) {
    if (brand && car.brand.toLowerCase().indexOf(brand) === -1) return false;
    if (model && car.model.toLowerCase().indexOf(model) === -1) return false;
    if (year && car.year != year) return false;
    if (price && car.price > price) return false;
    if (mileage && car.mileage > mileage) return false;
    return true;
  });

  sortAndRender();
};

/* ================= SORT BUTTONS ================= */
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-sort]');
  if (!btn) return;

  var sort = btn.dataset.sort;

  if (currentSort === sort) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort = sort;
    sortDir = 'desc';
  }

  sortAndRender();
});

/* ================= PRICE HELPERS ================= */
function formatPrice(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function animatePrice(el, value) {
  var duration = 400;
  var startTime = performance.now();

  function step(now) {
    var progress = Math.min((now - startTime) / duration, 1);
    var current = Math.floor(progress * value);
    el.textContent = formatPrice(current) + ' €';

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/* ================= RENDER ================= */
function renderCars(list) {
  var catalog = document.getElementById('catalog');
  if (!catalog) return;

  catalog.innerHTML = '';

  list.forEach(function (car) {
    var card = document.createElement('div');
    card.className = 'car-card';

    var imgHtml = '';
    if (car.images && car.images.length > 0) {
      imgHtml = '<img src="' + car.images[0] + '" alt="">';
    } else {
      imgHtml = '<div class="no-photo">Нет фото</div>';
    }

    card.innerHTML =
      '<div class="image-wrapper">' +
        imgHtml +
        '<div class="price-badge">' + formatPrice(car.price) + ' €</div>' +
        '<a class="card-overlay" href="/car.html?id=' + car.id + '">' +
          '<div class="overlay-button">Подробнее</div>' +
        '</a>' +
      '</div>' +
      '<div class="info">' +
        '<h3>' + car.brand + ' ' + car.model + '</h3>' +
        '<div class="meta">' +
          '<div>' + car.year + '</div>' +
          '<div>' + car.mileage + ' км</div>' +
        '</div>' +
      '</div>';

    var priceEl = card.querySelector('.price-badge');
    var priceValue = car.price;
    var animated = false;

    card.addEventListener('mouseenter', function () {
      if (animated) return;
      animated = true;
      animatePrice(priceEl, priceValue);
    });

    card.addEventListener('mouseleave', function () {
      animated = false;
      priceEl.textContent = formatPrice(priceValue) + ' €';
    });

    catalog.appendChild(card);
  });
}

loadCars();

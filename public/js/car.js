const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

let images = [];
let currentIndex = 0;

async function loadCar() {
  const res = await fetch(`/api/cars/${carId}`);
  const car = await res.json();

  document.getElementById("carTitle").textContent =
    `${car.brand} ${car.model}`;

  document.getElementById("carYear").textContent = car.year;
  document.getElementById("carMileage").textContent = car.mileage;
  document.getElementById("carPrice").textContent = car.price;

  // 🔥 ВАЖНО: эти поля должны быть в БД
  document.getElementById("carEngine").textContent = car.engine || "—";
  document.getElementById("carGearbox").textContent = car.gearbox || "—";

  renderFeatures(car.features || []);

  images = car.images || [];
  if (images.length) {
    setMainImage(0);
    renderThumbs();
  }
}

function renderFeatures(list) {
  const container = document.getElementById("carFeatures");
  container.innerHTML = "";

  list.forEach(text => {
    const span = document.createElement("span");
    span.className = "feature";
    span.textContent = text;
    container.appendChild(span);
  });
}

/* ===== GALLERY ===== */
function setMainImage(index) {
  currentIndex = index;
  document.getElementById("mainImage").src = images[index];

  document.querySelectorAll(".gallery-thumbs img").forEach((img, i) => {
    img.classList.toggle("active", i === index);
  });
}

function renderThumbs() {
  const container = document.getElementById("thumbnails");
  container.innerHTML = "";

  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => setMainImage(index);
    if (index === 0) img.classList.add("active");
    container.appendChild(img);
  });
}

document.getElementById("prevBtn").onclick = () => {
  setMainImage((currentIndex - 1 + images.length) % images.length);
};

document.getElementById("nextBtn").onclick = () => {
  setMainImage((currentIndex + 1) % images.length);
};

loadCar();

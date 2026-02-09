const id = new URLSearchParams(location.search).get("id");

let images = [];
let index = 0;
let lensEnabled = false;
let zoom = 2.5;

const mainImg = document.getElementById("mainImage");
const viewer = document.getElementById("imageViewer");
const viewerImg = document.getElementById("viewerImage");
const wrapper = document.querySelector(".viewer-image-wrapper");

const lens = document.createElement("div");
lens.className = "zoom-lens";
wrapper.appendChild(lens);

async function loadCar() {
  const car = await (await fetch(`/api/cars/${id}`)).json();

  document.getElementById("carTitle").textContent =
    `${car.brand} ${car.model}`;

  document.getElementById("carPrice").textContent = car.price;

  document.getElementById("carDescription").innerHTML =
    (car.description || "").replace(/\n/g, "<br>");

  /* 🔽 ПАРАМЕТРЫ ПОД ЦЕНОЙ */
  document.getElementById("carMeta").innerHTML = `
    ${car.year ? `<div>${car.year}</div>` : ''}
    ${car.mileage ? `<div>${car.mileage.toLocaleString()} км</div>` : ''}
    ${car.gearbox ? `<div>${car.gearbox}</div>` : ''}
    ${car.engine_volume ? `<div>${car.engine_volume} л</div>` : ''}
    ${car.fuel_type ? `<div>${car.fuel_type}</div>` : ''}
  `;

  images = car.images || [];
  if (images.length) {
    setMain(0);
    renderThumbs();
    renderViewerThumbs();
  }
}

/* ---- ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ ---- */

function setMain(i) {
  index = i;
  mainImg.src = images[i];
  document.getElementById("galleryCounter").textContent =
    `${i + 1} / ${images.length}`;

  document.querySelectorAll(".gallery-thumbs img")
    .forEach((img, idx) => img.classList.toggle("active", idx === i));
}

function renderThumbs() {
  const c = document.getElementById("thumbnails");
  c.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => setMain(i);
    c.appendChild(img);
  });
}

function renderViewerThumbs() {
  const c = document.getElementById("viewerThumbs");
  c.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = e => {
      e.stopPropagation();
      setViewer(i);
    };
    c.appendChild(img);
  });
}

/* остальной код у тебя корректный — не трогаем */

loadCar();

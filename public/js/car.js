const id = new URLSearchParams(location.search).get("id");

let images = [];
let index = 0;
let zoom = 2.5;
let zoomEnabled = false;

/* ===== HELPERS ===== */

function formatPrice(value) {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* ===== ELEMENTS ===== */

const mainImg = document.getElementById("mainImage");
const thumbs = document.getElementById("thumbnails");
const counter = document.getElementById("galleryCounter");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const openFullscreenBtn = document.getElementById("openFullscreen");

/* fullscreen */
const viewer = document.getElementById("imageViewer");
const viewerImg = document.getElementById("viewerImage");
const viewerThumbs = document.getElementById("viewerThumbs");
const viewerCounter = document.getElementById("viewerCounter");
const viewerPrev = document.getElementById("viewerPrev");
const viewerNext = document.getElementById("viewerNext");
const viewerWrapper = document.querySelector(".viewer-image-wrapper");

/* zoom lens */
const lens = document.createElement("div");
lens.className = "zoom-lens";
viewerWrapper.appendChild(lens);

/* ===== LOAD ===== */

async function loadCar() {
  const car = await (await fetch(`/api/cars/${id}`)).json();

  document.getElementById("carTitle").textContent =
    `${car.brand} ${car.model}`;

  document.getElementById("carPrice").textContent =
    formatPrice(car.price);

  document.getElementById("carDescription").innerHTML =
    (car.description || "").replace(/\n/g, "<br>");

  document.getElementById("carMeta").innerHTML = `
    ${car.year ? `<div>${car.year}</div>` : ''}
    ${car.mileage ? `<div>${car.mileage.toLocaleString()} км</div>` : ''}
    ${car.gearbox ? `<div>${car.gearbox}</div>` : ''}
    ${car.engine_volume ? `<div>${car.engine_volume} л</div>` : ''}
    ${car.fuel_type ? `<div>${car.fuel_type}</div>` : ''}
  `;

  images = car.images || [];
  if (!images.length) return;

  renderThumbs();
  renderViewerThumbs();
  setMain(0);
}

/* ===== MAIN GALLERY ===== */

function setMain(i) {
  index = i;
  mainImg.src = images[i];
  counter.textContent = `${i + 1} / ${images.length}`;

  thumbs.querySelectorAll("img").forEach((img, idx) => {
    img.classList.toggle("active", idx === i);
  });
}

function renderThumbs() {
  thumbs.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => setMain(i);
    thumbs.appendChild(img);
  });
}

prevBtn.onclick = () =>
  setMain((index - 1 + images.length) % images.length);

nextBtn.onclick = () =>
  setMain((index + 1) % images.length);

/* ===== FULLSCREEN ===== */

function openFullscreen() {
  viewer.classList.add("open");
  document.body.style.overflow = "hidden";

  zoomEnabled = false;
  lens.style.display = "none";
  viewerImg.style.transform = "scale(1)";

  setViewer(index);
}

openFullscreenBtn.onclick = openFullscreen;
mainImg.onclick = openFullscreen;

function setViewer(i) {
  index = i;
  viewerImg.src = images[i];
  viewerCounter.textContent = `${i + 1} / ${images.length}`;

  viewerThumbs.querySelectorAll("img").forEach((img, idx) => {
    img.classList.toggle("active", idx === i);
  });
}

function renderViewerThumbs() {
  viewerThumbs.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = e => {
      e.stopPropagation();
      setViewer(i);
    };
    viewerThumbs.appendChild(img);
  });
}

viewerPrev.onclick = e => {
  e.stopPropagation();
  setViewer((index - 1 + images.length) % images.length);
};

viewerNext.onclick = e => {
  e.stopPropagation();
  setViewer((index + 1) % images.length);
};

viewer.onclick = () => closeFullscreen();

function closeFullscreen() {
  viewer.classList.remove("open");
  document.body.style.overflow = "";
  zoomEnabled = false;
  lens.style.display = "none";
  viewerImg.style.transform = "scale(1)";
}

/* ===== INIT ===== */

loadCar();

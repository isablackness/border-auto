const id = new URLSearchParams(location.search).get("id");

let images = [];
let index = 0;
let zoomEnabled = false;
let zoom = 2.5;

/* ================= HELPERS ================= */

function formatPrice(value) {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* ================= ELEMENTS ================= */

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

/* ================= LOAD ================= */

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

/* ================= MAIN GALLERY ================= */

function setMain(i) {
  if (!images.length) return;

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

/* arrows on page */
prevBtn.onclick = () =>
  setMain((index - 1 + images.length) % images.length);

nextBtn.onclick = () =>
  setMain((index + 1) % images.length);

/* keyboard on page */
document.addEventListener("keydown", e => {
  if (viewer.classList.contains("open")) return;

  if (e.key === "ArrowLeft")
    setMain((index - 1 + images.length) % images.length);

  if (e.key === "ArrowRight")
    setMain((index + 1) % images.length);
});

/* ================= FULLSCREEN ================= */

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

function closeFullscreen() {
  viewer.classList.remove("open");
  document.body.style.overflow = "";
  zoomEnabled = false;
  lens.style.display = "none";
  viewerImg.style.transform = "scale(1)";
}

viewer.onclick = closeFullscreen;

/* fullscreen arrows */
viewerPrev.onclick = e => {
  e.stopPropagation();
  setViewer((index - 1 + images.length) % images.length);
};

viewerNext.onclick = e => {
  e.stopPropagation();
  setViewer((index + 1) % images.length);
};

function setViewer(i) {
  if (!images.length) return;

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

/* keyboard in fullscreen */
document.addEventListener("keydown", e => {
  if (!viewer.classList.contains("open")) return;

  if (e.key === "ArrowLeft")
    setViewer((index - 1 + images.length) % images.length);

  if (e.key === "ArrowRight")
    setViewer((index + 1) % images.length);

  if (e.key === "Escape")
    closeFullscreen();
});

/* ================= ZOOM (LENS) ================= */

viewerImg.onclick = e => {
  e.stopPropagation();
  zoomEnabled = !zoomEnabled;

  if (!zoomEnabled) {
    lens.style.display = "none";
    viewerImg.style.transform = "scale(1)";
  }
};

viewerWrapper.onmousemove = e => {
  if (!zoomEnabled) return;

  const rect = viewerWrapper.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  lens.style.display = "block";
  lens.style.left = `${x - lens.offsetWidth / 2}px`;
  lens.style.top = `${y - lens.offsetHeight / 2}px`;

  viewerImg.style.transformOrigin =
    `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
  viewerImg.style.transform = `scale(${zoom})`;
};

viewerWrapper.onmouseleave = () => {
  if (!zoomEnabled) return;
  lens.style.display = "none";
  viewerImg.style.transform = "scale(1)";
};

/* ================= INIT ================= */

loadCar();

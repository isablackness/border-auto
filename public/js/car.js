const id = new URLSearchParams(location.search).get("id");

let images = [];
let index = 0;
let zoom = 2.5;

/* ===== ELEMENTS ===== */

const mainImg = document.getElementById("mainImage");
const thumbs = document.getElementById("thumbnails");
const counter = document.getElementById("galleryCounter");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const openFullscreen = document.getElementById("openFullscreen");

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

  document.getElementById("carPrice").textContent = car.price;

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

openFullscreen.onclick = () => {
  viewer.classList.add("open");
  setViewer(index);
};

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

/* close fullscreen */
viewer.onclick = () => viewer.classList.remove("open");

/* ===== ZOOM LENS ===== */

viewerWrapper.addEventListener("mousemove", e => {
  const rect = viewerWrapper.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  lens.style.display = "block";
  lens.style.left = `${x - lens.offsetWidth / 2}px`;
  lens.style.top = `${y - lens.offsetHeight / 2}px`;

  viewerImg.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
  viewerImg.style.transform = `scale(${zoom})`;
});

viewerWrapper.addEventListener("mouseleave", () => {
  lens.style.display = "none";
  viewerImg.style.transform = "scale(1)";
});

/* ===== INIT ===== */

loadCar();

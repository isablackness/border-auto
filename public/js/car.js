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

  images = car.images || [];
  if (images.length) {
    setMain(0);
    renderThumbs();
    renderViewerThumbs();
  }
}

function setMain(i) {
  index = i;
  mainImg.src = images[i];
  document.getElementById("galleryCounter").textContent =
    `${i + 1} / ${images.length}`;

  document.querySelectorAll(".gallery-thumbs img")
    .forEach((img, idx) => img.classList.toggle("active", idx === i));
}

function setViewer(i) {
  index = i;
  lensEnabled = false;
  lens.style.display = "none";
  viewerImg.src = images[i];

  viewerImg.onload = () => {
    lens.style.backgroundImage = `url(${viewerImg.src})`;
    lens.style.backgroundSize =
      `${viewerImg.naturalWidth * zoom}px ${viewerImg.naturalHeight * zoom}px`;
  };

  document.getElementById("viewerCounter").textContent =
    `${i + 1} / ${images.length}`;

  document.querySelectorAll(".viewer-thumbs img")
    .forEach((img, idx) => img.classList.toggle("active", idx === i));
}

/* thumbs */
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

/* arrows */
prevBtn.onclick = () =>
  setMain((index - 1 + images.length) % images.length);

nextBtn.onclick = () =>
  setMain((index + 1) % images.length);

viewerPrev.onclick = e => {
  e.stopPropagation();
  setViewer((index - 1 + images.length) % images.length);
};

viewerNext.onclick = e => {
  e.stopPropagation();
  setViewer((index + 1) % images.length);
};

/* keyboard */
document.addEventListener("keydown", e => {
  if (viewer.style.display === "flex") {
    if (e.key === "ArrowRight") setViewer((index + 1) % images.length);
    if (e.key === "ArrowLeft") setViewer((index - 1 + images.length) % images.length);
    if (e.key === "Escape") closeViewer();
  } else {
    if (e.key === "ArrowRight") setMain((index + 1) % images.length);
    if (e.key === "ArrowLeft") setMain((index - 1) % images.length);
  }
});

/* fullscreen */
openFullscreen.onclick =
mainImg.onclick = () => {
  viewer.style.display = "flex";
  setViewer(index);
};

/* REAL RECT ZOOM */
viewerImg.onclick = e => {
  e.stopPropagation();
  lensEnabled = !lensEnabled;
  lens.style.display = lensEnabled ? "block" : "none";
};

viewerImg.onmousemove = e => {
  if (!lensEnabled) return;

  const imgRect = viewerImg.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  const x = e.clientX - imgRect.left;
  const y = e.clientY - imgRect.top;

  const lx = e.clientX - wrapperRect.left - lens.offsetWidth / 2;
  const ly = e.clientY - wrapperRect.top - lens.offsetHeight / 2;

  lens.style.left = `${lx}px`;
  lens.style.top = `${ly}px`;

  const bgX = (x / imgRect.width) * viewerImg.naturalWidth * zoom - lens.offsetWidth / 2;
  const bgY = (y / imgRect.height) * viewerImg.naturalHeight * zoom - lens.offsetHeight / 2;

  lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
};

function closeViewer() {
  viewer.style.display = "none";
  lensEnabled = false;
  lens.style.display = "none";
}

viewer.onclick = closeViewer;

loadCar();

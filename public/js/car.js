const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

let images = [];
let currentIndex = 0;
let zoomed = false;

const viewer = document.getElementById("imageViewer");
const viewerImg = document.getElementById("viewerImage");
const zoomRect = document.getElementById("zoomRect");

async function loadCar() {
  const res = await fetch(`/api/cars/${carId}`);
  const car = await res.json();

  document.getElementById("carTitle").textContent =
    `${car.brand} ${car.model}`;
  document.getElementById("carPrice").textContent = car.price;
  document.getElementById("carDescription").innerHTML =
    (car.description || "").replace(/\n/g, "<br>");

  images = car.images || [];
  if (images.length) {
    setMainImage(0);
    renderThumbs();
  }
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
  const c = document.getElementById("thumbnails");
  c.innerHTML = "";

  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => setMainImage(i);
    c.appendChild(img);
  });
}

/* ===== ARROWS ===== */
document.getElementById("prevBtn").onclick = () =>
  setMainImage((currentIndex - 1 + images.length) % images.length);

document.getElementById("nextBtn").onclick = () =>
  setMainImage((currentIndex + 1) % images.length);

/* ===== FULLSCREEN ===== */
document.getElementById("mainImage").onclick = () => {
  viewer.style.display = "flex";
  viewerImg.src = images[currentIndex];
};

/* ===== VIEWER EVENTS ===== */
viewer.onclick = () => {
  viewer.style.display = "none";
  zoomRect.style.display = "none";
  zoomed = false;
};

/* ===== KEYBOARD ===== */
document.addEventListener("keydown", e => {
  if (viewer.style.display !== "flex") return;

  if (e.key === "ArrowRight")
    setViewer((currentIndex + 1) % images.length);

  if (e.key === "ArrowLeft")
    setViewer((currentIndex - 1 + images.length) % images.length);

  if (e.key === "Escape") viewer.click();
});

function setViewer(index) {
  currentIndex = index;
  viewerImg.src = images[index];
  setMainImage(index);
}

/* ===== ZOOM RECT ===== */
viewerImg.addEventListener("mousemove", e => {
  if (!zoomed) return;

  zoomRect.style.display = "block";
  zoomRect.style.left = e.clientX - 90 + "px";
  zoomRect.style.top = e.clientY - 60 + "px";
});

viewerImg.addEventListener("click", e => {
  e.stopPropagation();
  zoomed = !zoomed;
  zoomRect.style.display = zoomed ? "block" : "none";
});

loadCar();

const id = new URLSearchParams(location.search).get("id");

let images = [];
let index = 0;

const mainImg = document.getElementById("mainImage");
const viewer = document.getElementById("imageViewer");
const viewerImg = document.getElementById("viewerImage");

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
  viewerImg.src = images[i];
  document.getElementById("viewerCounter").textContent =
    `${i + 1} / ${images.length}`;

  document.querySelectorAll(".viewer-thumbs img")
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
    img.onclick = () => setViewer(i);
    c.appendChild(img);
  });
}

/* arrows */
prevBtn.onclick = () => setMain((index - 1 + images.length) % images.length);
nextBtn.onclick = () => setMain((index + 1) % images.length);

/* keyboard */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") setMain((index + 1) % images.length);
  if (e.key === "ArrowLeft") setMain((index - 1 + images.length) % images.length);
  if (e.key === "Escape") viewer.style.display = "none";
});

/* fullscreen */
openFullscreen.onclick =
mainImg.onclick = () => {
  viewer.style.display = "flex";
  setViewer(index);
};

/* viewer arrows */
viewerPrev.onclick = () => setViewer((index - 1 + images.length) % images.length);
viewerNext.onclick = () => setViewer((index + 1) % images.length);

/* zoom */
viewerImg.onclick = e => {
  e.stopPropagation();
  viewerImg.classList.toggle("zoomed");
};

viewer.onclick = () => {
  viewer.style.display = "none";
  viewerImg.classList.remove("zoomed");
};

loadCar();

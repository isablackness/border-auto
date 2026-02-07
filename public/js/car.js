const id = new URLSearchParams(location.search).get("id");

let images = [];
let index = 0;
let zoom = false;

const mainImg = document.getElementById("mainImage");
const viewer = document.getElementById("imageViewer");
const viewerImg = document.getElementById("viewerImage");
const zoomRect = document.getElementById("zoomRect");

async function loadCar() {
  const car = await (await fetch(`/api/cars/${id}`)).json();

  document.getElementById("carTitle").textContent =
    `${car.brand} ${car.model}`;
  document.getElementById("carPrice").textContent = car.price;
  document.getElementById("carDescription").innerHTML =
    (car.description || "").replace(/\n/g, "<br>");

  images = car.images || [];
  if (images.length) {
    setImage(0);
    renderThumbs();
  }
}

function setImage(i) {
  index = i;
  mainImg.src = images[i];
  document.getElementById("galleryCounter").textContent =
    `${i + 1} / ${images.length}`;

  document.querySelectorAll(".gallery-thumbs img")
    .forEach((el, idx) => el.classList.toggle("active", idx === i));
}

function renderThumbs() {
  const c = document.getElementById("thumbnails");
  c.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => setImage(i);
    c.appendChild(img);
  });
}

/* arrows */
prevBtn.onclick = () =>
  setImage((index - 1 + images.length) % images.length);
nextBtn.onclick = () =>
  setImage((index + 1) % images.length);

/* keyboard ALWAYS */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") setImage((index + 1) % images.length);
  if (e.key === "ArrowLeft") setImage((index - 1 + images.length) % images.length);
  if (e.key === "Escape") viewer.style.display = "none";
});

/* fullscreen */
mainImg.onclick =
openFullscreen.onclick = () => {
  viewer.style.display = "flex";
  viewerImg.src = images[index];
};

/* zoom */
viewerImg.onclick = e => {
  e.stopPropagation();
  zoom = !zoom;
  zoomRect.style.display = zoom ? "block" : "none";
};

viewerImg.onmousemove = e => {
  if (!zoom) return;
  zoomRect.style.left = e.clientX - 90 + "px";
  zoomRect.style.top = e.clientY - 60 + "px";
};

viewer.onclick = () => {
  viewer.style.display = "none";
  zoom = false;
  zoomRect.style.display = "none";
};

loadCar();

const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

let images = [];
let currentIndex = 0;

async function loadCar() {
  const res = await fetch(`/api/cars/${carId}`);
  const car = await res.json();

  document.getElementById("carTitle").textContent =
    `${car.brand} ${car.model}`;

  document.getElementById("carPrice").textContent = car.price;

  /* ===== ОПИСАНИЕ С ПЕРЕНОСАМИ СТРОК ===== */
  const desc = car.description || "";
  document.getElementById("carDescription").innerHTML =
    desc.replace(/\n/g, "<br>");

  /* ===== ГАЛЕРЕЯ ===== */
  images = car.images || [];
  if (images.length > 0) {
    setMainImage(0);
    renderThumbs();
  }
}

/* ===== GALLERY ===== */
function setMainImage(index) {
  currentIndex = index;

  document.getElementById("mainImage").src = images[index];

  // активная миниатюра
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
    container.appendChild(img);
  });
}

/* ===== ARROWS ===== */
document.getElementById("prevBtn").onclick = () => {
  if (!images.length) return;
  setMainImage((currentIndex - 1 + images.length) % images.length);
};

document.getElementById("nextBtn").onclick = () => {
  if (!images.length) return;
  setMainImage((currentIndex + 1) % images.length);
};

loadCar();

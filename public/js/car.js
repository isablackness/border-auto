const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let images = [];
let current = 0;

async function loadCar() {
  const res = await fetch(`/api/cars/${id}`);
  const car = await res.json();

  images = car.images || [];

  document.getElementById("title").textContent =
    `${car.brand} ${car.model}`;

  document.getElementById("meta").textContent =
    `${car.year} · ${car.mileage} км`;

  document.getElementById("price").textContent =
    `${car.price} €`;

  document.getElementById("description").textContent =
    car.description || "";

  showImage(0);
}

function showImage(index) {
  if (!images.length) return;
  current = (index + images.length) % images.length;
  document.getElementById("mainImage").src = images[current];
}

document.getElementById("prev").onclick = () => showImage(current - 1);
document.getElementById("next").onclick = () => showImage(current + 1);

loadCar();

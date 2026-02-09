const form = document.getElementById("carForm");
const title = document.getElementById("formTitle");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const imagesList = document.getElementById("imagesList");

const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

let images = [];

title.textContent = editId ? "Редактирование автомобиля" : "Добавление автомобиля";

/* ================= LOAD ================= */

async function loadCar() {
  if (!editId) return;

  try {
    const res = await fetch("/api/cars");
    const cars = await res.json();
    const car = cars.find(c => String(c.id) === String(editId));
    if (!car) throw new Error();

    form.brand.value = car.brand || "";
    form.model.value = car.model || "";
    form.year.value = car.year || "";
    form.price.value = car.price || "";
    form.mileage.value = car.mileage || "";
    form.gearbox.value = car.gearbox || "";
    form.description.value = car.description || "";

    images = car.images || [];
    renderImages();
  } catch {
    alert("Ошибка загрузки автомобиля");
  }
}

loadCar();

/* ================= IMAGES ================= */

function renderImages() {
  imagesList.innerHTML = "";

  images.forEach((src, index) => {
    const div = document.createElement("div");
    div.className = "image-thumb";

    div.innerHTML = `
      <img src="${src}">
      <button type="button">✕</button>
    `;

    div.querySelector("button").onclick = () => {
      images.splice(index, 1);
      renderImages();
    };

    imagesList.appendChild(div);
  });
}

/* drag & drop */

dropZone.onclick = () => fileInput.click();

dropZone.ondragover = e => {
  e.preventDefault();
  dropZone.classList.add("hover");
};

dropZone.ondragleave = () => dropZone.classList.remove("hover");

dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove("hover");
  handleFiles(e.dataTransfer.files);
};

fileInput.onchange = e => handleFiles(e.target.files);

function handleFiles(files) {
  [...files].forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      images.push(e.target.result);
      renderImages();
    };
    reader.readAsDataURL(file);
  });
}

/* ================= SAVE ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const data = {
    brand: form.brand.value.trim(),
    model: form.model.value.trim(),
    year: Number(form.year.value),
    price: Number(form.price.value),
    mileage: Number(form.mileage.value),
    gearbox: form.gearbox.value,
    description: form.description.value.trim(),
    images
  };

  const url = editId ? `/api/admin/cars/${editId}` : "/api/admin/cars";
  const method = editId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();
    location.href = "/admin/";
  } catch {
    alert("Ошибка сохранения");
  }
};

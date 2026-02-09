const form = document.getElementById("carForm");
const title = document.getElementById("formTitle");
const imageInput = document.getElementById("imageInput");
const addImageBtn = document.getElementById("addImage");
const imagesList = document.getElementById("imagesList");

const params = new URLSearchParams(location.search);
const editId = params.get("id");

let images = [];
let dragIndex = null;

title.textContent = editId
  ? "Редактирование автомобиля"
  : "Добавление автомобиля";

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

addImageBtn.onclick = () => {
  const url = imageInput.value.trim();
  if (!url) return;

  images.push(url);
  imageInput.value = "";
  renderImages();
};

function renderImages() {
  imagesList.innerHTML = "";

  images.forEach((src, index) => {
    const div = document.createElement("div");
    div.className = "image-thumb";
    div.draggable = true;

    div.innerHTML = `
      <img src="${src}">
      <button type="button">✕</button>
    `;

    div.ondragstart = () => dragIndex = index;

    div.ondragover = e => e.preventDefault();

    div.ondrop = () => {
      if (dragIndex === null || dragIndex === index) return;
      const moved = images.splice(dragIndex, 1)[0];
      images.splice(index, 0, moved);
      dragIndex = null;
      renderImages();
    };

    div.querySelector("button").onclick = () => {
      images.splice(index, 1);
      renderImages();
    };

    imagesList.appendChild(div);
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
    images // ⚠️ только URL, без base64
  };

  try {
    const res = await fetch(`/api/admin/cars/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();

    location.href = "/admin/";
  } catch {
    alert("Ошибка сохранения");
  }
};

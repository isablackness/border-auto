const form = document.getElementById("carForm");
const title = document.getElementById("formTitle");
const imageInput = document.getElementById("imageInput");
const imagesList = document.getElementById("imagesList");
const addImageBtn = document.getElementById("addImage");

const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

let images = [];

/* ================= MODE ================= */

title.textContent = editId
  ? "Редактирование автомобиля"
  : "Добавление автомобиля";

/* ================= LOAD ================= */

if (editId) {
  fetch(`/api/cars/${editId}`)
    .then(res => res.json())
    .then(car => {
      form.brand.value = car.brand || "";
      form.model.value = car.model || "";
      form.year.value = car.year || "";
      form.price.value = car.price || "";
      form.mileage.value = car.mileage || "";
      form.description.value = car.description || "";

      images = car.images || [];
      renderImages();
    })
    .catch(() => alert("Ошибка загрузки автомобиля"));
}

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
    div.className = "image-item";

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

/* ================= SAVE ================= */

form.onsubmit = async e => {
  e.preventDefault();

  const data = {
    brand: form.brand.value.trim(),
    model: form.model.value.trim(),
    year: Number(form.year.value),
    price: Number(form.price.value),
    mileage: Number(form.mileage.value),
    description: form.description.value.trim(),
    images
  };

  const url = editId
    ? `/api/admin/cars/${editId}`
    : "/api/admin/cars";

  const method = editId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();

    alert("Автомобиль сохранён");
    location.href = "/admin/";
  } catch {
    alert("Ошибка сохранения");
  }
};

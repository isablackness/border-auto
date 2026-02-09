const form = document.getElementById("carForm");
const imageInput = document.getElementById("imageInput");
const addImageBtn = document.getElementById("addImage");
const imagesList = document.getElementById("imagesList");
const dropZone = document.getElementById("dropZone");

const params = new URLSearchParams(location.search);
const editId = params.get("id");

let images = [];
let draggedIndex = null;

/* ================= LOAD ================= */

async function loadCar() {
  if (!editId) return;

  try {
    const res = await fetch(`/api/cars/${editId}`);
    if (!res.ok) throw new Error();

    const car = await res.json();

    form.brand.value = car.brand || "";
    form.model.value = car.model || "";
    form.year.value = car.year || "";
    form.price.value = car.price || "";
    form.mileage.value = car.mileage || "";
    form.gearbox.value = car.gearbox || "";
    form.description.value = car.description || "";

    images = Array.isArray(car.images) ? [...car.images] : [];
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
    const item = document.createElement("div");
    item.className = "image-thumb";
    item.draggable = true;

    item.innerHTML = `
      <img src="${src}">
      <button type="button">✕</button>
    `;

    item.ondragstart = () => draggedIndex = index;
    item.ondragover = e => e.preventDefault();

    item.ondrop = () => {
      if (draggedIndex === null || draggedIndex === index) return;
      const moved = images.splice(draggedIndex, 1)[0];
      images.splice(index, 0, moved);
      draggedIndex = null;
      renderImages();
    };

    item.querySelector("button").onclick = () => {
      images.splice(index, 1);
      renderImages();
    };

    imagesList.appendChild(item);
  });
}

/* ================= DROP ZONE (VISUAL) ================= */

dropZone.ondragover = e => {
  e.preventDefault();
  dropZone.classList.add("hover");
};

dropZone.ondragleave = () => dropZone.classList.remove("hover");

dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove("hover");
};

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

  try {
    const res = await fetch(`/api/cars/${editId}`, {
      method: "PUT",              // ✅ ЕДИНСТВЕННО ВЕРНО
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();

    location.href = "/admin/";
  } catch {
    alert("Ошибка сохранения");
  }
};

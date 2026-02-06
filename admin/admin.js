const form = document.getElementById("carForm");
const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const imageList = document.getElementById("imageList");

const params = new URLSearchParams(location.search);
const editId = params.get("id");

let images = [];

/* ===== LOAD DATA FOR EDIT ===== */
if (editId) {
  fetch(`/api/cars/${editId}`)
    .then(r => r.json())
    .then(car => {
      form.brand.value = car.brand;
      form.model.value = car.model;
      form.year.value = car.year;
      form.price.value = car.price;
      form.mileage.value = car.mileage;
      form.description.value = car.description || "";
      images = car.images || [];
      renderImages();
    });
}

/* ===== RENDER IMAGES ===== */
function renderImages() {
  imageList.innerHTML = "";
  images.forEach((src, index) => {
    const item = document.createElement("div");
    item.className = "image-item";
    item.draggable = true;
    item.innerHTML = `<img src="${src}">`;

    item.ondragstart = e => e.dataTransfer.setData("index", index);
    item.ondragover = e => e.preventDefault();
    item.ondrop = e => {
      const from = e.dataTransfer.getData("index");
      images.splice(index, 0, images.splice(from, 1)[0]);
      renderImages();
    };

    imageList.appendChild(item);
  });
}

/* ===== UPLOAD TO CLOUDINARY ===== */
dropZone.onclick = () => imageInput.click();

imageInput.onchange = async () => {
  const files = [...imageInput.files];

  const base64 = await Promise.all(
    files.map(
      f =>
        new Promise(res => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.readAsDataURL(f);
        })
    )
  );

  const r = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: base64 })
  });

  const uploaded = await r.json();
  images.push(...uploaded);
  renderImages();
};

/* ===== SAVE ===== */
form.onsubmit = async e => {
  e.preventDefault();

  const payload = {
    brand: form.brand.value,
    model: form.model.value,
    year: Number(form.year.value),
    price: Number(form.price.value),
    mileage: Number(form.mileage.value),
    description: form.description.value,
    images
  };

  const method = editId ? "PUT" : "POST";
  const url = editId ? `/api/admin/cars/${editId}` : "/api/admin/cars";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  location.href = "/admin/";
};

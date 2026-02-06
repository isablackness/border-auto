(async () => {
  const r = await fetch("/api/admin/check");
  if (!r.ok) location.href = "/admin/login.html";
})();

const form = document.getElementById("carForm");
const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const imageList = document.getElementById("imageList");

const params = new URLSearchParams(location.search);
const editId = params.get("id");
const mode = params.get("mode") || "car";

let images = [];

/* ===== LOAD ===== */
if (editId) {
  const url =
    mode === "draft"
      ? `/api/admin/instagram/draft/${editId}`
      : `/api/cars/${editId}`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      form.brand.value = data.brand || "";
      form.model.value = data.model || "";
      form.year.value = data.year || "";
      form.price.value = data.price || "";
      form.mileage.value = data.mileage || "";
      form.description.value = data.description || "";
      images = data.images || [];
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

/* ===== UPLOAD ===== */
async function uploadFiles(files) {
  const base64 = await Promise.all(
    [...files].map(
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
}

dropZone.onclick = () => imageInput.click();
imageInput.onchange = () => {
  uploadFiles(imageInput.files);
  imageInput.value = "";
};

dropZone.ondragover = e => e.preventDefault();
dropZone.ondrop = e => {
  e.preventDefault();
  uploadFiles(e.dataTransfer.files);
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

  let url, method;

  if (mode === "draft") {
    url = `/api/admin/instagram/draft/${editId}`;
    method = "PUT";
  } else {
    url = editId
      ? `/api/admin/cars/${editId}`
      : "/api/admin/cars";
    method = editId ? "PUT" : "POST";
  }

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (mode === "draft") {
    await fetch(`/api/admin/instagram/publish/${editId}`, {
      method: "POST"
    });
    location.href = "/admin/instagram.html";
  } else {
    location.href = "/admin/";
  }
};

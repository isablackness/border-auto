const form = document.getElementById("carForm");
const params = new URLSearchParams(location.search);
const id = params.get("id");

const imagesList = document.getElementById("imagesList");
const imageInput = document.getElementById("imageInput");
const addBtn = document.getElementById("addImage");

let images = [];
let drag = null;

if (id) load();

async function load() {
  const res = await fetch(`/api/cars/${id}`);
  const car = await res.json();

  form.brand.value = car.brand || "";
  form.model.value = car.model || "";
  form.year.value = car.year || "";
  form.mileage.value = car.mileage || "";
  form.price.value = car.price || "";
  form.gearbox.value = car.gearbox || "";
  form.engine_volume.value = car.engine_volume || "";
  form.fuel_type.value = car.fuel_type || "";
  form.description.value = car.description || "";

  images = car.images || [];
  render();
}

addBtn.onclick = () => {
  if (!imageInput.value) return;
  images.push(imageInput.value);
  imageInput.value = "";
  render();
};

function render() {
  imagesList.innerHTML = "";
  images.forEach((src, i) => {
    const d = document.createElement("div");
    d.className = "image-thumb";
    d.draggable = true;
    d.innerHTML = `<img src="${src}"><button>✕</button>`;

    d.ondragstart = () => drag = i;
    d.ondragover = e => e.preventDefault();
    d.ondrop = () => {
      const m = images.splice(drag, 1)[0];
      images.splice(i, 0, m);
      render();
    };

    d.querySelector("button").onclick = () => {
      images.splice(i, 1);
      render();
    };

    imagesList.appendChild(d);
  });
}

form.onsubmit = async e => {
  e.preventDefault();

  const data = {
    brand: form.brand.value,
    model: form.model.value,
    year: +form.year.value || null,
    mileage: +form.mileage.value || null,
    price: +form.price.value || null,
    gearbox: form.gearbox.value,
    engine_volume: form.engine_volume.value || null,
    fuel_type: form.fuel_type.value || null,
    description: form.description.value,
    images
  };

  await fetch(`/api/cars/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  location.href = "index.html";
};

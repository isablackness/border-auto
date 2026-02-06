const params = new URLSearchParams(location.search);
const editId = params.get("id");

/* ===== LOAD FOR EDIT ===== */
const form = document.getElementById("carForm");

if (form && editId) {
  fetch(`/api/cars/${editId}`)
    .then(res => res.json())
    .then(car => {
      form.brand.value = car.brand;
      form.model.value = car.model;
      form.year.value = car.year;
      form.price.value = car.price;
      form.mileage.value = car.mileage;
      form.description.value = car.description;
      form.images.value = (car.images || []).join("\n");
    });
}

/* ===== SAVE ===== */
if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const payload = {
      brand: form.brand.value,
      model: form.model.value,
      year: Number(form.year.value),
      price: Number(form.price.value),
      mileage: Number(form.mileage.value),
      description: form.description.value,
      images: form.images.value.split("\n").map(s => s.trim()).filter(Boolean)
    };

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `/api/admin/cars/${editId}`
      : "/api/admin/cars";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) location.href = "/admin/";
    else alert("Ошибка сохранения");
  });
}

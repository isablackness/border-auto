const list = document.getElementById("carList");

async function load() {
  const res = await fetch("/api/cars");
  const cars = await res.json();
  list.innerHTML = "";

  cars.forEach(car => {
    const div = document.createElement("div");
    div.className = "admin-car";

    div.innerHTML = `
      <img src="${car.images?.[0] || ""}">
      <div class="info">
        <strong>${car.brand} ${car.model}</strong>
        <span>${car.year}</span>
        <span>${car.price} €</span>
      </div>
      <div class="actions">
        <button onclick="edit(${car.id})">✏️</button>
        <button onclick="del(${car.id})">🗑</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function edit(id) {
  location.href = `edit.html?id=${id}`;
}

async function del(id) {
  if (!confirm("Удалить?")) return;
  await fetch(`/api/cars/${id}`, { method: "DELETE" });
  load();
}

function logout() {
  localStorage.removeItem("adminAuth");
  location.href = "login.html";
}

load();

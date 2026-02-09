const list = document.getElementById("carList");

function formatPrice(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function loadCars() {
  const res = await fetch("/api/cars");
  const cars = await res.json();

  list.innerHTML = "";

  cars.forEach(car => {
    const img = car.images && car.images.length
      ? car.images[0]
      : "";

    const card = document.createElement("div");
    card.className = "admin-car";

    card.innerHTML = `
      <img src="${img}" alt="">
      <div class="info">
        <strong>${car.brand} ${car.model}</strong>
        <div>${car.year}</div>
        <div class="price">${formatPrice(car.price)} €</div>
      </div>
      <div class="actions">
        <button class="edit" onclick="editCar('${car.id}')">Редактировать</button>
        <button class="delete" onclick="deleteCar('${car.id}')">Удалить</button>
      </div>
    `;

    list.appendChild(card);
  });
}

loadCars();

window.editCar = id => {
  location.href = `/admin/edit.html?id=${id}`;
};

window.deleteCar = async id => {
  if (!confirm("Удалить автомобиль?")) return;

  const res = await fetch(`/api/admin/cars/${id}`, {
    method: "DELETE"
  });

  if (res.ok) loadCars();
  else alert("Ошибка удаления");
};

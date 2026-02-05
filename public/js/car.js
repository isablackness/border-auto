const container = document.getElementById("car-container");

// получаем id из URL
const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

if (!carId) {
  container.innerHTML = "<p>Автомобиль не найден</p>";
  throw new Error("No car ID in URL");
}

async function loadCar() {
  try {
    const res = await fetch(`/api/cars/${carId}`);
    if (!res.ok) throw new Error("Car not found");

    const car = await res.json();
    renderCar(car);
  } catch (err) {
    container.innerHTML = "<p>Ошибка загрузки автомобиля</p>";
    console.error(err);
  }
}

function renderCar(car) {
  const images = car.images && car.images.length
    ? car.images.map(img => `<img src="${img}" />`).join("")
    : `<img src="/images/no-photo.jpg" />`;

  container.innerHTML = `
    <div class="car-detail">
      <div class="car-gallery">
        ${images}
      </div>

      <div class="car-info">
        <h1>${car.brand} ${car.model}</h1>
        <p><b>Год:</b> ${car.year}</p>
        <p><b>Пробег:</b> ${car.mileage} км</p>
        <p><b>Цена:</b> ${car.price} €</p>

        <p class="car-description">${car.description || ""}</p>

        <div class="car-buttons">
          <a class="instagram" target="_blank"
             href="https://www.instagram.com/border.auto/">Instagram</a>

          <a class="whatsapp" target="_blank"
             href="https://api.whatsapp.com/send?phone=48668989731">
             WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
}

loadCar();

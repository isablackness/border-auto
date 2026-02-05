const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

const car = cars.find(c => c.id === id);
const container = document.getElementById("car");

if (!car) {
  container.innerHTML = "<p>Автомобиль не найден</p>";
} else {
  container.innerHTML = `
    <h2>${car.brand} ${car.model}</h2>
    <p>Год: ${car.year}</p>
    <p>Пробег: ${car.mileage} км</p>
    <p>Цена: ${car.price} $</p>
    <p>${car.description}</p>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  /* ================= NO PHOTO HANDLER ================= */
  const cards = document.querySelectorAll(".car-card");

  cards.forEach(card => {
    const imageWrapper = card.querySelector(".image-wrapper");
    const img = imageWrapper ? imageWrapper.querySelector("img") : null;

    if (!img || !img.getAttribute("src")) {
      imageWrapper.classList.add("no-photo");
      return;
    }

    img.addEventListener("error", () => {
      imageWrapper.classList.add("no-photo");
    });
  });

  /* ================= SORT ARROWS ================= */
  const sortButtons = document.querySelectorAll(".sort-bar button");

  sortButtons.forEach(button => {
    button.addEventListener("click", () => {
      const isAsc = button.classList.contains("asc");
      const isDesc = button.classList.contains("desc");

      // сброс у всех
      sortButtons.forEach(b => {
        b.classList.remove("asc", "desc", "active");
      });

      button.classList.add("active");

      if (!isAsc && !isDesc) {
        button.classList.add("asc");
      } else if (isAsc) {
        button.classList.add("desc");
      } else {
        button.classList.add("asc");
      }
    });
  });
});

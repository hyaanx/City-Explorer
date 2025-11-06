// DOM Elements
const submit = document.querySelector(".search-form button");
const overlay = document.querySelector(".overlay");
const swiperWrapper = document.querySelector(".swiper-wrapper");
const boxesContainer = document.querySelector(".boxes");
const popupContent = document.querySelector(".popup-content");
let closeBtn = document.querySelector(".close-btn");

// Function to create a skeleton card
function createSkeletonCard() {
  return `
    <div class="box loading">
      <div class="skeleton-box skeleton-img"></div>
      <div class="info">
        <div>
          <div class="skeleton-box skeleton-title"></div>
          <div class="skeleton-box skeleton-text"></div>
        </div>
        <div class="skeleton-box skeleton-button"></div>
      </div>
    </div>
  `;
}

// Show skeleton loading cards
function showSkeleton(count = 6) {
  boxesContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    boxesContainer.innerHTML += createSkeletonCard();
  }
}

// Restore content (used only if needed)
function restoreContent(content) {
  boxesContainer.innerHTML = content;
}

// Fetch city images
async function fetchCityImages(city) {
  swiperWrapper.innerHTML = ""; // تنظيف slides القديمة
  const accessKey = "VWeqO5AvVaJuq6W9rfSG2hko0c-paj83vLyC4nTJKjI";

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${city}&client_id=${accessKey}`
    );
    const data = await response.json();

    data.results.slice(0, 10).forEach((imgData) => {
      const swiperSlide = document.createElement("div");
      swiperSlide.classList.add("swiper-slide");

      const skeleton = document.createElement("div");
      skeleton.classList.add("skeleton-box");
      swiperSlide.appendChild(skeleton);

      const img = document.createElement("img");
      img.src = imgData.urls.small;

      img.onload = () => {
        skeleton.remove();
        swiperSlide.appendChild(img);
      };

      swiperWrapper.appendChild(swiperSlide);
    });
  } catch (error) {
    console.error("Error fetching city images:", error);
  }
}

// Fetch city info
async function fetchCityInfo(city) {
  const cityNameEl = popupContent.querySelector("h2");
  const populationEl = popupContent.querySelector(".population");
  const countryEl = popupContent.querySelector(".country");

  // Show skeleton
  [cityNameEl, populationEl, countryEl].forEach((el) => {
    el.classList.add("loading");
    el.textContent = "";
  });

  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/city?name=${city}`,
      {
        method: "GET",
        headers: { "X-Api-Key": "TR4sd2QUIjeqdNPEeuz9Iw==lDXUe2hPAeuyFiga" },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const cityInfo = data[0];

    // Remove skeleton
    [cityNameEl, populationEl, countryEl].forEach((el) =>
      el.classList.remove("loading")
    );

    cityNameEl.textContent = cityInfo.name;
    populationEl.textContent = `Population: ${cityInfo.population}`;
    countryEl.textContent = `Country: ${cityInfo.country}`;
  } catch (error) {
    document.querySelector(".close-btn").style.display =
      popupContent.innerHTML = `
      <div class="error">
        <h3>City not found</h3>
        <button class="close-btn"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;
    attachCloseEvent();
  }
}

// Attach close button event
function attachCloseEvent() {
  closeBtn = document.querySelector(".close-btn");
  closeBtn?.addEventListener("click", () => {
    overlay.classList.remove("active");
  });
}

attachCloseEvent();

// ----------------------------------------------------
function handleCitySearch(city) {
  if (!city) return;

  overlay.classList.add("active");
  fetchCityInfo(city);
  fetchCityImages(city);
}
// ----------------------------------------------------

// Handle box click (delegate event)
boxesContainer.addEventListener("click", (e) => {
  const box = e.target.closest(".box");
  if (!box) return;

  const city = box.querySelector("h3")?.textContent;
  if (!city) return;

  handleCitySearch(city);
});

// Handle search submit
submit.addEventListener("click", (e) => {
  e.preventDefault();
  const city = document.querySelector(".search-form input").value.trim();

  handleCitySearch(city);
});

// Initialize Swiper
document.addEventListener("DOMContentLoaded", () => {
  new Swiper(".swiper", {
    effect: "slide",
    grabCursor: true,
    centeredSlides: true,
    initialSlide: 0,
    speed: 600,
    slidesPerView: "auto",
    pagination: { el: ".swiper-pagination" },
  });
});

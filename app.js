// === Инициализация Telegram WebApp ===
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// === Состояние ===
let cart = [];           // [{ id, title, price, qty }]
let activeCategory = "Все";

// === DOM ===
const catalogEl = document.getElementById("catalog");
const categoriesEl = document.getElementById("categories");
const cartCountEl = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");

// === Рендер категорий ===
function renderCategories() {
  categoriesEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "category-chip" + (cat === activeCategory ? " active" : "");
    chip.textContent = cat;
    chip.onclick = () => { activeCategory = cat; renderCategories(); renderCatalog(); };
    categoriesEl.appendChild(chip);
  });
}

// === Рендер каталога ===
function renderCatalog() {
  catalogEl.innerHTML = "";
  const list = activeCategory === "Все"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <div class="card__body">
        <span class="card__title">${p.title}</span>
        <span class="card__price">${p.price} ₽</span>
        <button class="card__btn">В корзину</button>
      </div>
    `;
    card.querySelector(".card__btn").onclick = () => addToCart(p);
    catalogEl.appendChild(card);
  });
}

// === Корзина ===
function addToCart(product) {
  const item = cart.find((i) => i.id === product.id);
  if (item) item.qty++;
  else cart.push({ ...product, qty: 1 });
  updateCart();
}

function updateCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = count;

  cartItemsEl.innerHTML = cart.length
    ? ""
    : "<p>Корзина пуста</p>";

  cart.forEach((i) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <span>${i.title} × ${i.qty}</span>
      <span>${i.price * i.qty} ₽</span>
    `;
    cartItemsEl.appendChild(row);
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  cartTotalEl.textContent = total + " ₽";
}

// === Оформление заказа (отправка данных боту) ===
function checkout() {
  if (!cart.length) return;
  const order = {
    items: cart,
    total: cart.reduce((s, i) => s + i.price * i.qty, 0),
  };
  // Данные уйдут в бот через event "web_app_data"
  tg.sendData(JSON.stringify(order));
  tg.close();
}

// === Слушатели ===
document.getElementById("cartBtn").onclick = () => cartModal.classList.remove("hidden");
document.getElementById("closeCart").onclick = () => cartModal.classList.add("hidden");
document.getElementById("checkoutBtn").onclick = checkout;

// === Запуск ===
renderCategories();
renderCatalog();
updateCart();

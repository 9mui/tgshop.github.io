const telegram = window.Telegram?.WebApp;
const isTelegram = Boolean(telegram?.initData);
const storageKey = "tgshop-cart-v2";

if (isTelegram) {
  telegram.ready();
  telegram.expand();
  telegram.setHeaderColor?.("bg_color");
  telegram.setBackgroundColor?.("bg_color");
}

document.documentElement.classList.toggle("telegram-env", isTelegram);

let cart = loadCart();
let activeCategory = "Все";
let currentScreen = "catalog";
let toastTimer;

const elements = {
  title: document.getElementById("screenTitle"),
  subtitle: document.getElementById("screenSubtitle"),
  categories: document.getElementById("categories"),
  catalog: document.getElementById("catalog"),
  catalogScreen: document.getElementById("catalogScreen"),
  cartScreen: document.getElementById("cartScreen"),
  cartShortcut: document.getElementById("cartShortcut"),
  browserBackButton: document.getElementById("browserBackButton"),
  cartCount: document.getElementById("cartCount"),
  cartItems: document.getElementById("cartItems"),
  cartSummary: document.getElementById("cartSummary"),
  cartTotal: document.getElementById("cartTotal"),
  browserMainButton: document.getElementById("browserMainButton"),
  toast: document.getElementById("toast"),
};

function formatPrice(value) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(saved)) return [];

    return saved
      .filter((item) => PRODUCTS.some((product) => product.id === item.id))
      .map((item) => ({ id: Number(item.id), qty: Math.max(1, Number(item.qty) || 1) }));
  } catch {
    return [];
  }
}

function persistCart() {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

function getProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function getQuantity(id) {
  return cart.find((item) => item.id === id)?.qty || 0;
}

function getCartState() {
  return cart.reduce((state, item) => {
    const product = getProduct(item.id);
    if (!product) return state;
    state.count += item.qty;
    state.total += product.price * item.qty;
    return state;
  }, { count: 0, total: 0 });
}

function haptic(type = "selection") {
  if (!isTelegram || !telegram?.HapticFeedback) return;
  if (type === "selection") telegram.HapticFeedback.selectionChanged();
  else telegram.HapticFeedback.notificationOccurred(type);
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 1600);
}

function createStepper(productId, quantity, context) {
  return `
    <div class="stepper" aria-label="Количество товара">
      <button class="stepper-button" type="button" data-action="decrease" data-id="${productId}" data-context="${context}" aria-label="Уменьшить количество">−</button>
      <span class="stepper-value" aria-live="polite">${quantity}</span>
      <button class="stepper-button" type="button" data-action="increase" data-id="${productId}" data-context="${context}" aria-label="Увеличить количество">+</button>
    </div>`;
}

function renderCategories() {
  elements.categories.replaceChildren(...CATEGORIES.map((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-chip${category === activeCategory ? " active" : ""}`;
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      if (activeCategory === category) return;
      activeCategory = category;
      haptic();
      renderCategories();
      renderCatalog();
    });
    return button;
  }));
}

function renderCatalog() {
  const products = activeCategory === "Все"
    ? PRODUCTS
    : PRODUCTS.filter((product) => product.category === activeCategory);

  elements.catalog.innerHTML = products.map((product) => {
    const quantity = getQuantity(product.id);
    const action = quantity
      ? createStepper(product.id, quantity, "catalog")
      : `<button class="add-button" type="button" data-action="increase" data-id="${product.id}" data-context="catalog">+ Добавить</button>`;

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img class="product-image" src="${product.image}" alt="${product.title}" width="720" height="960" loading="lazy" />
        </div>
        <div class="product-info">
          <h2 class="product-title">${product.title}</h2>
          <span class="product-price">${formatPrice(product.price)}</span>
          <div class="product-action">${action}</div>
        </div>
      </article>`;
  }).join("");
}

function renderCart() {
  if (!cart.length) {
    elements.cartItems.innerHTML = `
      <div class="empty-cart">
        <div>
          <div class="empty-cart-icon" aria-hidden="true">🛍</div>
          <h2>Корзина пуста</h2>
          <p>Добавьте вещи из каталога</p>
        </div>
      </div>`;
    elements.cartSummary.classList.add("hidden");
    return;
  }

  elements.cartItems.innerHTML = cart.map((item) => {
    const product = getProduct(item.id);
    return `
      <article class="cart-item">
        <img class="cart-item-image" src="${product.image}" alt="${product.title}" width="720" height="960" />
        <div class="cart-item-content">
          <div class="cart-item-header">
            <div>
              <h2 class="cart-item-title">${product.title}</h2>
              <div class="cart-item-unit-price">${formatPrice(product.price)}</div>
            </div>
            <button class="remove-button" type="button" data-action="remove" data-id="${product.id}" aria-label="Удалить ${product.title}">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <div class="cart-item-footer">
            ${createStepper(product.id, item.qty, "cart")}
            <strong class="cart-line-total">${formatPrice(product.price * item.qty)}</strong>
          </div>
        </div>
      </article>`;
  }).join("");

  elements.cartTotal.textContent = formatPrice(getCartState().total);
  elements.cartSummary.classList.remove("hidden");
}

function updateTelegramChrome() {
  const { count, total } = getCartState();
  const mainButton = isTelegram ? telegram?.MainButton : null;
  const label = currentScreen === "catalog"
    ? `Корзина · ${count} ${pluralize(count)} · ${formatPrice(total)}`
    : "Оформить заказ";

  elements.cartCount.textContent = String(count);
  elements.cartCount.dataset.count = String(count);
  elements.cartShortcut.classList.toggle("hidden", currentScreen === "cart");
  elements.browserBackButton.classList.toggle("hidden", isTelegram || currentScreen !== "cart");

  if (mainButton) {
    mainButton.setText(label);
    if (count) mainButton.show().enable();
    else mainButton.hide();
  }

  elements.browserMainButton.textContent = label;
  elements.browserMainButton.classList.toggle("hidden", isTelegram || count === 0);
  if (isTelegram) {
    telegram.BackButton?.[currentScreen === "cart" ? "show" : "hide"]();

    if (cart.length) telegram.enableClosingConfirmation?.();
    else telegram.disableClosingConfirmation?.();
  }
}

function pluralize(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "товара";
  return "товаров";
}

function changeQuantity(id, delta) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.qty += delta;
  else if (delta > 0) cart.push({ id, qty: 1 });

  cart = cart.filter((item) => item.qty > 0);
  persistCart();
  haptic();
  renderCatalog();
  renderCart();
  updateTelegramChrome();
}

function removeItem(id) {
  cart = cart.filter((item) => item.id !== id);
  persistCart();
  haptic("warning");
  renderCatalog();
  renderCart();
  updateTelegramChrome();
}

function openCart() {
  if (!cart.length) return;
  currentScreen = "cart";
  elements.catalogScreen.classList.add("hidden");
  elements.cartScreen.classList.remove("hidden");
  elements.title.textContent = "Корзина";
  elements.subtitle.textContent = "Проверьте состав заказа";
  renderCart();
  updateTelegramChrome();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openCatalog() {
  currentScreen = "catalog";
  elements.cartScreen.classList.add("hidden");
  elements.catalogScreen.classList.remove("hidden");
  elements.title.textContent = "Магазин одежды";
  elements.subtitle.textContent = "Базовые вещи на каждый день";
  updateTelegramChrome();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function checkout() {
  if (!cart.length) return;
  const payload = {
    version: 2,
    items: cart.map(({ id, qty }) => ({ id, qty })),
  };

  haptic("success");
  if (isTelegram && telegram?.sendData) {
    telegram.MainButton?.showProgress();
    telegram.sendData(JSON.stringify(payload));
    return;
  }

  showToast("Заказ готов к отправке в Telegram");
}

function handleAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "increase") changeQuantity(id, 1);
  if (button.dataset.action === "decrease") changeQuantity(id, -1);
  if (button.dataset.action === "remove") removeItem(id);
}

elements.catalog.addEventListener("click", handleAction);
elements.cartItems.addEventListener("click", handleAction);
elements.cartShortcut.addEventListener("click", openCart);
elements.browserBackButton.addEventListener("click", openCatalog);
elements.browserMainButton.addEventListener("click", () => currentScreen === "catalog" ? openCart() : checkout());
if (isTelegram) {
  telegram.MainButton?.onClick(() => currentScreen === "catalog" ? openCart() : checkout());
  telegram.BackButton?.onClick(openCatalog);
  telegram.onEvent?.("themeChanged", () => {
    telegram.setHeaderColor?.("bg_color");
    telegram.setBackgroundColor?.("bg_color");
  });
}

renderCategories();
renderCatalog();
renderCart();
updateTelegramChrome();

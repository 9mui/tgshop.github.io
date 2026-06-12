// Просто добавляй / меняй объекты в этом массиве
const PRODUCTS = [
  {
    id: 1,
    title: "Базовая футболка",
    price: 1490,
    category: "Футболки",
    image: "https://pin.it/2j22uRVc4",
  },
  {
    id: 2,
    title: "Джинсы прямые",
    price: 3990,
    category: "Брюки",
    image: "https://via.placeholder.com/300x380?text=Джинсы",
  },
  {
    id: 3,
    title: "Худи оверсайз",
    price: 4590,
    category: "Худи",
    image: "https://via.placeholder.com/300x380?text=Худи",
  },
];

// Категории формируются автоматически из товаров
const CATEGORIES = ["Все", ...new Set(PRODUCTS.map((p) => p.category))];

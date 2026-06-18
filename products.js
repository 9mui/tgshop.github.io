const PRODUCTS = [
  {
    id: 1,
    title: "Базовая футболка",
    price: 1490,
    category: "Футболки",
    image: "images/tshirt.webp",
  },
  {
    id: 2,
    title: "Джинсы прямые",
    price: 3990,
    category: "Брюки",
    image: "images/jeans.webp",
  },
  {
    id: 3,
    title: "Худи оверсайз",
    price: 4590,
    category: "Худи",
    image: "images/hoodie.webp",
  },
];

const CATEGORIES = ["Все", ...new Set(PRODUCTS.map((product) => product.category))];

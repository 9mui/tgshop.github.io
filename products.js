// Просто добавляй / меняй объекты в этом массиве
const PRODUCTS = [
  {
    id: 1,
    title: "Базовая футболка",
    price: 1490,
    category: "Футболки",
    image: "https://media.istockphoto.com/id/1185028107/ru/%D1%84%D0%BE%D1%82%D0%BE/%D0%BC%D0%BE%D0%BB%D0%BE%D0%B4%D0%B0%D1%8F-%D1%81%D0%BC%D0%B5%D1%8E%D1%89%D0%B0%D1%8F%D1%81%D1%8F-%D0%B6%D0%B5%D0%BD%D1%89%D0%B8%D0%BD%D0%B0-%D1%81%D1%82%D0%BE%D1%8F%D1%89%D0%B0%D1%8F-%D1%81-%D1%80%D1%83%D0%BA%D0%B0%D0%BC%D0%B8-%D0%B2-%D0%BA%D0%B0%D1%80%D0%BC%D0%B0%D0%BD%D0%B0%D1%85-%D0%BE%D0%B4%D0%B5%D1%82%D0%B0%D1%8F-%D0%B2-%D0%BF%D1%83%D1%81%D1%82%D1%83%D1%8E-%D0%B1%D0%B5%D0%BB%D1%83%D1%8E-%D1%84%D1%83%D1%82%D0%B1%D0%BE%D0%BB%D0%BA%D1%83-%D1%81.jpg?s=2048x2048&w=is&k=20&c=OLpbfXaW9CtstuWkQQAnkJBHGl9lTw-o6CTbFG_odNE=",
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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "lanches" | "acompanhamentos" | "bebidas";
  isFeatured: boolean;
  isPopular: boolean;
  isAvailable: boolean;
}

const products: Product[] = [
  // ── Lanches ──────────────────────────────────────────────────
  {
    id: "l1",
    name: "Altas Horas Smash",
    description:
      "Dois smash burgers 120g, queijo americano duplo, molho especial da casa, picles e cebola caramelizada",
    price: 34.9,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    category: "lanches",
    isFeatured: true,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: "l2",
    name: "Classic Burguer",
    description:
      "Blend 180g, queijo cheddar, alface, tomate, cebola e maionese artesanal",
    price: 28.9,
    image:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&h=400&fit=crop",
    category: "lanches",
    isFeatured: false,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: "l3",
    name: "Bacon Inferno",
    description:
      "Blend 180g, bacon crocante, queijo pepper jack, jalapeño em conserva e molho chipotle defumado",
    price: 32.9,
    image:
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&h=400&fit=crop",
    category: "lanches",
    isFeatured: true,
    isPopular: false,
    isAvailable: true,
  },
  {
    id: "l4",
    name: "Frango Crispy",
    description:
      "Filé de frango empanado crocante, queijo suíço, alface americana e molho mel mostarda",
    price: 27.9,
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=400&fit=crop",
    category: "lanches",
    isFeatured: false,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: "l5",
    name: "Veggie Supreme",
    description:
      "Hambúrguer artesanal de grão de bico, queijo coalho grelhado, tomate, rúcula e pesto de manjericão",
    price: 26.9,
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&h=400&fit=crop",
    category: "lanches",
    isFeatured: false,
    isPopular: false,
    isAvailable: true,
  },
  {
    id: "l6",
    name: "Duplo Trufado",
    description:
      "Dois blends 150g, queijo brie derretido, cogumelos salteados, aioli de trufa e rúcula fresca",
    price: 42.9,
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop",
    category: "lanches",
    isFeatured: true,
    isPopular: false,
    isAvailable: true,
  },

  // ── Acompanhamentos ───────────────────────────────────────────
  {
    id: "a1",
    name: "Batata Frita Clássica",
    description:
      "Porção generosa de batatas fritas crocantes com sal grosso e temperos especiais da casa",
    price: 13.9,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop",
    category: "acompanhamentos",
    isFeatured: false,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: "a2",
    name: "Onion Rings",
    description:
      "Anéis de cebola empanados em panko e fritos, servidos com molho barbecue defumado",
    price: 15.9,
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=400&fit=crop",
    category: "acompanhamentos",
    isFeatured: true,
    isPopular: false,
    isAvailable: true,
  },
  {
    id: "a3",
    name: "Batata Rústica",
    description:
      "Batatas em cunha com casca, temperadas com alecrim, alho e azeite — assadas ao forno",
    price: 16.9,
    image:
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&h=400&fit=crop",
    category: "acompanhamentos",
    isFeatured: false,
    isPopular: false,
    isAvailable: true,
  },

  // ── Bebidas ───────────────────────────────────────────────────
  {
    id: "b1",
    name: "Refrigerante Lata",
    description:
      "Coca-Cola, Pepsi, Guaraná Antarctica ou Sprite — 350ml gelado",
    price: 7.9,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=400&fit=crop",
    category: "bebidas",
    isFeatured: false,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: "b2",
    name: "Milk Shake",
    description:
      "Chocolate, morango, baunilha ou Ovomaltine — 400ml cremoso com chantilly e cobertura",
    price: 19.9,
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop",
    category: "bebidas",
    isFeatured: true,
    isPopular: true,
    isAvailable: true,
  },
  {
    id: "b3",
    name: "Suco Natural",
    description:
      "Laranja, maracujá ou limão com hortelã — 400ml sem conservantes",
    price: 12.9,
    image:
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=400&fit=crop",
    category: "bebidas",
    isFeatured: false,
    isPopular: false,
    isAvailable: true,
  },
  {
    id: "b4",
    name: "Água Mineral",
    description: "Água mineral natural ou com gás — 500ml",
    price: 5.9,
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=400&fit=crop",
    category: "bebidas",
    isFeatured: false,
    isPopular: false,
    isAvailable: true,
  },
];

export default products;

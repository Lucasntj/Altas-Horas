interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category?:
    | "Hamburguer"
    | "Acompanhamentos"
    | "Bebidas"
    | "Sobremesas"
    | "Promocoes";
}

const dataProducts: Product[] = [
  {
    id: 1,
    name: "Hamburguer",
    description: "Pao, Carne, queijo, presunto, salada",
    price: 9.0,
    image: "/HamburguerPeso.png",
    category: "Hamburguer",
  },
  {
    id: 2,
    name: "Batata Frita com Calabresa e Cheddar",
    description: "Batata Frita, Calabresa, Cheddar",
    price: 18.0,
    image: "/batata-calabresa.png",
    category: "Acompanhamentos",
  },
  {
    id: 3,
    name: "Coca-Cola",
    description: "Refrigerante",
    price: 5.0,
    image: "/CocaCola.png",
    category: "Bebidas",
  },
];

export default dataProducts;

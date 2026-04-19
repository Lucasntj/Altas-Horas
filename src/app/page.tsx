"use client";
import { useState } from "react";
import CartButton from "@/components/CartButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import dataProducts from "@/data/products";
import MenuItems from "@/components/MenuItems";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const getInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  const storedCart = localStorage.getItem("cart");
  if (!storedCart) return [];

  try {
    const parsedCart = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    localStorage.removeItem("cart");
    return [];
  }
};

// md serve para deixar o texto centralizado independente de configuração //
export default function Home() {
  const products: Product[] = dataProducts;
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);

  const addToCart = (id: number) => {
    const product = products.find((prod: Product) => prod.id === id);
    if (!product) return;

    setCart((currentCart) => {
      const existingProduct = currentCart.find((item) => item.id === id);
      let updateCart: CartItem[];

      if (existingProduct) {
        updateCart = currentCart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        updateCart = [...currentCart, { ...product, quantity: 1 }];
      }

      localStorage.setItem("cart", JSON.stringify(updateCart));
      return updateCart;
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="section-shell pb-6 md:pb-10">
        <div className="surface-panel animate-fade-up p-5 md:p-7 mb-5">
          <p className="text-[11px] uppercase tracking-[0.16em] font-extrabold text-[#9a6648]">
            Cardapio online
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl font-[family-name:var(--font-display)] tracking-wide text-zinc-900">
            Nosso Cardapio
          </h2>
          <p className="mt-2 text-sm md:text-base text-zinc-600 max-w-2xl leading-relaxed">
            Monte seu pedido em poucos cliques com visual claro, navegacao
            rapida e checkout pensado para conversao.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-20">
          {products.map((product) => (
            <MenuItems
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              addToCart={addToCart}
              image={product.image}
            />
          ))}
        </div>

        <CartButton
          itemCount={cart.reduce((total, item) => total + item.quantity, 0)}
        />
      </main>

      <Footer />
    </div>
  );
}

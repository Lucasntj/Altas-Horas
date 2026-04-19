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
    <div className="mt-80">
      <Header />
      <div className="p-4">
        <h1 className="font-bold text-center text-2xl md:text-center text-zinc-700">
          Nosso Cardápio
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 mx-auto max-w-7xl px-2 mb-16">
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
      </div>
      <Footer />
    </div>
  );
}

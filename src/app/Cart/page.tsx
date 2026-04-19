"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartItems from "@/components/CartItems";

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
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

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);

  const updateCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    );
    updateCart(updated);
  };

  const decreaseQuantity = (id: number) => {
    const updated = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
          : item,
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const removeItem = (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    updateCart(updated);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalValue = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return (
    <div className="mt-80 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-zinc-800">Seu Carrinho</h2>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 underline"
          >
            Voltar ao cardapio
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center">
            <p className="text-zinc-700 font-medium">
              Seu carrinho esta vazio.
            </p>
          </div>
        ) : (
          <>
            <CartItems
              items={cart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeItem}
            />

            <div className="mt-6 bg-white rounded-xl border p-4">
              <div className="flex justify-between text-zinc-700 mb-2">
                <span>Itens</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-zinc-900">
                <span>Total</span>
                <span>R$ {totalValue.toFixed(2)}</span>
              </div>
              <button
                onClick={clearCart}
                className="mt-4 w-full rounded-md bg-red-500 hover:bg-red-600 text-white py-2 font-semibold transition-colors"
              >
                Limpar carrinho
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

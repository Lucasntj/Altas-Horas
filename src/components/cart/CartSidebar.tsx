"use client";

import { useCart } from "@/context/CartContext";
import { DELIVERY_FEE } from "@/utils/config";
import {
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function CartSidebar() {
  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Bloqueia scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[420px] flex-col bg-[#111111] border-l border-yellow-500/24 shadow-[−24px_0_80px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <IconShoppingBag size={20} className="text-yellow-500" stroke={2} />
            <h2 className="text-lg font-extrabold text-white">Carrinho</h2>
            {totalItems > 0 && (
              <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-black text-black">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Fechar carrinho"
          >
            <IconX size={20} stroke={2} />
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
              <div className="text-6xl">🛒</div>
              <p className="text-zinc-400 font-semibold">
                Seu carrinho está vazio
              </p>
              <p className="text-sm text-zinc-600">
                Adicione produtos do cardápio para continuar
              </p>
              <button
                onClick={closeCart}
                className="rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-yellow-400 transition-colors"
              >
                Ver cardápio
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-sm font-extrabold text-yellow-400 mt-0.5">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label="Diminuir quantidade"
                    >
                      <IconMinus size={13} stroke={2.5} />
                    </button>
                    <span className="text-sm font-bold text-white w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label="Aumentar quantidade"
                    >
                      <IconPlus size={13} stroke={2.5} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="shrink-0 rounded-lg p-1.5 text-zinc-600 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                  aria-label={`Remover ${item.name}`}
                >
                  <IconTrash size={16} stroke={2} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé com total e CTA */}
        {items.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Entrega (estimada)</span>
              <span className="font-semibold text-white">
                R$ {DELIVERY_FEE.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white border-t border-white/10 pt-3">
              <span>Total</span>
              <span className="text-yellow-400">
                R$ {(totalPrice + DELIVERY_FEE).toFixed(2)}
              </span>
            </div>
            <Link
              href="/Cart"
              onClick={closeCart}
              className="block w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-300 py-3.5 text-center text-base font-extrabold text-black shadow-lg shadow-yellow-500/25 hover:from-yellow-400 hover:to-yellow-200 transition-all"
            >
              Finalizar Pedido →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

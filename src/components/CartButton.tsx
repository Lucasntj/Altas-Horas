"use client";

import { useCart } from "@/context/CartContext";
import { IconShoppingBag } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

const CartButton = () => {
  const { totalItems, totalPrice, openCart, isOpen } = useCart();
  const pathname = usePathname();

  const hiddenRoutes = pathname.startsWith("/dono") || pathname === "/Cart";
  if (hiddenRoutes || totalItems <= 0 || isOpen) return null;

  return (
    <button
      onClick={openCart}
      aria-label="Abrir carrinho"
      className="fixed bottom-4 left-4 right-4 z-[95] flex items-center justify-between gap-3 rounded-2xl border border-yellow-300/70 bg-gradient-to-r from-yellow-500 to-yellow-300 px-4 py-3 text-black shadow-2xl shadow-yellow-500/30 md:hidden"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/10">
          <IconShoppingBag size={19} stroke={2.4} />
        </span>
        <div className="text-left">
          <p className="text-sm font-black leading-none">Ver carrinho</p>
          <p className="mt-1 text-xs font-semibold text-black/80">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </p>
        </div>
      </div>
      <span className="rounded-xl bg-black px-3 py-2 text-sm font-black text-yellow-300">
        R$ {totalPrice.toFixed(2)}
      </span>
    </button>
  );
};

export default CartButton;

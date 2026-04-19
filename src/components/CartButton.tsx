import { IconShoppingCartHeart } from "@tabler/icons-react";
import Link from "next/link";

type ItemCountProps = {
  itemCount: number;
};

const CartButton = ({ itemCount }: ItemCountProps) => {
  return (
    <Link
      href="/Cart"
      aria-label="Abrir carrinho"
      className="fixed bottom-5 right-5 z-40"
    >
      <div className="relative flex items-center gap-2 rounded-2xl border border-white/40 bg-gradient-to-r from-[#ed5d1f] to-[#cc4210] px-4 py-3 text-white shadow-[0_16px_28px_rgba(50,21,8,0.3)] hover:scale-[1.03] active:scale-95">
        <IconShoppingCartHeart size={28} stroke={2.1} />
        <span className="text-sm font-bold tracking-wide">Carrinho</span>

        <div className="absolute -top-2 -right-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-[#fff4ea] bg-[#0f766e] px-1 text-xs font-extrabold text-white">
          {itemCount}
        </div>
      </div>
    </Link>
  );
};

export default CartButton;

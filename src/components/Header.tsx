"use client";

import { useCart } from "@/context/CartContext";
import { IconShoppingBag } from "@tabler/icons-react";
import Image from "next/image";

const Header = () => {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-30 relative mb-2 overflow-hidden border-b border-white/10 bg-black/90 backdrop-blur-md sm:mb-4 lg:mb-6">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/banner6.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#040404]/97 via-[#131313]/92 to-[#040404]/96" />

      <div className="section-shell relative animate-fade-up pt-2 pb-2.5 sm:pt-3 sm:pb-4 md:pt-4 md:pb-5 lg:pt-5 lg:pb-6">
        {/* Barra superior: badge de status + botão carrinho */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm sm:text-xs sm:tracking-[0.14em]">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-soft-pulse" />
            <span className="sm:hidden">Online</span>
            <span className="hidden sm:inline">Pedidos online ativos</span>
          </div>

          <button
            onClick={openCart}
            className="relative flex min-h-11 items-center gap-2 rounded-2xl border border-yellow-300/60 bg-yellow-500/20 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-yellow-500/80 sm:px-4 sm:text-sm"
            aria-label="Abrir carrinho"
          >
            <IconShoppingBag size={18} stroke={2} />
            <span className="inline">Carrinho</span>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-black text-black shadow-lg">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Logo e nome */}
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/70 p-2 backdrop-blur-md sm:mt-3 sm:gap-3 sm:p-2.5 md:mt-3 md:gap-4 md:p-3">
          <div className="rounded-xl border border-white/25 bg-white/10 p-1.5 backdrop-blur-sm shadow-xl">
            <Image
              src="/Logoaltas.png"
              alt="Logo Altas Horas"
              width={110}
              height={110}
              className="h-[40px] w-[40px] rounded-lg object-cover sm:h-[54px] sm:w-[54px] md:h-[62px] md:w-[62px] lg:h-[76px] lg:w-[76px]"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-[18px] leading-none tracking-[0.03em] text-white drop-shadow-md sm:text-[24px] md:text-[30px] lg:text-4xl">
              ALTAS HORAS
            </h1>
            <p className="mt-1 line-clamp-1 text-[12px] font-medium leading-tight text-zinc-200 sm:text-[13px] md:text-[14px] lg:text-[15px]">
              Pedido rapido e sem complicacao.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

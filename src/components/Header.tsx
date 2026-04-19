"use client";

import { useCart } from "@/context/CartContext";
import { IconShoppingBag } from "@tabler/icons-react";
import Image from "next/image";

const Header = () => {
  const { totalItems, openCart } = useCart();

  return (
    <header className="relative mb-2 overflow-hidden sm:mb-6">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/banner6.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#040404]/98 via-[#151515]/94 to-[#040404]/98" />

      <div className="section-shell relative animate-fade-up pt-2.5 pb-3.5 md:pt-7 md:pb-11">
        {/* Barra superior: badge de status + botão carrinho */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm sm:text-xs sm:tracking-[0.14em]">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-soft-pulse" />
            <span className="sm:hidden">Online</span>
            <span className="hidden sm:inline">Pedidos online ativos</span>
          </div>

          <button
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-2xl border border-yellow-300/60 bg-yellow-500/20 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-yellow-500/80 sm:px-4 sm:text-sm"
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
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/65 p-2 backdrop-blur-md sm:mt-5 sm:gap-4 sm:p-3">
          <div className="rounded-2xl border border-white/30 bg-white/15 p-2 backdrop-blur-sm shadow-2xl">
            <Image
              src="/Logoaltas.png"
              alt="Logo Altas Horas"
              width={110}
              height={110}
              className="h-[52px] w-[52px] rounded-xl object-cover sm:h-[84px] sm:w-[84px] md:h-[100px] md:w-[100px]"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-[20px] leading-none tracking-[0.03em] text-white drop-shadow-md sm:text-5xl md:text-6xl">
              ALTAS HORAS
            </h1>
            <p className="mt-1 line-clamp-2 text-[14px] font-semibold leading-tight text-zinc-100 sm:text-sm md:text-base">
              Sabor rápido, atendimento profissional, pedido sem complicação.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

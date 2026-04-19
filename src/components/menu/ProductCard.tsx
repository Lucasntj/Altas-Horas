"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import { IconPlus, IconStar } from "@tabler/icons-react";
import Image from "next/image";

interface Props {
  product: Product;
  canOrder?: boolean;
}

export default function ProductCard({ product, canOrder = true }: Props) {
  const { addToCart, notify } = useCart();

  const handleAdd = () => {
    if (!canOrder) {
      notify(
        "Loja fechada no momento. Pedidos disponíveis no horário de atendimento.",
      );
      return;
    }

    if (!product.isAvailable) {
      notify(`${product.name} está indisponível no momento.`);
      return;
    }

    addToCart(product);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 transition-all duration-200 hover:border-yellow-500/35 hover:shadow-[0_12px_40px_rgba(234,179,8,0.16)]">
      {/* Badges */}
      <div className="absolute left-2.5 top-2.5 z-10 flex gap-1.5">
        {!product.isAvailable && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-zinc-900 shadow">
            Indisponível
          </span>
        )}
        {product.isFeatured && (
          <span className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-black shadow">
            <IconStar size={9} fill="white" stroke={0} />
            Destaque
          </span>
        )}
        {product.isPopular && (
          <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-zinc-900 shadow">
            🔥 Popular
          </span>
        )}
      </div>

      {/* Imagem */}
      <div className="relative h-40 w-full overflow-hidden rounded-[12px] bg-zinc-800 m-2 mb-0 sm:m-0 sm:rounded-none sm:h-48">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover ${
            product.isAvailable ? "" : "grayscale"
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="text-[20px] leading-tight font-extrabold text-white sm:text-[17px]">
          {product.name}
        </h3>
        <p className="mt-1 flex-1 text-[14px] leading-snug text-zinc-200 line-clamp-2 sm:text-sm sm:text-zinc-400">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[18px] leading-none font-extrabold text-yellow-400 sm:text-xl">
            R$ {product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={!product.isAvailable || !canOrder}
            className="flex min-h-9 items-center gap-1.5 rounded-xl bg-yellow-500 px-3 py-2 text-xs font-bold text-black shadow-md shadow-yellow-500/25 transition-all hover:bg-yellow-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900 disabled:shadow-none sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-sm"
            aria-label={
              product.isAvailable
                ? `Adicionar ${product.name} ao carrinho`
                : `${product.name} indisponível`
            }
          >
            <IconPlus size={15} stroke={2.5} />
            {!canOrder
              ? "Loja fechada"
              : product.isAvailable
                ? "Adicionar"
                : "Indisponível"}
          </button>
        </div>
      </div>
    </article>
  );
}

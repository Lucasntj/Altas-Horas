"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";

interface Props {
  product: Product;
  canOrder?: boolean;
}

export default function ProductCard({ product, canOrder = true }: Props) {
  const { addToCart, notify } = useCart();

  const getShortDescription = (description: string) => {
    const cleaned = description.replace(/\s+/g, " ").trim();
    if (cleaned.length <= 78) return cleaned;
    return `${cleaned.slice(0, 75).trimEnd()}...`;
  };

  const badges: string[] = [];
  if (product.isFeatured) badges.push("🔥 Mais pedido");
  if (product.isPopular) badges.push("⭐ Popular");
  if (product.price <= 24.9) badges.push("💰 Custo-benefício");

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
    <article className="relative overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 p-2.5 transition-all duration-200 hover:border-yellow-500/35 hover:shadow-[0_12px_32px_rgba(234,179,8,0.14)] md:p-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {!product.isAvailable && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-zinc-900 shadow">
            Indisponível
          </span>
        )}
        {badges.map((badge, index) => (
          <span
            key={`${product.id}-${badge}`}
            className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow ${
              index === 0
                ? "bg-yellow-500 text-black"
                : "bg-yellow-300 text-zinc-900"
            }`}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="relative flex gap-2.5 md:gap-3">
        <div className="w-[116px] shrink-0 md:w-[150px]">
          <Image
            src={product.image}
            alt={product.name}
            width={220}
            height={130}
            className={`h-[130px] w-full rounded-[12px] object-cover object-center ${
              product.isAvailable ? "" : "grayscale"
            }`}
            sizes="(max-width: 768px) 116px, 150px"
          />
        </div>

        <div className="min-w-0 flex-1 pb-12 md:pb-0">
          <h3 className="text-[17px] font-extrabold leading-tight text-white md:text-[18px]">
            {product.name}
          </h3>
          <p className="mt-1 text-[12px] leading-snug text-zinc-300 line-clamp-2 md:text-[13px]">
            {getShortDescription(product.description)}
          </p>
          <p className="mt-2 text-[18px] font-extrabold leading-none text-yellow-400 md:text-[18px]">
            R$ {product.price.toFixed(2)}
          </p>

          <button
            onClick={handleAdd}
            disabled={!product.isAvailable || !canOrder}
            className="absolute bottom-0 right-0 flex min-h-10 items-center gap-1.5 rounded-[10px] bg-yellow-500 px-[14px] py-[10px] text-xs font-bold text-black shadow-md shadow-yellow-500/30 transition-all hover:bg-yellow-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900 disabled:shadow-none"
            aria-label={
              product.isAvailable
                ? `Adicionar ${product.name} ao carrinho`
                : `${product.name} indisponível`
            }
          >
            <IconPlus size={15} stroke={2.5} />
            {!canOrder
              ? "Fechada"
              : product.isAvailable
                ? "Adicionar"
                : "Indisponível"}
          </button>
        </div>
      </div>
    </article>
  );
}

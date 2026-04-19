"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import AddToCartButton from "@/components/ui/AddToCartButton";
import Image from "next/image";
import { useState } from "react";

interface Props {
  product: Product;
  canOrder?: boolean;
}

export default function ProductCard({ product, canOrder = true }: Props) {
  const { addToCart, notify } = useCart();
  const [justAdded, setJustAdded] = useState(false);

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
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  return (
    <article className="relative w-full max-w-full overflow-hidden rounded-2xl border border-white/12 bg-zinc-900/95 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-all duration-200 hover:border-yellow-500/35 hover:shadow-[0_12px_32px_rgba(234,179,8,0.14)] md:p-3">
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

      <div className="relative grid grid-cols-[116px_minmax(0,1fr)] gap-2.5 md:flex md:flex-col md:gap-3">
        <div className="w-[116px] shrink-0 md:w-full">
          <Image
            src={product.image}
            alt={product.name}
            width={220}
            height={130}
            className={`h-[130px] w-full rounded-[12px] object-cover object-center md:h-[170px] lg:h-[185px] ${
              product.isAvailable ? "" : "grayscale"
            }`}
            sizes="(max-width: 768px) 116px, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-extrabold leading-tight text-white md:text-[18px]">
            {product.name}
          </h3>
          <p className="mt-1 max-w-full text-[12px] leading-snug text-zinc-400 line-clamp-2 md:text-[13px]">
            {getShortDescription(product.description)}
          </p>

          <div className="mt-2.5 flex items-end justify-between gap-2 md:mt-3">
            <p className="text-[18px] font-extrabold leading-none text-yellow-400 md:text-[18px]">
              R$ {product.price.toFixed(2)}
            </p>

            <AddToCartButton
              onClick={handleAdd}
              disabled={!product.isAvailable || !canOrder}
              justAdded={justAdded}
              closedStore={!canOrder}
              unavailable={!product.isAvailable}
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

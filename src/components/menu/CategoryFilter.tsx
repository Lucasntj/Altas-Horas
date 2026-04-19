"use client";

import type { Product } from "@/data/products";

type Category = Product["category"] | "todos" | "destaques";

interface Props {
  active: Category;
  onChange: (cat: Category) => void;
  counts: Record<string, number>;
}

const tabs: { value: Category; label: string; emoji: string }[] = [
  { value: "todos", label: "Todos", emoji: "🍴" },
  { value: "destaques", label: "Destaques", emoji: "⭐" },
  { value: "lanches", label: "Lanches", emoji: "🍔" },
  { value: "acompanhamentos", label: "Acompanhamentos", emoji: "🍟" },
  { value: "bebidas", label: "Bebidas", emoji: "🥤" },
];

export default function CategoryFilter({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none md:flex-wrap md:overflow-visible">
      {tabs.map((tab) => {
        const count = counts[tab.value] ?? 0;
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm ${
              isActive
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:border-yellow-500/35 hover:text-white"
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            {count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0 text-xs font-black ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-white/10 text-zinc-400"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

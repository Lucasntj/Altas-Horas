"use client";

import { IconCheck, IconPlus } from "@tabler/icons-react";

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  justAdded?: boolean;
  closedStore?: boolean;
  unavailable?: boolean;
  className?: string;
}

export default function AddToCartButton({
  onClick,
  disabled = false,
  justAdded = false,
  closedStore = false,
  unavailable = false,
  className = "",
}: AddToCartButtonProps) {
  const label = closedStore
    ? "Loja fechada"
    : unavailable
      ? "Indisponível"
      : justAdded
        ? "Adicionado"
        : "Adicionar";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-[14px] py-[10px] text-sm font-bold transition-all active:scale-95 ${
        justAdded
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
          : "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 hover:bg-yellow-400"
      } disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900 disabled:shadow-none ${className}`}
      aria-label={label}
    >
      {justAdded ? (
        <IconCheck size={16} stroke={2.5} />
      ) : (
        <IconPlus size={16} stroke={2.5} />
      )}
      {label}
    </button>
  );
}

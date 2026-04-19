"use client";

import { useCart } from "@/context/CartContext";
import { IconX } from "@tabler/icons-react";

export default function Toaster() {
  const { toasts, dismissToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none w-full px-4 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="w-full flex items-center justify-between gap-3 rounded-2xl border border-yellow-500/40 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto animate-fade-up"
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-zinc-400 hover:text-white shrink-0"
            aria-label="Fechar notificação"
          >
            <IconX size={15} stroke={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
}

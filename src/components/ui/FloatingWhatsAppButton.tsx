"use client";

import { WHATSAPP_NUMBER } from "@/utils/config";
import { IconBrandWhatsapp } from "@tabler/icons-react";

export default function FloatingWhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a loja no WhatsApp"
      className="fixed bottom-6 right-5 z-[90] inline-flex items-center gap-2 rounded-full bg-yellow-500 px-4 py-3 text-sm font-extrabold text-black shadow-2xl shadow-yellow-500/25 transition-all hover:scale-[1.03] hover:bg-yellow-400"
    >
      <IconBrandWhatsapp size={20} stroke={2.2} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

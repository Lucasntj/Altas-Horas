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
      className="fixed bottom-24 right-4 z-[90] inline-flex items-center gap-2 rounded-full bg-yellow-500 px-3 py-3 text-sm font-extrabold text-black shadow-2xl shadow-yellow-500/25 transition-all hover:scale-[1.03] hover:bg-yellow-400 sm:bottom-6 sm:right-5 sm:px-4"
    >
      <IconBrandWhatsapp size={20} stroke={2.2} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

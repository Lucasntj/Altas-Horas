import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/cart/CartSidebar";
import Toaster from "@/components/ui/Toaster";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";
import "./globals.css";

const displayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Altas Horas | Cardápio e Pedidos",
  description: "Lanchonete Altas Horas: cardápio, carrinho e pedidos online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <CartProvider>
          {children}
          <CartSidebar />
          <Toaster />
          <FloatingWhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}

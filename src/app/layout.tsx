import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Altas horas",
  description: "Seu melhor pedido",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

import { DELIVERY_FEE, STORE_NAME, WHATSAPP_NUMBER } from "./config";
import type { CartItem } from "@/context/CartContext";

export type OrderType = "entrega" | "retirada";
export type PaymentMethod = "Pix" | "Dinheiro" | "Cartao";

export interface CheckoutData {
  name: string;
  phone: string;
  orderType: OrderType;
  address: string;
  neighborhood: string;
  payment: PaymentMethod;
  change: string;
  notes: string;
  items: CartItem[];
  totalPrice: number;
}

const fmt = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const buildWhatsAppUrl = (data: CheckoutData): string => {
  const {
    name,
    phone,
    orderType,
    address,
    neighborhood,
    payment,
    change,
    notes,
    items,
    totalPrice,
  } = data;

  const itemsLines = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} — ${fmt(item.price * item.quantity)}`,
    )
    .join("\n");

  const fee = orderType === "entrega" ? DELIVERY_FEE : 0;
  const grandTotal = totalPrice + fee;

  const lines: string[] = [
    `🛒 *Novo Pedido — ${STORE_NAME}*`,
    ``,
    `👤 *Nome:* ${name}`,
    `📞 *Telefone:* ${phone}`,
    ``,
    `📦 *Tipo:* ${orderType === "entrega" ? "Entrega 🛵" : "Retirada 🏃"}`,
  ];

  if (orderType === "entrega") {
    const loc = [address, neighborhood].filter(Boolean).join(", ");
    if (loc) lines.push(`📍 *Endereço:* ${loc}`);
  }

  lines.push(``, `🧾 *Pedido:*`, itemsLines, ``);

  if (orderType === "entrega") {
    lines.push(`🛵 *Taxa de entrega:* ${fmt(DELIVERY_FEE)}`);
  }

  lines.push(`💰 *Total: ${fmt(grandTotal)}*`, ``);

  const paymentLabel =
    payment === "Pix"
      ? "Pix 📱"
      : payment === "Dinheiro"
        ? "Dinheiro 💵"
        : "Cartão 💳";

  lines.push(`💳 *Pagamento:* ${paymentLabel}`);

  if (payment === "Dinheiro" && change.trim()) {
    lines.push(`💵 *Troco para:* R$ ${change.trim()}`);
  }

  if (notes.trim()) {
    lines.push(``, `📝 *Obs:* ${notes.trim()}`);
  }

  const message = lines.join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

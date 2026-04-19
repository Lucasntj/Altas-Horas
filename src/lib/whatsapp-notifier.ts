import { STORE_NAME } from "@/utils/config";
import type { StoredOrder, OrderStatus } from "@/lib/orders-store";

type WhatsAppProvider = "none" | "zapi";

const WHATSAPP_PROVIDER =
  (process.env.WHATSAPP_PROVIDER?.toLowerCase() as WhatsAppProvider) ?? "none";

const ZAPI_BASE_URL =
  process.env.WHATSAPP_ZAPI_BASE_URL ?? "https://api.z-api.io";
const ZAPI_INSTANCE_ID = process.env.WHATSAPP_ZAPI_INSTANCE_ID;
const ZAPI_INSTANCE_TOKEN = process.env.WHATSAPP_ZAPI_INSTANCE_TOKEN;
const ZAPI_CLIENT_TOKEN = process.env.WHATSAPP_ZAPI_CLIENT_TOKEN;

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusLabel: Record<OrderStatus, string> = {
  received: "Recebido",
  preparing: "Em preparo",
  delivering: "Saiu para entrega",
  completed: "Finalizado",
};

const normalizePhone = (rawPhone: string): string | null => {
  const digits = rawPhone.replace(/\D/g, "");

  if (digits.length === 13 && digits.startsWith("55")) {
    return digits;
  }

  if (digits.length === 11) {
    return `55${digits}`;
  }

  if (digits.length === 10) {
    return `55${digits}`;
  }

  return null;
};

const buildOrderItemsSummary = (order: StoredOrder) =>
  order.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} — ${formatCurrency(item.quantity * item.price)}`,
    )
    .join("\n");

const buildConfirmationMessage = (order: StoredOrder) => {
  const lines = [
    `Olá, ${order.customer.name}!`,
    "",
    `Seu pedido na *${STORE_NAME}* foi confirmado com sucesso.`,
    `Pedido: *#${order.orderId}*`,
    `Status atual: *${statusLabel[order.status]}*`,
    "",
    "Resumo do pedido:",
    buildOrderItemsSummary(order),
    "",
    `Total: *${formatCurrency(order.totalValue)}*`,
    `Pagamento: *${order.customer.paymentMethod}*`,
    `Entrega/retirada: *${order.customer.address}*`,
  ];

  if (order.customer.notes?.trim()) {
    lines.push(`Observações: ${order.customer.notes.trim()}`);
  }

  lines.push(
    "",
    "Vamos te atualizando por aqui conforme o andamento do pedido.",
  );

  return lines.join("\n");
};

const buildStatusUpdateMessage = (order: StoredOrder) => {
  const lines = [
    `Olá, ${order.customer.name}!`,
    "",
    `Atualização do seu pedido *#${order.orderId}* na *${STORE_NAME}*:`,
    `Novo status: *${statusLabel[order.status]}*`,
  ];

  if (order.status === "preparing") {
    lines.push("Seu pedido já entrou em preparo.");
  }

  if (order.status === "delivering") {
    lines.push("Seu pedido saiu para entrega.");
  }

  if (order.status === "completed") {
    lines.push("Seu pedido foi finalizado. Obrigado pela preferência!");
  }

  return lines.join("\n");
};

const sendViaZApi = async (phone: string, message: string) => {
  if (!ZAPI_INSTANCE_ID || !ZAPI_INSTANCE_TOKEN) {
    throw new Error(
      "Credenciais Z-API ausentes (WHATSAPP_ZAPI_INSTANCE_ID / WHATSAPP_ZAPI_INSTANCE_TOKEN).",
    );
  }

  const response = await fetch(
    `${ZAPI_BASE_URL}/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_INSTANCE_TOKEN}/send-text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
      },
      body: JSON.stringify({ phone, message }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar mensagem pelo WhatsApp: ${errorText}`);
  }

  return true;
};

const sendWhatsAppMessage = async (rawPhone: string, message: string) => {
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    console.warn("WhatsApp: telefone inválido para envio:", rawPhone);
    return false;
  }

  if (WHATSAPP_PROVIDER === "zapi") {
    const sent = await sendViaZApi(phone, message);
    if (sent) {
      console.info("WhatsApp: mensagem enviada com sucesso para", phone);
    }
    return sent;
  }

  console.warn(
    "WhatsApp: provedor não configurado. Defina WHATSAPP_PROVIDER=zapi.",
  );

  return false;
};

export const sendOrderConfirmationNotification = async (order: StoredOrder) => {
  try {
    return await sendWhatsAppMessage(
      order.customer.phone,
      buildConfirmationMessage(order),
    );
  } catch (error) {
    console.error("Erro ao enviar confirmação por WhatsApp:", error);
    return false;
  }
};

export const sendOrderStatusNotification = async (order: StoredOrder) => {
  try {
    return await sendWhatsAppMessage(
      order.customer.phone,
      buildStatusUpdateMessage(order),
    );
  } catch (error) {
    console.error("Erro ao enviar atualização por WhatsApp:", error);
    return false;
  }
};

import { STORE_NAME } from "@/utils/config";
import type { StoredOrder, OrderStatus } from "@/lib/orders-store";

type WhatsAppProvider = "none" | "zapi";

export interface WhatsAppNotificationResult {
  sent: boolean;
  reason?: string;
}

const WHATSAPP_PROVIDER =
  (process.env.WHATSAPP_PROVIDER?.toLowerCase() as WhatsAppProvider) ?? "none";

const ZAPI_BASE_URL =
  process.env.WHATSAPP_ZAPI_BASE_URL ?? "https://api.z-api.io";
const ZAPI_INSTANCE_ID =
  process.env.WHATSAPP_ZAPI_INSTANCE_ID ?? process.env.ZAPI_INSTANCE_ID;
const ZAPI_INSTANCE_TOKEN =
  process.env.WHATSAPP_ZAPI_INSTANCE_TOKEN ??
  process.env.WHATSAPP_ZAPI_TOKEN ??
  process.env.ZAPI_INSTANCE_TOKEN;
const ZAPI_CLIENT_TOKEN =
  process.env.WHATSAPP_ZAPI_CLIENT_TOKEN ?? process.env.ZAPI_CLIENT_TOKEN;

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusLabel: Record<OrderStatus, string> = {
  received: "Recebido",
  preparing: "Em preparo",
  delivering: "Saiu para entrega",
  completed: "Finalizado",
};

const normalizePhone = (rawPhone: string): string | null => {
  const digits = rawPhone.replace(/\D/g, "").replace(/^0+/, "");

  if (digits.length === 13 && digits.startsWith("55")) {
    return digits;
  }

  if (digits.length === 12 && digits.startsWith("55")) {
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
    `Seu pedido na *${STORE_NAME}* foi recebido e confirmado com sucesso.`,
    `Número do pedido: *#${order.orderId}*`,
    `Status atual: *${statusLabel[order.status]}*`,
    "",
    "*Resumo do pedido:*",
    buildOrderItemsSummary(order),
    "",
    `Total: *${formatCurrency(order.totalValue)}*`,
    `Pagamento: *${order.customer.paymentMethod}*`,
    `Endereço de entrega/retirada: *${order.customer.address}*`,
  ];

  if (order.customer.notes?.trim()) {
    lines.push(`Observações: ${order.customer.notes.trim()}`);
  }

  lines.push(
    "",
    "Obrigado pela preferência.",
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
    lines.push("Seu pedido já entrou em preparo na cozinha.");
  }

  if (order.status === "delivering") {
    lines.push("Seu pedido saiu para entrega. Fique atento ao telefone.");
  }

  if (order.status === "completed") {
    lines.push("Seu pedido foi finalizado. Obrigado pela preferência!");
  }

  if (order.status === "received") {
    lines.push("Seu pedido entrou na fila e será iniciado em breve.");
  }

  lines.push("Se precisar de ajuda, responda esta mensagem.");

  return lines.join("\n");
};

const sendViaZApi = async (phone: string, message: string) => {
  if (!ZAPI_INSTANCE_ID || !ZAPI_INSTANCE_TOKEN) {
    return {
      sent: false,
      reason:
        "Credenciais Z-API ausentes (WHATSAPP_ZAPI_INSTANCE_ID e WHATSAPP_ZAPI_INSTANCE_TOKEN).",
    } as WhatsAppNotificationResult;
  }

  const endpoint = `${ZAPI_BASE_URL.replace(/\/$/, "")}/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_INSTANCE_TOKEN}/send-text`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
    },
    body: JSON.stringify({ phone, message }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    return {
      sent: false,
      reason: `Falha na Z-API (${response.status}): ${responseText}`,
    };
  }

  try {
    const parsed = JSON.parse(responseText) as {
      error?: unknown;
      message?: unknown;
      sent?: unknown;
      status?: unknown;
    };

    const hasExplicitError =
      Boolean(parsed.error) ||
      parsed.sent === false ||
      String(parsed.status ?? "").toLowerCase() === "error";

    if (hasExplicitError) {
      return {
        sent: false,
        reason: `Z-API respondeu erro: ${String(parsed.message ?? parsed.error ?? "sem detalhes")}`,
      };
    }
  } catch {
    // Alguns planos/versoes retornam texto simples em sucesso.
  }

  return { sent: true };
};

const sendWhatsAppMessage = async (rawPhone: string, message: string) => {
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return {
      sent: false,
      reason: `Telefone inválido para WhatsApp: ${rawPhone}`,
    } as WhatsAppNotificationResult;
  }

  if (WHATSAPP_PROVIDER === "zapi") {
    const result = await sendViaZApi(phone, message);
    if (result.sent) {
      console.info("WhatsApp: mensagem enviada com sucesso para", phone);
    } else {
      console.warn("WhatsApp: envio não concluído:", result.reason);
    }
    return result;
  }

  return {
    sent: false,
    reason: "Provedor não configurado. Defina WHATSAPP_PROVIDER=zapi.",
  };
};

export const sendOrderConfirmationNotification = async (order: StoredOrder) => {
  try {
    return await sendWhatsAppMessage(
      order.customer.phone,
      buildConfirmationMessage(order),
    );
  } catch (error) {
    console.error("Erro ao enviar confirmação por WhatsApp:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Erro inesperado.",
    };
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
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Erro inesperado.",
    };
  }
};

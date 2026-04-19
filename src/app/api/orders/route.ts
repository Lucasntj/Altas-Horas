import { NextResponse } from "next/server";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  notes?: string;
}

interface OrderPayload {
  customer: OrderCustomer;
  items: OrderItem[];
}

const normalizePhone = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.startsWith("55")) return digitsOnly;
  return `55${digitsOnly}`;
};

const formatCurrency = (value: number): string => `R$ ${value.toFixed(2)}`;

const buildOwnerMessage = (
  orderId: string,
  customer: OrderCustomer,
  items: OrderItem[],
  totalValue: number,
): string => {
  const itemsText = items
    .map(
      (item) =>
        `- ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})`,
    )
    .join("\n");

  return [
    `*Novo Pedido* #${orderId}`,
    "",
    `Cliente: ${customer.name}`,
    `WhatsApp: ${customer.phone}`,
    `Endereco: ${customer.address}`,
    `Pagamento: ${customer.paymentMethod}`,
    customer.notes ? `Observacoes: ${customer.notes}` : "Observacoes: -",
    "",
    "Itens:",
    itemsText,
    "",
    `Total: ${formatCurrency(totalValue)}`,
  ].join("\n");
};

const buildCustomerMessage = (
  orderId: string,
  customer: OrderCustomer,
  totalValue: number,
): string => {
  return [
    `Oi, ${customer.name}!`,
    `Seu pedido *#${orderId}* foi recebido com sucesso pela lanchonete Altas Horas.`,
    `Total: ${formatCurrency(totalValue)}.`,
    "",
    "Para acompanhar o pedido, responda esta mensagem no WhatsApp.",
    "Obrigado pela preferencia!",
  ].join("\n");
};

const sendWhatsAppText = async (to: string, body: string) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION ?? "v21.0";

  if (!token || !phoneNumberId) {
    throw new Error("WHATSAPP_CONFIG_MISSING");
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          body,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WHATSAPP_SEND_FAILED: ${errorBody}`);
  }
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderPayload;
    const customer = body?.customer;
    const items = body?.items ?? [];

    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Dados do pedido invalidos." },
        { status: 400 },
      );
    }

    const ownerPhoneRaw = process.env.WHATSAPP_OWNER_NUMBER;
    if (!ownerPhoneRaw) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp da lanchonete nao configurado. Defina WHATSAPP_OWNER_NUMBER no ambiente.",
        },
        { status: 500 },
      );
    }

    const orderId = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const totalValue = items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0,
    );

    const customerPhone = normalizePhone(customer.phone);
    const ownerPhone = normalizePhone(ownerPhoneRaw);

    const ownerMessage = buildOwnerMessage(orderId, customer, items, totalValue);
    const customerMessage = buildCustomerMessage(orderId, customer, totalValue);

    const ownerWhatsAppUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(ownerMessage)}`;
    const customerWhatsAppUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(customerMessage)}`;

    try {
      await sendWhatsAppText(ownerPhone, ownerMessage);
      await sendWhatsAppText(customerPhone, customerMessage);

      return NextResponse.json({
        success: true,
        orderId,
        message:
          "Pedido enviado para a lanchonete e confirmacao enviada para o WhatsApp do cliente.",
      });
    } catch (error) {
      const isMissingConfig =
        error instanceof Error && error.message.includes("WHATSAPP_CONFIG_MISSING");

      if (isMissingConfig) {
        return NextResponse.json({
          success: true,
          orderId,
          message:
            "Pedido gerado. Configure a API do WhatsApp para envio automatico ou use os links abaixo.",
          ownerWhatsAppUrl,
          customerWhatsAppUrl,
        });
      }

      return NextResponse.json({
        success: true,
        orderId,
        message:
          "Pedido gerado. Nao foi possivel enviar automaticamente. Use os links de WhatsApp abaixo.",
        ownerWhatsAppUrl,
        customerWhatsAppUrl,
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro interno ao processar pedido." },
      { status: 500 },
    );
  }
}

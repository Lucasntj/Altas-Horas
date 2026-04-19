import { NextResponse } from "next/server";
import {
  addOrder,
  listOrders,
  type OrderCustomer,
  type OrderItem,
} from "@/lib/orders-store";

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

const sendWhatsAppTemplate = async (to: string) => {
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
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WHATSAPP_TEMPLATE_FAILED: ${errorBody}`);
  }
};

const mapWhatsAppErrorToHint = (error: unknown): string => {
  const details = error instanceof Error ? error.message : "";

  if (details.includes("131030") || details.includes("recipient")) {
    return "Confirme se o numero do cliente foi adicionado como destinatario de teste na Meta.";
  }

  if (details.includes("190") || details.includes("token")) {
    return "Token expirado ou invalido. Gere um novo token na Meta e atualize WHATSAPP_ACCESS_TOKEN no Vercel.";
  }

  if (details.includes("131047") || details.includes("template")) {
    return "A Meta exige template para iniciar conversa. Valide o template e o numero de destino na configuracao da API.";
  }

  return "Revise no painel da Meta se o numero de teste e o token estao ativos.";
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

    const orderId = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const totalValue = items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0,
    );

    const customerPhone = normalizePhone(customer.phone);
    const customerMessage = buildCustomerMessage(orderId, customer, totalValue);
    const customerWhatsAppUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(customerMessage)}`;

    addOrder({
      orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      totalValue,
      status: "novo",
    });

    try {
      await sendWhatsAppText(customerPhone, customerMessage);

      return NextResponse.json({
        success: true,
        orderId,
        message:
          "Pedido recebido e confirmacao enviada para o WhatsApp do cliente.",
      });
    } catch (error) {
      const isMissingConfig =
        error instanceof Error &&
        error.message.includes("WHATSAPP_CONFIG_MISSING");

      if (isMissingConfig) {
        return NextResponse.json({
          success: true,
          orderId,
          message:
            "Pedido recebido. Configure a API do WhatsApp para confirmar automaticamente ao cliente.",
          customerWhatsAppUrl,
        });
      }

      try {
        await sendWhatsAppTemplate(customerPhone);

        return NextResponse.json({
          success: true,
          orderId,
          message:
            "Pedido recebido. A confirmacao foi enviada com template padrao da Meta no WhatsApp do cliente.",
        });
      } catch (templateError) {
        return NextResponse.json({
          success: true,
          orderId,
          message: `Pedido recebido. Nao foi possivel enviar automaticamente. ${mapWhatsAppErrorToHint(templateError)}`,
          customerWhatsAppUrl,
        });
      }
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro interno ao processar pedido." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    orders: listOrders(),
  });
}

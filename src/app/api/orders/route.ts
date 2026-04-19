import { NextResponse } from "next/server";
import {
  addOrder,
  listOrders,
  updateOrderStatus,
  type OrderStatus,
  type OrderCustomer,
  type OrderItem,
} from "@/lib/orders-store";

interface OrderPayload {
  customer: OrderCustomer;
  items: OrderItem[];
}

interface UpdateOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}

const validStatus: OrderStatus[] = [
  "novo",
  "em_preparo",
  "saiu_para_entrega",
  "finalizado",
  "cancelado",
];

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

    await addOrder({
      orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      totalValue,
      status: "novo",
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: "Pedido recebido com sucesso.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro interno ao processar pedido." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const searchFilter = searchParams.get("search")?.trim().toLowerCase() ?? "";

  const allOrders = await listOrders();

  const filteredOrders = allOrders.filter((order) => {
    const statusMatches =
      !statusFilter ||
      statusFilter === "todos" ||
      order.status === statusFilter;

    if (!statusMatches) return false;

    if (!searchFilter) return true;

    const searchBase = [
      order.orderId,
      order.customer.name,
      order.customer.phone,
      order.customer.address,
      order.customer.paymentMethod,
      ...order.items.map((item) => item.name),
    ]
      .join(" ")
      .toLowerCase();

    return searchBase.includes(searchFilter);
  });

  return NextResponse.json({
    success: true,
    orders: filteredOrders,
  });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateOrderStatusPayload;

    if (!body?.orderId || !body?.status || !validStatus.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: "Dados invalidos para atualizar status." },
        { status: 400 },
      );
    }

    const updatedOrder = await updateOrderStatus(body.orderId, body.status);
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Pedido nao encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Status do pedido atualizado com sucesso.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar pedido." },
      { status: 500 },
    );
  }
}

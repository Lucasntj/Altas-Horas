import { NextResponse } from "next/server";
import {
  addOrder,
  listOrders,
  updateOrderStatus,
  type OrderStatus,
  type OrderCustomer,
  type OrderItem,
} from "@/lib/orders-store";
import { listProducts } from "@/lib/products-store";
import {
  sendOrderConfirmationNotification,
  sendOrderStatusNotification,
} from "@/lib/whatsapp-notifier";
import {
  isStoreOpenAt,
  STORE_OPEN_HOUR,
  STORE_CLOSE_HOUR,
} from "@/utils/store-hours";

interface OrderPayload {
  customer: OrderCustomer;
  items: OrderItem[];
}

interface UpdateOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}

const validStatus: OrderStatus[] = [
  "received",
  "preparing",
  "delivering",
  "completed",
];

const statusPriority: Record<OrderStatus, number> = {
  received: 0,
  preparing: 1,
  delivering: 2,
  completed: 3,
};

export async function POST(request: Request) {
  try {
    if (!isStoreOpenAt(new Date())) {
      return NextResponse.json(
        {
          success: false,
          message: `Loja fechada no momento. Horário: ${String(STORE_OPEN_HOUR).padStart(2, "0")}:00 às ${String(STORE_CLOSE_HOUR).padStart(2, "0")}:00.`,
        },
        { status: 409 },
      );
    }

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

    const products = await listProducts();
    const productsMap = new Map(products.map((item) => [item.id, item]));

    const unavailableItem = items.find((item) => {
      const product = productsMap.get(String(item.id));
      return !product || !product.isAvailable;
    });

    if (unavailableItem) {
      return NextResponse.json(
        {
          success: false,
          message: `O item ${unavailableItem.name} está indisponível no momento.`,
        },
        { status: 409 },
      );
    }

    const orderId = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const totalValue = items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0,
    );

    const order = {
      orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      totalValue,
      status: "received",
    } as const;

    await addOrder(order);
    const whatsappSent = await sendOrderConfirmationNotification(order);

    return NextResponse.json({
      success: true,
      orderId,
      message: "Pedido recebido com sucesso.",
      whatsappSent,
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

  filteredOrders.sort((a, b) => {
    const byStatus = statusPriority[a.status] - statusPriority[b.status];
    if (byStatus !== 0) return byStatus;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

    const whatsappSent = await sendOrderStatusNotification(updatedOrder);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Status do pedido atualizado com sucesso.",
      whatsappSent,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar pedido." },
      { status: 500 },
    );
  }
}

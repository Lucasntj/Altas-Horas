import { promises as fs } from "node:fs";
import path from "node:path";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  notes?: string;
}

export type OrderStatus =
  | "novo"
  | "em_preparo"
  | "saiu_para_entrega"
  | "finalizado"
  | "cancelado";

export interface StoredOrder {
  orderId: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
}

const MAX_ORDERS = 200;
const dataFilePath =
  process.env.ORDERS_DATA_FILE ??
  path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "orders.json");

let ordersStoreCache: StoredOrder[] | null = null;
let writeQueue = Promise.resolve();

const ensureLoaded = async (): Promise<StoredOrder[]> => {
  if (ordersStoreCache) {
    return ordersStoreCache;
  }

  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(fileContent);
    ordersStoreCache = Array.isArray(parsed) ? parsed : [];
  } catch {
    ordersStoreCache = [];
  }

  return ordersStoreCache;
};

const persist = async (orders: StoredOrder[]) => {
  writeQueue = writeQueue
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.writeFile(
          dataFilePath,
          JSON.stringify(orders, null, 2),
          "utf-8",
        );
      } catch {
        // Se não houver permissão de escrita no ambiente, mantém em memória.
      }
    })
    .catch(() => undefined);

  await writeQueue;
};

export const addOrder = async (order: StoredOrder) => {
  const orders = await ensureLoaded();

  orders.unshift(order);

  if (orders.length > MAX_ORDERS) {
    orders.splice(MAX_ORDERS);
  }

  await persist(orders);
};

export const listOrders = async (): Promise<StoredOrder[]> => {
  const orders = await ensureLoaded();
  return [...orders];
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<StoredOrder | null> => {
  const orders = await ensureLoaded();
  const order = orders.find((item) => item.orderId === orderId);
  if (!order) return null;

  order.status = status;

  await persist(orders);
  return order;
};

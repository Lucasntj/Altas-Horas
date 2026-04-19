import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

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
const databaseUrl = process.env.DATABASE_URL;

let ordersStoreCache: StoredOrder[] | null = null;
let writeQueue = Promise.resolve();
let dbInitialized = false;

const globalPool = globalThis as unknown as { __ordersPool?: Pool };
const pool = databaseUrl
  ? (globalPool.__ordersPool ?? new Pool({ connectionString: databaseUrl }))
  : null;

if (pool && !globalPool.__ordersPool) {
  globalPool.__ordersPool = pool;
}

const mapRowToOrder = (row: {
  order_id: string;
  created_at: string | Date;
  customer: OrderCustomer;
  items: OrderItem[];
  total_value: number | string;
  status: OrderStatus;
}): StoredOrder => {
  return {
    orderId: row.order_id,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    customer: row.customer,
    items: row.items,
    totalValue: Number(row.total_value),
    status: row.status,
  };
};

const ensureDb = async () => {
  if (!pool || dbInitialized) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL,
      customer JSONB NOT NULL,
      items JSONB NOT NULL,
      total_value NUMERIC(12, 2) NOT NULL,
      status TEXT NOT NULL
    )
  `);

  dbInitialized = true;
};

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
  if (pool) {
    await ensureDb();
    await pool.query(
      `
        INSERT INTO orders (order_id, created_at, customer, items, total_value, status)
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6)
        ON CONFLICT (order_id) DO NOTHING
      `,
      [
        order.orderId,
        order.createdAt,
        JSON.stringify(order.customer),
        JSON.stringify(order.items),
        order.totalValue,
        order.status,
      ],
    );
    return;
  }

  const orders = await ensureLoaded();

  orders.unshift(order);

  if (orders.length > MAX_ORDERS) {
    orders.splice(MAX_ORDERS);
  }

  await persist(orders);
};

export const listOrders = async (): Promise<StoredOrder[]> => {
  if (pool) {
    await ensureDb();
    const result = await pool.query<{
      order_id: string;
      created_at: string | Date;
      customer: OrderCustomer;
      items: OrderItem[];
      total_value: number | string;
      status: OrderStatus;
    }>(
      `
        SELECT order_id, created_at, customer, items, total_value, status
        FROM orders
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [MAX_ORDERS],
    );

    return result.rows.map(mapRowToOrder);
  }

  const orders = await ensureLoaded();
  return [...orders];
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<StoredOrder | null> => {
  if (pool) {
    await ensureDb();
    const result = await pool.query<{
      order_id: string;
      created_at: string | Date;
      customer: OrderCustomer;
      items: OrderItem[];
      total_value: number | string;
      status: OrderStatus;
    }>(
      `
        UPDATE orders
        SET status = $2
        WHERE order_id = $1
        RETURNING order_id, created_at, customer, items, total_value, status
      `,
      [orderId, status],
    );

    if (result.rows.length === 0) return null;
    return mapRowToOrder(result.rows[0]);
  }

  const orders = await ensureLoaded();
  const order = orders.find((item) => item.orderId === orderId);
  if (!order) return null;

  order.status = status;

  await persist(orders);
  return order;
};

import { kvGet, kvSet } from "./kv-store";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

export interface OrderItem {
  id: string;
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

export type OrderStatus = "received" | "preparing" | "delivering" | "completed";

export interface StoredOrder {
  orderId: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
}

const KV_ORDERS_KEY = "altas-horas:orders";
const dataFilePath =
  process.env.ORDERS_DATA_FILE ??
  path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "orders.json");
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

const normalizeStatus = (status: string): OrderStatus => {
  const normalized = String(status).toLowerCase().trim();
  if (normalized === "novo" || normalized === "received") return "received";
  if (normalized === "em_preparo" || normalized === "preparing")
    return "preparing";
  if (normalized === "saiu_para_entrega" || normalized === "delivering")
    return "delivering";
  if (normalized === "finalizado" || normalized === "completed")
    return "completed";
  return "received";
};

const mapRowToOrder = (row: {
  order_id: string;
  created_at: string | Date;
  customer: OrderCustomer;
  items: OrderItem[];
  total_value: number | string;
  status: string;
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
    status: normalizeStatus(row.status),
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

const persistToNonDbStores = async (orders: StoredOrder[]) => {
  try {
    await kvSet(KV_ORDERS_KEY, orders);
  } catch (error) {
    console.warn("Erro ao salvar em KV:", error);
  }

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
        // Sem permissao de escrita, continua.
      }
    })
    .catch(() => undefined);

  await writeQueue;
};

const ensureLoaded = async (): Promise<StoredOrder[]> => {
  if (ordersStoreCache) {
    return ordersStoreCache;
  }

  // 1. Tenta Vercel KV
  try {
    const kvOrders = await kvGet<StoredOrder[]>(KV_ORDERS_KEY);
    if (kvOrders && Array.isArray(kvOrders)) {
      ordersStoreCache = kvOrders.map((item) => ({
        ...item,
        status: normalizeStatus(String(item?.status ?? "")),
      }));
      return ordersStoreCache;
    }
  } catch (error) {
    console.warn("Erro ao carregar de KV:", error);
  }

  // 2. Tenta Postgres
  if (pool) {
    try {
      await ensureDb();
      const result = await pool.query<{
        order_id: string;
        created_at: string | Date;
        customer: OrderCustomer;
        items: OrderItem[];
        total_value: number | string;
        status: string;
      }>(
        `
          SELECT order_id, created_at, customer, items, total_value, status
          FROM orders
          ORDER BY created_at DESC
        `,
      );

      ordersStoreCache = result.rows.map(mapRowToOrder);
      return ordersStoreCache;
    } catch (error) {
      console.warn("Erro ao carregar de Postgres:", error);
    }
  }

  // 3. Tenta arquivo local
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(fileContent);
    ordersStoreCache = Array.isArray(parsed)
      ? parsed.map((item) => ({
          ...item,
          status: normalizeStatus(String(item?.status ?? "")),
        }))
      : [];
    return ordersStoreCache;
  } catch {
    ordersStoreCache = [];
  }

  return ordersStoreCache;
};

const insertOrderToDb = async (order: StoredOrder) => {
  if (!pool) return;

  try {
    await ensureDb();
    await pool.query(
      `
        INSERT INTO orders (order_id, created_at, customer, items, total_value, status)
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6)
        ON CONFLICT (order_id) DO UPDATE SET
          created_at = EXCLUDED.created_at,
          customer = EXCLUDED.customer,
          items = EXCLUDED.items,
          total_value = EXCLUDED.total_value,
          status = EXCLUDED.status
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
  } catch (error) {
    console.warn("Erro ao inserir pedido em Postgres:", error);
  }
};

const updateOrderStatusInDb = async (orderId: string, status: OrderStatus) => {
  if (!pool) return;

  try {
    await ensureDb();
    await pool.query(
      `
        UPDATE orders
        SET status = $2
        WHERE order_id = $1
      `,
      [orderId, status],
    );
  } catch (error) {
    console.warn("Erro ao atualizar status em Postgres:", error);
  }
};

export const addOrder = async (order: StoredOrder) => {
  const orders = await ensureLoaded();
  orders.unshift(order);

  await persistToNonDbStores(orders);
  await insertOrderToDb(order);
};

export const listOrders = async (): Promise<StoredOrder[]> => {
  return ensureLoaded();
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<StoredOrder | null> => {
  const orders = await ensureLoaded();
  const order = orders.find((o) => o.orderId === orderId);

  if (!order) return null;

  order.status = normalizeStatus(status);

  await persistToNonDbStores(orders);
  await updateOrderStatusInDb(orderId, order.status);

  return order;
};

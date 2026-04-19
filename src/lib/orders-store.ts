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
const ordersStore: StoredOrder[] = [];

export const addOrder = (order: StoredOrder) => {
  ordersStore.unshift(order);

  if (ordersStore.length > MAX_ORDERS) {
    ordersStore.splice(MAX_ORDERS);
  }
};

export const listOrders = (): StoredOrder[] => {
  return ordersStore;
};

export const updateOrderStatus = (
  orderId: string,
  status: OrderStatus,
): StoredOrder | null => {
  const order = ordersStore.find((item) => item.orderId === orderId);
  if (!order) return null;

  order.status = status;
  return order;
};

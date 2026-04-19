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

export interface StoredOrder {
  orderId: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalValue: number;
  status: "novo";
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

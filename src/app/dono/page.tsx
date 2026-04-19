"use client";

import { useEffect, useMemo, useState } from "react";

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

type OrderStatus =
  | "novo"
  | "em_preparo"
  | "saiu_para_entrega"
  | "finalizado"
  | "cancelado";

interface StoredOrder {
  orderId: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
}

interface OrdersResponse {
  success: boolean;
  orders: StoredOrder[];
}

export default function OwnerDashboardPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const response = await fetch("/api/orders?status=todos", {
        cache: "no-store",
      });
      const data = (await response.json()) as OrdersResponse;
      if (!mounted) return;
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    };

    void load();
    const intervalId = setInterval(() => void load(), 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const finishedOrders = orders.filter((o) => o.status === "finalizado");
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalValue, 0);
    const todayRevenue = orders
      .filter((o) => new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + o.totalValue, 0);

    const uniqueCustomers = new Set(orders.map((o) => o.customer.phone)).size;

    return {
      totalOrders: orders.length,
      openOrders: orders.filter(
        (o) =>
          o.status === "novo" ||
          o.status === "em_preparo" ||
          o.status === "saiu_para_entrega",
      ).length,
      finishedOrders: finishedOrders.length,
      totalRevenue,
      todayRevenue,
      ticketAverage: orders.length ? totalRevenue / orders.length : 0,
      uniqueCustomers,
    };
  }, [orders]);

  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Dashboard</h1>
        <p>Visao geral da operacao da lanchonete em tempo real.</p>
      </header>

      <div className="owner-metrics-grid">
        <article className="owner-metric-card owner-metric-cyan">
          <p>Total de pedidos</p>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article className="owner-metric-card owner-metric-blue">
          <p>Pedidos em andamento</p>
          <strong>{stats.openOrders}</strong>
        </article>
        <article className="owner-metric-card owner-metric-purple">
          <p>Pedidos finalizados</p>
          <strong>{stats.finishedOrders}</strong>
        </article>
        <article className="owner-metric-card owner-metric-green">
          <p>Clientes cadastrados</p>
          <strong>{stats.uniqueCustomers}</strong>
        </article>
        <article className="owner-metric-card owner-metric-amber">
          <p>Faturamento hoje</p>
          <strong>R$ {stats.todayRevenue.toFixed(2)}</strong>
        </article>
        <article className="owner-metric-card owner-metric-indigo">
          <p>Faturamento total</p>
          <strong>R$ {stats.totalRevenue.toFixed(2)}</strong>
        </article>
        <article className="owner-metric-card owner-metric-pink">
          <p>Ticket medio</p>
          <strong>R$ {stats.ticketAverage.toFixed(2)}</strong>
        </article>
      </div>
    </section>
  );
}

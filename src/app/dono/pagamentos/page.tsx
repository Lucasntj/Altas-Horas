"use client";

import { useEffect, useMemo, useState } from "react";

interface OrderCustomer {
  paymentMethod: string;
}

interface StoredOrder {
  orderId: string;
  customer: OrderCustomer;
  totalValue: number;
  status:
    | "novo"
    | "em_preparo"
    | "saiu_para_entrega"
    | "finalizado"
    | "cancelado";
  createdAt: string;
}

interface OrdersResponse {
  success: boolean;
  orders: StoredOrder[];
}

export default function OwnerPaymentsPage() {
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

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    const finished = orders.filter((order) => order.status === "finalizado");

    const byMethod = new Map<string, number>();
    for (const order of finished) {
      const method = order.customer.paymentMethod || "Nao informado";
      byMethod.set(method, (byMethod.get(method) ?? 0) + order.totalValue);
    }

    const receivedToday = finished
      .filter((order) => new Date(order.createdAt).toDateString() === today)
      .reduce((sum, order) => sum + order.totalValue, 0);

    const receivedTotal = finished.reduce(
      (sum, order) => sum + order.totalValue,
      0,
    );
    const toReceive = orders
      .filter(
        (order) =>
          order.status !== "finalizado" && order.status !== "cancelado",
      )
      .reduce((sum, order) => sum + order.totalValue, 0);

    return {
      receivedToday,
      receivedTotal,
      toReceive,
      byMethod: Array.from(byMethod.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [orders]);

  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Financeiro</h1>
        <p>Acompanhe entradas confirmadas e valores pendentes.</p>
      </header>

      <div className="owner-metrics-grid">
        <article className="owner-metric-card owner-metric-green">
          <p>Recebido hoje</p>
          <strong>R$ {summary.receivedToday.toFixed(2)}</strong>
        </article>
        <article className="owner-metric-card owner-metric-cyan">
          <p>Recebido total</p>
          <strong>R$ {summary.receivedTotal.toFixed(2)}</strong>
        </article>
        <article className="owner-metric-card owner-metric-amber">
          <p>A receber</p>
          <strong>R$ {summary.toReceive.toFixed(2)}</strong>
        </article>
      </div>

      <section className="owner-panel">
        <h2 className="owner-panel-title">Recebimentos por metodo</h2>
        <div className="owner-card-grid">
          {summary.byMethod.map(([method, value]) => (
            <article key={method} className="owner-data-card">
              <h3>{method}</h3>
              <p>R$ {value.toFixed(2)}</p>
            </article>
          ))}

          {summary.byMethod.length === 0 && (
            <div className="owner-empty">Nenhum recebimento registrado.</div>
          )}
        </div>
      </section>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

interface StoredOrder {
  orderId: string;
  customer: OrderCustomer;
  totalValue: number;
}

interface OrdersResponse {
  success: boolean;
  orders: StoredOrder[];
}

interface CustomerSummary {
  phone: string;
  name: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
}

export default function OwnerClientsPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    for (const order of orders) {
      const key = order.customer.phone;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          phone: order.customer.phone,
          name: order.customer.name,
          address: order.customer.address,
          totalOrders: 1,
          totalSpent: order.totalValue,
        });
      } else {
        existing.totalOrders += 1;
        existing.totalSpent += order.totalValue;
      }
    }

    return Array.from(map.values())
      .filter((customer) => {
        const searchBase =
          `${customer.name} ${customer.phone} ${customer.address}`.toLowerCase();
        return searchBase.includes(searchTerm.toLowerCase().trim());
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, searchTerm]);

  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Clientes</h1>
        <p>Gerencie informacoes e historico dos clientes.</p>
      </header>

      <section className="owner-panel">
        <div className="owner-toolbar">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome, telefone ou endereco"
            className="owner-input"
          />
        </div>

        <div className="owner-card-grid">
          {customers.map((customer) => (
            <article key={customer.phone} className="owner-data-card">
              <h3>{customer.name}</h3>
              <p>Telefone: {customer.phone}</p>
              <p>Endereco: {customer.address}</p>
              <p>Pedidos: {customer.totalOrders}</p>
              <p>Total gasto: R$ {customer.totalSpent.toFixed(2)}</p>
            </article>
          ))}

          {customers.length === 0 && (
            <div className="owner-empty">Nenhum cliente encontrado.</div>
          )}
        </div>
      </section>
    </section>
  );
}

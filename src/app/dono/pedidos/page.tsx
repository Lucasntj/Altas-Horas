"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

interface StoredOrder {
  orderId: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalValue: number;
  status: "novo";
}

interface OrdersResponse {
  success: boolean;
  orders: StoredOrder[];
}

const formatDate = (value: string) => {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async (): Promise<StoredOrder[]> => {
    const response = await fetch("/api/orders", { cache: "no-store" });
    const data = (await response.json()) as OrdersResponse;
    return Array.isArray(data.orders) ? data.orders : [];
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const nextOrders = await fetchOrders();
      setOrders(nextOrders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    void fetchOrders().then((nextOrders) => {
      if (!isMounted) return;
      setOrders(nextOrders);
      setIsLoading(false);
    });

    const intervalId = setInterval(() => {
      void fetchOrders().then((nextOrders) => {
        if (!isMounted) return;
        setOrders(nextOrders);
      });
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const totalToday = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter((order) => new Date(order.createdAt).toDateString() === today)
      .reduce((acc, order) => acc + order.totalValue, 0);
  }, [orders]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="section-shell flex-1 pb-10">
        <div className="surface-panel p-5 md:p-6 mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] font-extrabold text-[#9a6648]">
              Area do dono
            </p>
            <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] tracking-wide text-zinc-900">
              Pedidos recebidos
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadOrders()}
              className="rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a5f59]"
            >
              Atualizar
            </button>
            <Link
              href="/"
              className="rounded-xl border border-[#d3b99e] px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-[#fff0df]"
            >
              Voltar ao site
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="surface-panel p-4">
            <p className="text-sm text-zinc-500">Pedidos na tela</p>
            <p className="text-2xl font-extrabold text-zinc-900">
              {orders.length}
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-sm text-zinc-500">Faturamento de hoje</p>
            <p className="text-2xl font-extrabold text-zinc-900">
              R$ {totalToday.toFixed(2)}
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-sm text-zinc-500">Atualizacao</p>
            <p className="text-sm font-semibold text-zinc-800">
              Autoatualiza a cada 10 segundos
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="surface-panel p-6 text-center font-semibold text-zinc-700">
            Carregando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="surface-panel p-6 text-center font-semibold text-zinc-700">
            Nenhum pedido recebido ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.orderId} className="surface-panel p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold text-zinc-900">
                    Pedido #{order.orderId}
                  </h2>
                  <span className="text-sm font-semibold text-zinc-600">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-zinc-700">
                  <span className="font-bold">Cliente:</span>{" "}
                  {order.customer.name}
                </p>
                <p className="text-sm text-zinc-700">
                  <span className="font-bold">WhatsApp:</span>{" "}
                  {order.customer.phone}
                </p>
                <p className="text-sm text-zinc-700">
                  <span className="font-bold">Endereco:</span>{" "}
                  {order.customer.address}
                </p>
                <p className="text-sm text-zinc-700">
                  <span className="font-bold">Pagamento:</span>{" "}
                  {order.customer.paymentMethod}
                </p>
                <p className="text-sm text-zinc-700">
                  <span className="font-bold">Observacoes:</span>{" "}
                  {order.customer.notes || "-"}
                </p>

                <div className="mt-3 rounded-xl border border-[#ecd8c0] bg-[#fffdf9] p-3">
                  <p className="text-sm font-bold text-zinc-800 mb-2">Itens</p>
                  <ul className="space-y-1 text-sm text-zinc-700">
                    {order.items.map((item) => (
                      <li key={`${order.orderId}-${item.id}`}>
                        {item.quantity}x {item.name} - R${" "}
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-base font-extrabold text-zinc-900">
                    Total: R$ {order.totalValue.toFixed(2)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

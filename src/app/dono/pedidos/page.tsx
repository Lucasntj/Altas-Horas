"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  status: OrderStatus;
}

type OrderStatus =
  | "novo"
  | "em_preparo"
  | "saiu_para_entrega"
  | "finalizado"
  | "cancelado";

interface OrdersResponse {
  success: boolean;
  orders: StoredOrder[];
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "em_preparo", label: "Em preparo" },
  { value: "saiu_para_entrega", label: "Saiu para entrega" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
];

const formatDate = (value: string) => {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | OrderStatus>(
    "todos",
  );

  const fetchOrders = useCallback(async (): Promise<StoredOrder[]> => {
    const params = new URLSearchParams();
    if (statusFilter !== "todos") {
      params.set("status", statusFilter);
    }
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    const response = await fetch(`/api/orders?${params.toString()}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as OrdersResponse;
    return Array.isArray(data.orders) ? data.orders : [];
  }, [searchTerm, statusFilter]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextOrders = await fetchOrders();
      setOrders(nextOrders);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdatingOrder(orderId);
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      await loadOrders();
    } finally {
      setIsUpdatingOrder(null);
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
  }, [fetchOrders]);

  const totalToday = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter((order) => new Date(order.createdAt).toDateString() === today)
      .reduce((acc, order) => acc + order.totalValue, 0);
  }, [orders]);

  const totalOpenOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "novo" ||
        order.status === "em_preparo" ||
        order.status === "saiu_para_entrega",
    ).length;
  }, [orders]);

  const averageTicket = useMemo(() => {
    if (orders.length === 0) return 0;
    const total = orders.reduce((acc, order) => acc + order.totalValue, 0);
    return total / orders.length;
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
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por cliente, pedido ou item"
              className="field-base w-[280px] max-w-full py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "todos" | OrderStatus)
              }
              className="field-base py-2 text-sm"
            >
              <option value="todos">Todos os status</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <div className="surface-panel p-4">
            <p className="text-sm text-zinc-500">Pedidos na tela</p>
            <p className="text-2xl font-extrabold text-zinc-900">
              {orders.length}
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-sm text-zinc-500">Pedidos em andamento</p>
            <p className="text-2xl font-extrabold text-zinc-900">
              {totalOpenOrders}
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-sm text-zinc-500">Faturamento de hoje</p>
            <p className="text-2xl font-extrabold text-zinc-900">
              R$ {totalToday.toFixed(2)}
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-sm text-zinc-500">Ticket medio</p>
            <p className="text-2xl font-extrabold text-zinc-900">
              R$ {averageTicket.toFixed(2)}
            </p>
            <p className="text-xs font-semibold text-zinc-700 mt-1">
              Atualiza a cada 10s
            </p>
          </div>
        </div>

        <div className="surface-panel p-3 mb-5">
          <p className="text-sm font-semibold text-zinc-800">
            Filtro ativo: {statusFilter === "todos" ? "todos" : statusFilter}
          </p>
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

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-700">
                    Status:
                  </span>
                  <select
                    value={order.status}
                    disabled={isUpdatingOrder === order.orderId}
                    onChange={(event) =>
                      void updateOrderStatus(
                        order.orderId,
                        event.target.value as OrderStatus,
                      )
                    }
                    className="field-base max-w-[220px] py-1.5"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
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

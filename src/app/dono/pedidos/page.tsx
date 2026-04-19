"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "em_preparo", label: "Em preparo" },
  { value: "saiu_para_entrega", label: "Saiu para entrega" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
];

const statusLabelMap: Record<OrderStatus, string> = {
  novo: "Novo",
  em_preparo: "Em preparo",
  saiu_para_entrega: "Saiu para entrega",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const statusBadgeMap: Record<OrderStatus, string> = {
  novo: "owner-metric-blue",
  em_preparo: "owner-metric-amber",
  saiu_para_entrega: "owner-metric-indigo",
  finalizado: "owner-metric-green",
  cancelado: "owner-metric-pink",
};

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
  const [selectedStatusByOrder, setSelectedStatusByOrder] = useState<
    Record<string, OrderStatus>
  >({});
  const [lastUpdatedOrderId, setLastUpdatedOrderId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | OrderStatus>(
    "todos",
  );

  const fetchOrders = useCallback(async (): Promise<StoredOrder[]> => {
    const params = new URLSearchParams();
    if (statusFilter !== "todos") params.set("status", statusFilter);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());

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

  useEffect(() => {
    let mounted = true;

    void fetchOrders().then((nextOrders) => {
      if (!mounted) return;
      setOrders(nextOrders);
      setIsLoading(false);
    });

    const intervalId = setInterval(() => {
      void fetchOrders().then((nextOrders) => {
        if (!mounted) return;
        setOrders(nextOrders);
      });
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdatingOrder(orderId);
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      await loadOrders();
      setLastUpdatedOrderId(orderId);
      setTimeout(() => {
        setLastUpdatedOrderId((current) =>
          current === orderId ? null : current,
        );
      }, 2200);
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  const stats = useMemo(() => {
    const openOrders = orders.filter(
      (order) =>
        order.status === "novo" ||
        order.status === "em_preparo" ||
        order.status === "saiu_para_entrega",
    ).length;

    const today = new Date().toDateString();
    const todayRevenue = orders
      .filter((order) => new Date(order.createdAt).toDateString() === today)
      .reduce((sum, order) => sum + order.totalValue, 0);

    return {
      total: orders.length,
      openOrders,
      todayRevenue,
      ticketAverage: orders.length
        ? orders.reduce((sum, order) => sum + order.totalValue, 0) / orders.length
        : 0,
    };
  }, [orders]);

  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Pedidos</h1>
        <p>Acompanhe status, pagamentos e detalhes de cada pedido.</p>
      </header>

      <div className="owner-panel">
        <div className="owner-toolbar">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por cliente, pedido ou item"
            className="owner-input"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "todos" | OrderStatus)
            }
            className="owner-input max-w-[220px]"
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
            className="owner-input max-w-[170px] font-bold"
          >
            Aplicar filtro
          </button>
        </div>

        <div className="owner-metrics-grid">
          <article className="owner-metric-card owner-metric-cyan">
            <p>Pedidos na tela</p>
            <strong>{stats.total}</strong>
          </article>
          <article className="owner-metric-card owner-metric-blue">
            <p>Em andamento</p>
            <strong>{stats.openOrders}</strong>
          </article>
          <article className="owner-metric-card owner-metric-green">
            <p>Faturamento hoje</p>
            <strong>R$ {stats.todayRevenue.toFixed(2)}</strong>
          </article>
          <article className="owner-metric-card owner-metric-indigo">
            <p>Ticket medio</p>
            <strong>R$ {stats.ticketAverage.toFixed(2)}</strong>
          </article>
        </div>
      </div>

      {isLoading ? (
        <div className="owner-empty">Carregando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="owner-empty">Nenhum pedido encontrado para os filtros aplicados.</div>
      ) : (
        <div className="owner-card-grid">
          {orders.map((order) => (
            <article key={order.orderId} className="owner-data-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3>Pedido #{order.orderId}</h3>
                <span className="text-sm text-slate-300">{formatDate(order.createdAt)}</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className={`owner-metric-card ${statusBadgeMap[order.status]} !p-2 !text-sm`}>
                  <strong className="!text-base">{statusLabelMap[order.status]}</strong>
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>Cliente: {order.customer.name}</p>
                <p>Telefone: {order.customer.phone}</p>
                <p>Endereco: {order.customer.address}</p>
                <p>Pagamento: {order.customer.paymentMethod}</p>
              </div>

              <div className="mt-3 p-3 rounded-xl border border-sky-300/25 bg-slate-950/40">
                <p className="font-bold mb-2">Status do pedido especifico</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedStatusByOrder[order.orderId] ?? order.status}
                    disabled={isUpdatingOrder === order.orderId}
                    onChange={(event) =>
                      setSelectedStatusByOrder((current) => ({
                        ...current,
                        [order.orderId]: event.target.value as OrderStatus,
                      }))
                    }
                    className="owner-input max-w-[220px]"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      void updateOrderStatus(
                        order.orderId,
                        selectedStatusByOrder[order.orderId] ?? order.status,
                      )
                    }
                    disabled={isUpdatingOrder === order.orderId}
                    className="owner-input max-w-[180px] font-bold"
                  >
                    {isUpdatingOrder === order.orderId ? "Salvando..." : "Salvar status"}
                  </button>
                </div>
                {lastUpdatedOrderId === order.orderId && (
                  <p className="mt-2 text-xs text-emerald-300 font-semibold">
                    Status atualizado com sucesso.
                  </p>
                )}
              </div>

              <div className="mt-3 p-3 rounded-xl border border-sky-300/25 bg-slate-950/40">
                <p className="font-bold mb-2">Itens</p>
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={`${order.orderId}-${item.id}`}>
                      {item.quantity}x {item.name} - R$ {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-extrabold">Total: R$ {order.totalValue.toFixed(2)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

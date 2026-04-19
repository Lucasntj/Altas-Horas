"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

type OrderStatus = "received" | "preparing" | "delivering" | "completed";

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

const statusColumns: Array<{ status: OrderStatus; title: string }> = [
  { status: "received", title: "Recebido" },
  { status: "preparing", title: "Em preparo" },
  { status: "delivering", title: "Saiu para entrega" },
  { status: "completed", title: "Finalizado" },
];

const statusChipClass: Record<OrderStatus, string> = {
  received: "owner-metric-a",
  preparing: "owner-metric-e",
  delivering: "owner-metric-f",
  completed: "owner-metric-d",
};

const statusLabel: Record<OrderStatus, string> = {
  received: "Recebido",
  preparing: "Em preparo",
  delivering: "Saiu para entrega",
  completed: "Finalizado",
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  received: "preparing",
  preparing: "delivering",
  delivering: "completed",
  completed: null,
};

const nextActionLabel: Record<OrderStatus, string> = {
  received: "Mover para preparo",
  preparing: "Mover para entrega",
  delivering: "Finalizar pedido",
  completed: "Finalizado",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  const legacyContext = (
    window as Window & { webkitAudioContext?: typeof AudioContext }
  ).webkitAudioContext;
  const AudioContextClass = window.AudioContext || legacyContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(720, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    980,
    ctx.currentTime + 0.16,
  );

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.17, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.22);
};

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const baselineLoaded = useRef(false);
  const knownOrderIds = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());

    const response = await fetch(`/api/orders?${params.toString()}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as OrdersResponse;

    return Array.isArray(payload.orders) ? payload.orders : [];
  }, [search]);

  const loadOrders = useCallback(async () => {
    const nextOrders = await fetchOrders();

    const incomingIds = new Set(nextOrders.map((order) => order.orderId));
    if (!baselineLoaded.current) {
      knownOrderIds.current = incomingIds;
      baselineLoaded.current = true;
    } else {
      const newCount = nextOrders.filter(
        (order) =>
          order.status === "received" &&
          !knownOrderIds.current.has(order.orderId),
      ).length;

      if (newCount > 0) {
        setNewOrdersCount((current) => current + newCount);
        playNotificationSound();
      }

      knownOrderIds.current = incomingIds;
    }

    setOrders(nextOrders);
  }, [fetchOrders]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      setIsLoading(true);
      try {
        await loadOrders();
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const intervalId = setInterval(() => {
      void loadOrders();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [loadOrders]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdatingOrder(orderId);

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      setOrders((current) =>
        current.map((order) =>
          order.orderId === orderId ? { ...order, status } : order,
        ),
      );
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  const grouped = useMemo(() => {
    return statusColumns.map((column) => ({
      ...column,
      orders: orders.filter((order) => order.status === column.status),
    }));
  }, [orders]);

  const summary = useMemo(() => {
    const open = orders.filter((order) => order.status !== "completed").length;
    const total = orders.length;
    const revenue = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.totalValue, 0);

    return { total, open, revenue };
  }, [orders]);

  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Pedidos</h1>
        <p>
          Operação em tempo real com atualização automática a cada 5 segundos.
        </p>
      </header>

      {newOrdersCount > 0 && (
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-3 flex flex-wrap items-center justify-between gap-2 animate-fade-up">
          <p className="text-sm font-bold text-yellow-300">
            {newOrdersCount} novo(s) pedido(s) recebido(s).
          </p>
          <button
            onClick={() => setNewOrdersCount(0)}
            className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-yellow-400"
          >
            Marcar como visto
          </button>
        </div>
      )}

      <div className="owner-panel">
        <div className="owner-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, telefone ou item"
            className="owner-input"
          />
          <button
            onClick={() => void loadOrders()}
            className="owner-input max-w-[170px] font-bold"
          >
            Atualizar agora
          </button>
        </div>

        <div className="owner-metrics-grid">
          <article className="owner-metric-card owner-metric-a">
            <p>Pedidos na tela</p>
            <strong>{summary.total}</strong>
          </article>
          <article className="owner-metric-card owner-metric-b">
            <p>Em andamento</p>
            <strong>{summary.open}</strong>
          </article>
          <article className="owner-metric-card owner-metric-d">
            <p>Faturado</p>
            <strong>R$ {summary.revenue.toFixed(2)}</strong>
          </article>
        </div>
      </div>

      {isLoading ? (
        <div className="owner-empty">Carregando pedidos...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
          {grouped.map((column) => (
            <section
              key={column.status}
              className="owner-panel min-h-[220px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="owner-panel-title !mb-0">{column.title}</h2>
                <span className="text-xs rounded-full bg-yellow-500 text-black font-extrabold px-2 py-0.5">
                  {column.orders.length}
                </span>
              </div>

              {column.orders.length === 0 ? (
                <div className="owner-empty !p-4">Sem pedidos</div>
              ) : (
                <div className="space-y-3">
                  {column.orders.map((order) => {
                    const next = nextStatus[order.status];

                    return (
                      <article key={order.orderId} className="owner-data-card">
                        <div className="flex items-center justify-between gap-2">
                          <h3>#{order.orderId}</h3>
                          <span className="text-xs text-zinc-300">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`owner-metric-card ${statusChipClass[order.status]} !p-2 !text-sm`}
                          >
                            <strong className="!text-sm">
                              {statusLabel[order.status]}
                            </strong>
                          </span>
                        </div>

                        <div className="mt-2 text-sm space-y-1">
                          <p>Cliente: {order.customer.name}</p>
                          <p>Pagamento: {order.customer.paymentMethod}</p>
                          <p>Telefone: {order.customer.phone}</p>
                        </div>

                        <div className="mt-3 rounded-xl border border-yellow-500/25 bg-zinc-950/35 p-3">
                          <p className="font-bold text-sm mb-2">Itens</p>
                          <ul className="space-y-1 text-sm text-zinc-200">
                            {order.items.map((item) => (
                              <li key={`${order.orderId}-${item.id}`}>
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 font-extrabold text-yellow-400">
                            Total: R$ {order.totalValue.toFixed(2)}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {statusColumns.map((statusOption) => (
                            <button
                              key={statusOption.status}
                              onClick={() =>
                                void updateOrderStatus(
                                  order.orderId,
                                  statusOption.status,
                                )
                              }
                              disabled={
                                isUpdatingOrder === order.orderId ||
                                statusOption.status === order.status
                              }
                              className="rounded-lg border border-yellow-500/30 px-2.5 py-1.5 text-xs font-bold text-zinc-100 hover:bg-yellow-500/15 disabled:opacity-45 disabled:cursor-not-allowed"
                            >
                              {statusOption.title}
                            </button>
                          ))}
                        </div>

                        {next && (
                          <button
                            onClick={() =>
                              void updateOrderStatus(order.orderId, next)
                            }
                            disabled={isUpdatingOrder === order.orderId}
                            className="mt-3 w-full rounded-xl bg-yellow-500 px-3 py-2 text-xs font-extrabold text-black hover:bg-yellow-400 disabled:opacity-50"
                          >
                            {isUpdatingOrder === order.orderId
                              ? "Atualizando..."
                              : nextActionLabel[order.status]}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

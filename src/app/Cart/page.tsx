"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconBrandWhatsapp,
  IconCheck,
  IconLoader2,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import {
  CUSTOMER_PROFILE_STORAGE_KEY,
  DELIVERY_FEE,
  WHATSAPP_NUMBER,
} from "@/utils/config";
import { formatPhone } from "@/utils/whatsapp";
import type { OrderType, PaymentMethod } from "@/utils/whatsapp";
import {
  formatStoreHours,
  isStoreOpenAt,
  type StoreSettings,
} from "@/utils/store-hours";

interface FormState {
  name: string;
  phone: string;
  orderType: OrderType;
  address: string;
  neighborhood: string;
  payment: PaymentMethod;
  change: string;
  notes: string;
}

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  whatsappSent?: boolean;
  whatsappReason?: string;
}

interface LastOrderSnapshot {
  orderId?: string;
  name: string;
  phone: string;
  addressText: string;
  payment: PaymentMethod;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  whatsappSent?: boolean;
  whatsappReason?: string;
}

interface StoreSettingsResponse {
  success: boolean;
  settings: StoreSettings;
}

const initialForm: FormState = {
  name: "",
  phone: "",
  orderType: "entrega",
  address: "",
  neighborhood: "",
  payment: "Pix",
  change: "",
  notes: "",
};

const getInitialFormState = (): FormState => {
  if (typeof window === "undefined") return initialForm;

  try {
    const raw = localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY);
    if (!raw) return initialForm;

    const profile = JSON.parse(raw) as Partial<FormState>;
    return {
      ...initialForm,
      name: profile.name ?? initialForm.name,
      phone: profile.phone ?? initialForm.phone,
      address: profile.address ?? initialForm.address,
      neighborhood: profile.neighborhood ?? initialForm.neighborhood,
    };
  } catch {
    return initialForm;
  }
};

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [form, setForm] = useState<FormState>(getInitialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<LastOrderSnapshot | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
    null,
  );

  useEffect(() => {
    const profile = {
      name: form.name,
      phone: form.phone,
      address: form.address,
      neighborhood: form.neighborhood,
    };
    localStorage.setItem(CUSTOMER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [form.name, form.phone, form.address, form.neighborhood]);

  useEffect(() => {
    let mounted = true;

    const loadStoreSettings = async () => {
      try {
        const response = await fetch("/api/store-settings", {
          cache: "no-store",
        });
        const payload = (await response.json()) as StoreSettingsResponse;
        if (!mounted || !payload.success) return;
        setStoreSettings(payload.settings);
        setIsStoreOpen(isStoreOpenAt(new Date(), payload.settings));
      } catch {
        if (!mounted) return;
      }
    };

    void loadStoreSettings();
    const intervalId = setInterval(() => void loadStoreSettings(), 60000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const setField =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const rawValue = event.target.value;
      const value = field === "phone" ? formatPhone(rawValue) : rawValue;
      setForm((current) => ({ ...current, [field]: value }));
    };

  const deliveryFee = form.orderType === "entrega" ? DELIVERY_FEE : 0;
  const grandTotal = totalPrice + deliveryFee;

  const baseFormValid =
    form.name.trim().length >= 3 &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    (form.orderType === "retirada" ||
      (form.address.trim().length >= 5 &&
        form.neighborhood.trim().length >= 2));

  const canSubmit = items.length > 0 && baseFormValid && isStoreOpen;
  const storeHoursLabel = storeSettings ? formatStoreHours(storeSettings) : "";

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const addressText =
      form.orderType === "entrega"
        ? `${form.address}, ${form.neighborhood}`
        : "Retirada no local";

    const orderSnapshot: LastOrderSnapshot = {
      name: form.name,
      phone: form.phone,
      addressText,
      payment: form.payment,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      subtotal: totalPrice,
      deliveryFee,
      total: grandTotal,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            address: addressText,
            paymentMethod: form.payment,
            notes: form.notes,
          },
          items,
        }),
      });

      const result = (await response.json()) as CreateOrderResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Falha ao gerar pedido.");
      }

      orderSnapshot.orderId = result.orderId;
      orderSnapshot.whatsappSent = result.whatsappSent;
      orderSnapshot.whatsappReason = result.whatsappReason;
      setLastOrder(orderSnapshot);
      clearCart();
      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar o pedido agora.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && lastOrder) {
    const ownerWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `📱 *Novo Pedido #${lastOrder.orderId}*\n` +
        `👤 Cliente: ${lastOrder.name}\n` +
        `📞 Tel: ${lastOrder.phone}\n` +
        `📍 ${lastOrder.addressText}\n` +
        `💳 Pagamento: ${lastOrder.payment}`,
    )}`;

    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="section-shell flex-1 py-10">
          <div className="mx-auto max-w-2xl rounded-3xl border border-yellow-500/35 bg-zinc-900 p-6 md:p-7 animate-fade-up">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/45 bg-yellow-500/15">
                <IconCheck size={38} className="text-yellow-400" stroke={2.5} />
              </div>

              <h2 className="mt-4 text-3xl font-extrabold text-white">
                Pedido confirmado! ✅
              </h2>
              <p className="mt-2 text-zinc-300">
                Gerente será notificado em tempo real. Fique atento ao status da
                entrega.
              </p>

              {lastOrder.whatsappSent === false && (
                <p className="mt-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200">
                  Pedido salvo com sucesso, mas a confirmação automática no
                  WhatsApp do cliente falhou. Motivo:{" "}
                  {lastOrder.whatsappReason || "não informado"}.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/45 p-4">
              <p className="text-sm text-zinc-300">
                Pedido #{lastOrder.orderId ?? "-"}
              </p>
              <p className="text-sm text-zinc-300">Cliente: {lastOrder.name}</p>
              <p className="text-sm text-zinc-300">
                Telefone: {lastOrder.phone}
              </p>
              <p className="text-sm text-zinc-300">
                Endereço: {lastOrder.addressText}
              </p>
              <p className="text-sm text-zinc-300">
                Pagamento: {lastOrder.payment}
              </p>

              <div className="mt-4 border-t border-white/10 pt-3">
                <p className="text-sm font-bold text-white">Resumo do pedido</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                  {lastOrder.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.name} - R${" "}
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>R$ {lastOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de entrega</span>
                    <span>R$ {lastOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-base font-extrabold text-white">
                    <span>Total final</span>
                    <span className="text-yellow-400">
                      R$ {lastOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={ownerWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-2.5 text-sm font-extrabold text-yellow-400 hover:bg-yellow-500/20 transition-all"
              >
                <IconBrandWhatsapp size={16} stroke={2} />
                Notificar Gerente
              </a>
              <button
                onClick={() => router.push("/")}
                className="rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-extrabold text-black hover:bg-yellow-400"
              >
                Fazer novo pedido
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="section-shell flex-1 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-500">
              Checkout
            </p>
            <h2 className="text-2xl font-extrabold text-white">
              Finalizar Pedido
            </h2>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <IconArrowLeft size={16} stroke={2} />
            Voltar
          </Link>
        </div>

        {!isStoreOpen && (
          <div className="mb-5 rounded-2xl border border-yellow-500/45 bg-yellow-500/10 p-4 text-center">
            <p className="text-sm font-extrabold text-yellow-300">
              Estamos fechados no momento. Configuracao atual:{" "}
              {storeHoursLabel || "nosso horario de funcionamento"}.
            </p>
          </div>
        )}

        {submitError && (
          <div className="mb-5 rounded-2xl border border-yellow-500/45 bg-zinc-900 p-4 text-center">
            <p className="text-sm font-semibold text-zinc-200">{submitError}</p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-12 text-center space-y-4">
            <p className="text-4xl">🛒</p>
            <p className="text-zinc-400 font-semibold">
              Seu carrinho está vazio
            </p>
            <Link
              href="/"
              className="inline-block rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-yellow-400"
            >
              Ver cardápio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/8 bg-zinc-900 overflow-hidden">
                <div className="border-b border-white/8 px-5 py-3">
                  <h3 className="font-extrabold text-white">
                    Itens do pedido ({totalItems})
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-sm font-extrabold text-yellow-400">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                          aria-label="Diminuir"
                        >
                          <IconMinus size={13} stroke={2.5} />
                        </button>
                        <span className="text-sm font-bold text-white w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                          aria-label="Aumentar"
                        >
                          <IconPlus size={13} stroke={2.5} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-yellow-300 hover:bg-yellow-500/10"
                          aria-label={`Remover ${item.name}`}
                        >
                          <IconTrash size={13} stroke={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-zinc-900 p-5 space-y-4">
                <h3 className="font-extrabold text-white border-b border-white/8 pb-3">
                  Seus dados
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={setField("name")}
                      placeholder="Nome completo"
                      className="field-base"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={setField("phone")}
                      placeholder="(00) 00000-0000"
                      className="field-base"
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">
                    Tipo de pedido *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["entrega", "retirada"] as OrderType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, orderType: type }))
                        }
                        className={`rounded-xl border py-3 text-sm font-bold transition-all ${
                          form.orderType === type
                            ? "border-yellow-500 bg-yellow-500/15 text-yellow-300"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        {type === "entrega" ? "🛵 Entrega" : "🏃 Retirada"}
                      </button>
                    ))}
                  </div>
                </div>

                {form.orderType === "entrega" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                        Endereço *
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={setField("address")}
                        placeholder="Rua, número"
                        className="field-base"
                        autoComplete="street-address"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        value={form.neighborhood}
                        onChange={setField("neighborhood")}
                        placeholder="Bairro"
                        className="field-base"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">
                    Pagamento *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Pix", "Dinheiro", "Cartao"] as PaymentMethod[]).map(
                      (method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, payment: method }))
                          }
                          className={`rounded-xl border py-2.5 text-sm font-bold transition-all ${
                            form.payment === method
                              ? "border-yellow-500 bg-yellow-500/15 text-yellow-300"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          {method === "Pix"
                            ? "📱 Pix"
                            : method === "Dinheiro"
                              ? "💵 Dinheiro"
                              : "💳 Cartão"}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {form.payment === "Dinheiro" && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                      Troco para quanto?
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.change}
                      onChange={setField("change")}
                      placeholder="Ex: 50.00"
                      className="field-base"
                      inputMode="decimal"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                    Observações <span className="font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={setField("notes")}
                    placeholder="Sem cebola, ponto da carne, etc."
                    rows={3}
                    className="field-base resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-zinc-900 p-5 space-y-3 lg:sticky lg:top-6">
                <h3 className="font-extrabold text-white border-b border-white/8 pb-3">
                  Resumo
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "itens"})
                    </span>
                    <span className="font-semibold text-white">
                      R$ {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de entrega</span>
                    <span className="font-semibold text-white">
                      {form.orderType === "retirada"
                        ? "Grátis 🎉"
                        : `R$ ${DELIVERY_FEE.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-white/8 pt-3 text-base font-extrabold text-white">
                  <span>Total final</span>
                  <span className="text-yellow-400">
                    R$ {grandTotal.toFixed(2)}
                  </span>
                </div>

                {!baseFormValid && items.length > 0 && (
                  <p className="text-xs text-zinc-500 text-center">
                    Preencha todos os campos obrigatórios para finalizar
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 py-4 text-base font-extrabold text-black shadow-lg shadow-yellow-500/25 transition-all hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2
                        size={18}
                        className="animate-spin"
                        stroke={2}
                      />
                      Confirmando pedido...
                    </>
                  ) : (
                    <>
                      <IconCheck size={20} stroke={2} />
                      Confirmar Pedido
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-zinc-600">
                  Seu pedido será enviado para o gerente em tempo real
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

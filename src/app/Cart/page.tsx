"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartItems from "@/components/CartItems";

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  notes: string;
}

interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  message?: string;
}

const getInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  const storedCart = localStorage.getItem("cart");
  if (!storedCart) return [];

  try {
    const parsedCart = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    localStorage.removeItem("cart");
    return [];
  }
};

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);
  const [form, setForm] = useState<CheckoutForm>({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    paymentMethod: "Pix",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(
    null,
  );

  const updateCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    );
    updateCart(updated);
  };

  const decreaseQuantity = (id: number) => {
    const updated = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
          : item,
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const removeItem = (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    updateCart(updated);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalValue = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const canSubmitOrder =
    cart.length > 0 &&
    form.customerName.trim().length >= 3 &&
    form.customerPhone.trim().length >= 10 &&
    form.deliveryAddress.trim().length >= 8;

  const handleInputChange =
    (field: keyof CheckoutForm) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const placeOrder = async () => {
    if (!canSubmitOrder || isSubmitting) return;

    setIsSubmitting(true);
    setCheckoutResult(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: form.customerName,
            phone: form.customerPhone,
            address: form.deliveryAddress,
            paymentMethod: form.paymentMethod,
            notes: form.notes,
          },
          items: cart,
        }),
      });

      const result = (await response.json()) as CheckoutResponse;
      setCheckoutResult(result);

      if (result.success) {
        setCart([]);
        localStorage.removeItem("cart");
      }
    } catch {
      setCheckoutResult({
        success: false,
        message: "Nao foi possivel enviar o pedido agora. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="section-shell flex-1 pb-8 md:pb-10">
        <div className="surface-panel animate-fade-up mb-5 p-5 md:p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] font-extrabold text-[#9a6648]">
              Checkout
            </p>
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] tracking-wide text-zinc-900">
              Seu Carrinho
            </h2>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-[#0f766e] hover:text-[#0a5f59]"
          >
            Voltar ao cardapio
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="surface-panel p-8 text-center">
            <p className="text-zinc-700 font-semibold">
              Seu carrinho esta vazio.
            </p>
          </div>
        ) : (
          <>
            <CartItems
              items={cart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeItem}
            />

            <div className="mt-5 surface-panel p-4 md:p-5">
              <div className="flex justify-between text-zinc-700 mb-2">
                <span>Itens</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-2xl font-extrabold text-zinc-900">
                <span>Total</span>
                <span>R$ {totalValue.toFixed(2)}</span>
              </div>
              <button
                onClick={clearCart}
                className="mt-4 w-full rounded-xl bg-[#c63f10] hover:bg-[#9f2f08] text-white py-2.5 font-bold"
              >
                Limpar carrinho
              </button>
            </div>

            <div className="mt-5 surface-panel p-4 md:p-5">
              <h3 className="text-lg font-extrabold text-zinc-900 mb-3">
                Dados para fechar pedido
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={form.customerName}
                  onChange={handleInputChange("customerName")}
                  className="field-base"
                />
                <input
                  type="tel"
                  placeholder="Telefone para contato (com DDD)"
                  value={form.customerPhone}
                  onChange={handleInputChange("customerPhone")}
                  className="field-base"
                />
                <input
                  type="text"
                  placeholder="Endereco de entrega"
                  value={form.deliveryAddress}
                  onChange={handleInputChange("deliveryAddress")}
                  className="md:col-span-2 field-base"
                />
                <select
                  value={form.paymentMethod}
                  onChange={handleInputChange("paymentMethod")}
                  className="field-base"
                >
                  <option>Pix</option>
                  <option>Dinheiro</option>
                  <option>Cartao de Credito</option>
                  <option>Cartao de Debito</option>
                </select>
                <textarea
                  placeholder="Observacoes (opcional)"
                  value={form.notes}
                  onChange={handleInputChange("notes")}
                  rows={3}
                  className="md:col-span-2 field-base"
                />
              </div>

              <button
                onClick={placeOrder}
                disabled={!canSubmitOrder || isSubmitting}
                className="mt-4 w-full rounded-xl bg-[#0f766e] hover:bg-[#0a5f59] disabled:bg-zinc-400 text-white py-3 font-bold"
              >
                {isSubmitting ? "Enviando pedido..." : "Finalizar pedido"}
              </button>

              {checkoutResult && (
                <div
                  className={`mt-4 rounded-md p-3 text-sm ${
                    checkoutResult.success
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <p className="font-semibold">
                    {checkoutResult.success
                      ? `Pedido confirmado #${checkoutResult.orderId}`
                      : "Falha ao enviar pedido"}
                  </p>
                  {checkoutResult.message && <p>{checkoutResult.message}</p>}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

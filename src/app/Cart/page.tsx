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
  ownerWhatsAppUrl?: string;
  customerWhatsAppUrl?: string;
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
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    <div className="mt-80 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-zinc-800">Seu Carrinho</h2>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 underline"
          >
            Voltar ao cardapio
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center">
            <p className="text-zinc-700 font-medium">
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

            <div className="mt-6 bg-white rounded-xl border p-4">
              <div className="flex justify-between text-zinc-700 mb-2">
                <span>Itens</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-zinc-900">
                <span>Total</span>
                <span>R$ {totalValue.toFixed(2)}</span>
              </div>
              <button
                onClick={clearCart}
                className="mt-4 w-full rounded-md bg-red-500 hover:bg-red-600 text-white py-2 font-semibold transition-colors"
              >
                Limpar carrinho
              </button>
            </div>

            <div className="mt-6 bg-white rounded-xl border p-4">
              <h3 className="text-lg font-bold text-zinc-800 mb-3">
                Dados para fechar pedido
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={form.customerName}
                  onChange={handleInputChange("customerName")}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (com DDD)"
                  value={form.customerPhone}
                  onChange={handleInputChange("customerPhone")}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Endereco de entrega"
                  value={form.deliveryAddress}
                  onChange={handleInputChange("deliveryAddress")}
                  className="md:col-span-2 border rounded-md px-3 py-2"
                />
                <select
                  value={form.paymentMethod}
                  onChange={handleInputChange("paymentMethod")}
                  className="border rounded-md px-3 py-2"
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
                  className="md:col-span-2 border rounded-md px-3 py-2"
                />
              </div>

              <button
                onClick={placeOrder}
                disabled={!canSubmitOrder || isSubmitting}
                className="mt-4 w-full rounded-md bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white py-3 font-semibold transition-colors"
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

                  {checkoutResult.ownerWhatsAppUrl && (
                    <a
                      href={checkoutResult.ownerWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold block mt-2"
                    >
                      Enviar pedido para o WhatsApp da lanchonete
                    </a>
                  )}

                  {checkoutResult.customerWhatsAppUrl && (
                    <a
                      href={checkoutResult.customerWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold block mt-1"
                    >
                      Enviar confirmacao para seu WhatsApp
                    </a>
                  )}
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

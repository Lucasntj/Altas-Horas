"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeliveryBanner from "@/components/DeliveryBanner";
import SocialProof from "@/components/SocialProof";
import CategoryFilter from "@/components/menu/CategoryFilter";
import ProductCard from "@/components/menu/ProductCard";
import type { Product } from "@/data/products";
import {
  formatStoreHours,
  isStoreOpenAt,
  type StoreSettings,
} from "@/utils/store-hours";

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

interface StoreSettingsResponse {
  success: boolean;
  settings: StoreSettings;
}

type ActiveCategory = Product["category"] | "todos" | "destaques";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [hasProductsError, setHasProductsError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("todos");
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setHasProductsError(false);

      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const payload = (await response.json()) as ProductsResponse;

        if (!mounted) return;
        setProducts(Array.isArray(payload.products) ? payload.products : []);
      } catch {
        if (!mounted) return;
        setHasProductsError(true);
        setProducts([]);
      } finally {
        if (mounted) setIsLoadingProducts(false);
      }
    };

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

    void loadProducts();
    void loadStoreSettings();

    const intervalId = setInterval(() => {
      void loadProducts();
      void loadStoreSettings();
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const storeHoursLabel = useMemo(() => {
    if (!storeSettings) return "";
    return formatStoreHours(storeSettings);
  }, [storeSettings]);

  const operatingHoursLabel = useMemo(() => {
    if (!storeSettings) return "";
    return `${String(storeSettings.openHour).padStart(2, "0")}h às ${String(
      storeSettings.closeHour,
    ).padStart(2, "0")}h`;
  }, [storeSettings]);

  const counts = useMemo(
    () => ({
      todos: products.length,
      destaques: products.filter((p) => p.isFeatured || p.isPopular).length,
      lanches: products.filter((p) => p.category === "lanches").length,
      acompanhamentos: products.filter((p) => p.category === "acompanhamentos")
        .length,
      bebidas: products.filter((p) => p.category === "bebidas").length,
    }),
    [products],
  );

  const filtered = useMemo(() => {
    if (activeCategory === "todos") return products;
    if (activeCategory === "destaques")
      return products.filter((p) => p.isFeatured || p.isPopular);
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured),
    [products],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="section-shell flex-1 space-y-4 pb-28 sm:space-y-6 sm:pb-10">
        {!isStoreOpen && (
          <div className="rounded-2xl border border-yellow-500/45 bg-yellow-500/10 p-4 text-center animate-fade-up">
            <p className="text-sm font-extrabold text-yellow-300">
              Estamos fechados no momento. Horário atual: {storeHoursLabel}.
            </p>
          </div>
        )}

        {hasProductsError && (
          <div className="rounded-2xl border border-yellow-500/45 bg-zinc-900 p-4 text-center">
            <p className="text-sm font-semibold text-zinc-300">
              Não foi possível carregar o cardápio agora. Tente novamente em
              instantes.
            </p>
          </div>
        )}

        {activeCategory === "todos" && featuredProducts.length > 0 && (
          <section>
            <div className="mb-3">
              <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-500">
                Destaques
              </p>
              <h2 className="mt-0.5 text-[20px] leading-tight font-extrabold text-white sm:text-2xl">
                Os favoritos da casa 🔥
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canOrder={isStoreOpen}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-500">
              Cardápio
            </p>
            <h2 className="mt-0.5 text-[20px] leading-tight font-extrabold text-white sm:text-2xl">
              Monte seu pedido
            </h2>
            <p className="mt-1 text-sm text-zinc-400 sm:text-xs sm:text-zinc-500">
              As fotos dos produtos são meramente ilustrativas.
            </p>
          </div>

          <div className="mb-3">
            <CategoryFilter
              active={activeCategory}
              onChange={setActiveCategory}
              counts={counts}
            />
          </div>

          <DeliveryBanner
            operatingHours={operatingHoursLabel}
            forceOpen={Boolean(storeSettings?.forceOpen)}
          />

          {isLoadingProducts ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center text-zinc-500">
              Carregando cardápio...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center text-zinc-500">
              Nenhum produto nessa categoria.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  canOrder={isStoreOpen}
                />
              ))}
            </div>
          )}
        </section>

        <div className="hidden md:block">
          <SocialProof />
        </div>
      </main>

      <Footer />
    </div>
  );
}

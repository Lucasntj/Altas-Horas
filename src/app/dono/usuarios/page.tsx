"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { IconEdit } from "@tabler/icons-react";
import ProductEditModal from "@/components/owner/ProductEditModal";

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

export default function OwnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    const response = await fetch("/api/products", { cache: "no-store" });
    const payload = (await response.json()) as ProductsResponse;
    return Array.isArray(payload.products) ? payload.products : [];
  };

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setIsLoading(true);
      try {
        const nextProducts = await loadProducts();
        if (!isMounted) return;
        setProducts(nextProducts);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleProduct = async (productId: string, nextValue: boolean) => {
    setPendingProductId(productId);

    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isAvailable: nextValue }),
      });

      setProducts((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, isAvailable: nextValue } : item,
        ),
      );
    } finally {
      setPendingProductId(null);
    }
  };

  const handleSaveEdit = (
    updatedProduct: Partial<
      Omit<Product, "id" | "isFeatured" | "isPopular" | "isAvailable">
    >,
  ) => {
    if (!editingProduct) return;

    setProducts((current) =>
      current.map((item) =>
        item.id === editingProduct.id ? { ...item, ...updatedProduct } : item,
      ),
    );
    setEditingProduct(null);
  };

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return products;

    return products.filter((product) =>
      [product.name, product.description, product.category]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [products, search]);

  const availableCount = products.filter((item) => item.isAvailable).length;
  const unavailableCount = products.length - availableCount;

  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Produtos</h1>
        <p>
          Edite produtos, controle disponibilidade e gerencie abas (categorias).
        </p>
      </header>

      <div className="owner-metrics-grid">
        <article className="owner-metric-card owner-metric-a">
          <p>Total de produtos</p>
          <strong>{products.length}</strong>
        </article>
        <article className="owner-metric-card owner-metric-d">
          <p>Disponíveis</p>
          <strong>{availableCount}</strong>
        </article>
        <article className="owner-metric-card owner-metric-g">
          <p>Indisponíveis</p>
          <strong>{unavailableCount}</strong>
        </article>
      </div>

      <section className="owner-panel">
        <div className="owner-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, descrição ou categoria"
            className="owner-input"
          />
          <button
            onClick={() => {
              void (async () => {
                setIsLoading(true);
                try {
                  setProducts(await loadProducts());
                } finally {
                  setIsLoading(false);
                }
              })();
            }}
            className="owner-input max-w-[170px] font-bold"
          >
            Atualizar lista
          </button>
        </div>

        {isLoading ? (
          <div className="owner-empty">Carregando produtos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="owner-empty">Nenhum produto encontrado.</div>
        ) : (
          <div className="owner-card-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="owner-data-card">
                <h3>{product.name}</h3>
                <p>{product.category}</p>
                <p className="line-clamp-2">{product.description}</p>
                <p>R$ {product.price.toFixed(2)}</p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-yellow-500/25 bg-zinc-950/35 p-3">
                    <span className="text-sm font-semibold">
                      {product.isAvailable ? "Disponível" : "Indisponível"}
                    </span>
                    <button
                      onClick={() =>
                        void toggleProduct(product.id, !product.isAvailable)
                      }
                      disabled={pendingProductId === product.id}
                      className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
                    >
                      {pendingProductId === product.id
                        ? "Salvando..."
                        : product.isAvailable
                          ? "Marcar indisponível"
                          : "Marcar disponível"}
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingProduct(product)}
                    className="w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-400 hover:bg-yellow-500/20 flex items-center justify-center gap-2"
                  >
                    <IconEdit size={16} />
                    Editar Produto
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveEdit}
        />
      )}
    </section>
  );
}

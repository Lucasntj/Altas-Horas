"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/data/products";
import { IconX } from "@tabler/icons-react";

interface ProductEditModalProps {
  product: Product;
  onClose: () => void;
  onSave: (
    updates: Partial<
      Omit<Product, "id" | "isFeatured" | "isPopular" | "isAvailable">
    >,
  ) => void;
}

export default function ProductEditModal({
  product,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    image: product.image,
    category: product.category,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!formData.name.trim()) {
        setError("Nome do produto é obrigatório");
        return;
      }

      if (!formData.description.trim()) {
        setError("Descrição do produto é obrigatória");
        return;
      }

      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        setError("Preço deve ser um número válido");
        return;
      }

      if (!formData.image.trim()) {
        setError("URL da imagem é obrigatória");
        return;
      }

      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price,
          image: formData.image.trim(),
          category: formData.category,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Erro ao salvar produto");
        return;
      }

      onSave(result.product);
      onClose();
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <IconX size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-bold">Editar Produto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-yellow-400 mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-lg border border-yellow-500/20 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-yellow-400 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSaving}
              rows={3}
              className="w-full rounded-lg border border-yellow-500/20 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none disabled:opacity-50 resize-none"
            />
          </div>

          {/* Preço e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-yellow-400 mb-1">
                Preço (R$)
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                disabled={isSaving}
                className="w-full rounded-lg border border-yellow-500/20 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-yellow-400 mb-1">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isSaving}
                className="w-full rounded-lg border border-yellow-500/20 bg-zinc-800 px-4 py-2 text-white focus:border-yellow-500 focus:outline-none disabled:opacity-50"
              >
                <option value="lanches">Lanches</option>
                <option value="acompanhamentos">Acompanhamentos</option>
                <option value="bebidas">Bebidas</option>
              </select>
            </div>
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block text-sm font-semibold text-yellow-400 mb-1">
              URL da Imagem
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-lg border border-yellow-500/20 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none disabled:opacity-50 text-sm"
            />
            {formData.image && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-yellow-500/10 bg-zinc-800/50 p-2">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={formData.image}
                    alt="Preview"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs text-zinc-400 line-clamp-1">
                  {formData.image}
                </span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-zinc-600 px-4 py-2 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatStoreHours,
  isStoreOpenAt,
  type StoreSettings,
} from "@/utils/store-hours";

interface StoreSettingsResponse {
  success: boolean;
  settings: StoreSettings;
  message?: string;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, value) => value);

export default function OwnerStoreHoursPage() {
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/store-settings", {
          cache: "no-store",
        });
        const payload = (await response.json()) as StoreSettingsResponse;

        if (!mounted) return;

        if (!response.ok || !payload.success) {
          throw new Error(
            payload.message || "Nao foi possivel carregar o horario.",
          );
        }

        setForm(payload.settings);
      } catch (loadError) {
        if (!mounted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Nao foi possivel carregar o horario.",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = <K extends keyof StoreSettings>(
    field: K,
    value: StoreSettings[K],
  ) => {
    setForm((current) => {
      if (!current) return current;
      return { ...current, [field]: value };
    });
  };

  const previewLabel = useMemo(() => {
    if (!form) return "";
    return formatStoreHours(form);
  }, [form]);

  const isOpenNow = useMemo(() => {
    if (!form) return false;
    return isStoreOpenAt(new Date(), form);
  }, [form]);

  const handleSave = async () => {
    if (!form || isSaving) return;

    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as StoreSettingsResponse;
      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Nao foi possivel salvar o horario.",
        );
      }

      setForm(payload.settings);
      setFeedback(payload.message || "Horario atualizado com sucesso.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar o horario.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Horarios da loja</h1>
        <p>
          O cliente decide pelo painel que horas o site abre e fecha para
          pedidos.
        </p>
      </header>

      <section className="owner-panel space-y-5">
        <div>
          <h2 className="owner-panel-title">Controle de funcionamento</h2>
          <p className="text-sm text-zinc-300">
            Essa configuracao vale para a vitrine e para o checkout. Nao precisa
            editar o Render para mudar horario.
          </p>
        </div>

        {isLoading && (
          <div className="owner-empty">Carregando configuracao...</div>
        )}

        {!isLoading && !form && (
          <div className="owner-empty">
            Nao foi possivel carregar as configuracoes da loja.
          </div>
        )}

        {!isLoading && form && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-200">
                  Abre as
                </span>
                <select
                  value={form.openHour}
                  onChange={(event) =>
                    updateField("openHour", Number(event.target.value))
                  }
                  className="owner-input w-full min-w-0"
                >
                  {HOUR_OPTIONS.map((hour) => (
                    <option key={hour} value={hour}>
                      {String(hour).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-200">
                  Fecha as
                </span>
                <select
                  value={form.closeHour}
                  onChange={(event) =>
                    updateField("closeHour", Number(event.target.value))
                  }
                  className="owner-input w-full min-w-0"
                >
                  {HOUR_OPTIONS.map((hour) => (
                    <option key={hour} value={hour}>
                      {String(hour).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-zinc-200">
                  Fuso horario
                </span>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(event) =>
                    updateField("timezone", event.target.value)
                  }
                  className="owner-input w-full min-w-0"
                  placeholder="America/Sao_Paulo"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <input
                type="checkbox"
                checked={form.forceOpen}
                onChange={(event) =>
                  updateField("forceOpen", event.target.checked)
                }
                className="h-4 w-4 accent-yellow-500"
              />
              <div>
                <p className="text-sm font-bold text-white">
                  Manter a loja aberta manualmente
                </p>
                <p className="text-xs text-zinc-300">
                  Ative quando quiser receber pedidos fora do horario
                  configurado.
                </p>
              </div>
            </label>

            <div className="owner-card-grid">
              <article className="owner-data-card">
                <h3>Horario salvo</h3>
                <p>{previewLabel}</p>
              </article>
              <article className="owner-data-card">
                <h3>Status agora</h3>
                <p>
                  {isOpenNow
                    ? "Loja aberta para pedidos."
                    : "Loja fechada para pedidos."}
                </p>
              </article>
            </div>

            {feedback && (
              <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
                {feedback}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-yellow-500/35 bg-yellow-500/10 p-4 text-sm font-semibold text-yellow-200">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-extrabold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Salvar horario"}
              </button>
            </div>
          </>
        )}
      </section>
    </section>
  );
}

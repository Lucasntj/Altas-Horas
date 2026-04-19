import { NextResponse } from "next/server";
import {
  getStoreSettings,
  updateStoreSettings,
} from "@/lib/store-settings-store";
import {
  formatStoreHours,
  isStoreOpenAt,
  normalizeStoreSettings,
  type StoreSettings,
} from "@/utils/store-hours";

interface UpdateStoreSettingsPayload {
  openHour?: number;
  closeHour?: number;
  timezone?: string;
  forceOpen?: boolean;
}

const serialize = (settings: StoreSettings) => ({
  settings,
  isOpen: isStoreOpenAt(new Date(), settings),
  hoursLabel: formatStoreHours(settings),
});

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json({ success: true, ...serialize(settings) });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as UpdateStoreSettingsPayload;
    const nextSettings = normalizeStoreSettings(body);
    const settings = await updateStoreSettings(nextSettings);

    return NextResponse.json({
      success: true,
      message: "Horario da loja atualizado com sucesso.",
      ...serialize(settings),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro interno ao salvar horario da loja." },
      { status: 500 },
    );
  }
}

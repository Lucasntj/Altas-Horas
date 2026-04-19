const parseHour = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 23
    ? parsed
    : fallback;
};

const parseBoolean = (value: string | undefined): boolean => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
};

export interface StoreSettings {
  openHour: number;
  closeHour: number;
  timezone: string;
  forceOpen: boolean;
}

export const STORE_OPEN_HOUR: number = parseHour(
  process.env.NEXT_PUBLIC_STORE_OPEN_HOUR ?? process.env.STORE_OPEN_HOUR,
  18,
);

export const STORE_CLOSE_HOUR: number = parseHour(
  process.env.NEXT_PUBLIC_STORE_CLOSE_HOUR ?? process.env.STORE_CLOSE_HOUR,
  2,
);

export const STORE_TIMEZONE: string =
  process.env.NEXT_PUBLIC_STORE_TIMEZONE ??
  process.env.STORE_TIMEZONE ??
  "America/Sao_Paulo";

export const STORE_FORCE_OPEN: boolean = parseBoolean(
  process.env.NEXT_PUBLIC_STORE_FORCE_OPEN ?? process.env.STORE_FORCE_OPEN,
);

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  openHour: STORE_OPEN_HOUR,
  closeHour: STORE_CLOSE_HOUR,
  timezone: STORE_TIMEZONE,
  forceOpen: STORE_FORCE_OPEN,
};

export const normalizeStoreSettings = (
  value?: Partial<StoreSettings> | null,
): StoreSettings => ({
  openHour: parseHour(String(value?.openHour), DEFAULT_STORE_SETTINGS.openHour),
  closeHour: parseHour(
    String(value?.closeHour),
    DEFAULT_STORE_SETTINGS.closeHour,
  ),
  timezone:
    typeof value?.timezone === "string" && value.timezone.trim()
      ? value.timezone.trim()
      : DEFAULT_STORE_SETTINGS.timezone,
  forceOpen:
    typeof value?.forceOpen === "boolean"
      ? value.forceOpen
      : DEFAULT_STORE_SETTINGS.forceOpen,
});

const getHourInStoreTimezone = (date: Date, timezone: string): number => {
  try {
    const hour = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(date);

    return Number.parseInt(hour, 10);
  } catch {
    const fallbackHour = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: DEFAULT_STORE_SETTINGS.timezone,
    }).format(date);

    return Number.parseInt(fallbackHour, 10);
  }
};

// Suporta janelas que cruzam meia-noite (ex.: 18:00 até 02:00)
export const isStoreOpenAt = (
  date: Date,
  settings: StoreSettings = DEFAULT_STORE_SETTINGS,
): boolean => {
  if (settings.forceOpen) return true;

  const hour = getHourInStoreTimezone(date, settings.timezone);

  if (settings.openHour === settings.closeHour) {
    return true;
  }

  if (settings.openHour < settings.closeHour) {
    return hour >= settings.openHour && hour < settings.closeHour;
  }

  return hour >= settings.openHour || hour < settings.closeHour;
};

export const formatStoreHours = (settings: StoreSettings): string => {
  if (settings.forceOpen) {
    return "aberta manualmente";
  }

  return `${String(settings.openHour).padStart(2, "0")}:00 às ${String(settings.closeHour).padStart(2, "0")}:00`;
};

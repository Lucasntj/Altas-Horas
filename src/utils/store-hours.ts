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

const getHourInStoreTimezone = (date: Date): number => {
  const hour = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: STORE_TIMEZONE,
  }).format(date);

  return Number.parseInt(hour, 10);
};

// Suporta janelas que cruzam meia-noite (ex.: 18:00 até 02:00)
export const isStoreOpenAt = (date: Date): boolean => {
  if (STORE_FORCE_OPEN) return true;

  const hour = getHourInStoreTimezone(date);

  if (STORE_OPEN_HOUR === STORE_CLOSE_HOUR) {
    return true;
  }

  if (STORE_OPEN_HOUR < STORE_CLOSE_HOUR) {
    return hour >= STORE_OPEN_HOUR && hour < STORE_CLOSE_HOUR;
  }

  return hour >= STORE_OPEN_HOUR || hour < STORE_CLOSE_HOUR;
};

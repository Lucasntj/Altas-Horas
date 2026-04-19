import { promises as fs } from "node:fs";
import path from "node:path";
import { kvGet, kvSet } from "./kv-store";
import {
  DEFAULT_STORE_SETTINGS,
  normalizeStoreSettings,
  type StoreSettings,
} from "@/utils/store-hours";

const KV_STORE_SETTINGS_KEY = "altas-horas:store-settings";

const storeSettingsFilePath =
  process.env.STORE_SETTINGS_FILE ??
  path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    ".data",
    "store-settings.json",
  );

let settingsCache: StoreSettings | null = null;
let writeQueue = Promise.resolve();

export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (settingsCache) {
    return settingsCache;
  }

  try {
    const kvSettings = await kvGet<Partial<StoreSettings>>(
      KV_STORE_SETTINGS_KEY,
    );
    if (kvSettings) {
      settingsCache = normalizeStoreSettings(kvSettings);
      return settingsCache;
    }
  } catch (error) {
    console.warn("Erro ao carregar configuracoes da loja de KV:", error);
  }

  try {
    const fileContent = await fs.readFile(storeSettingsFilePath, "utf-8");
    settingsCache = normalizeStoreSettings(JSON.parse(fileContent));
    return settingsCache;
  } catch {
    settingsCache = DEFAULT_STORE_SETTINGS;
    return settingsCache;
  }
};

export const updateStoreSettings = async (
  updates: Partial<StoreSettings>,
): Promise<StoreSettings> => {
  const current = await getStoreSettings();
  const nextSettings = normalizeStoreSettings({
    ...current,
    ...updates,
  });

  settingsCache = nextSettings;

  try {
    await kvSet(KV_STORE_SETTINGS_KEY, nextSettings);
  } catch (error) {
    console.warn("Erro ao salvar configuracoes da loja em KV:", error);
  }

  writeQueue = writeQueue
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(storeSettingsFilePath), {
          recursive: true,
        });
        await fs.writeFile(
          storeSettingsFilePath,
          JSON.stringify(nextSettings, null, 2),
          "utf-8",
        );
      } catch {
        // Mantem cache em memoria caso o ambiente nao permita escrita.
      }
    })
    .catch(() => undefined);

  await writeQueue;

  return nextSettings;
};

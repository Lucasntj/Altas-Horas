import { kvGet, kvSet } from "./kv-store";
import { promises as fs } from "node:fs";
import path from "node:path";
import productsData, { type Product } from "@/data/products";

interface AvailabilityRow {
  id: string;
  isAvailable: boolean;
}

interface ProductEditRow {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
}

const KV_AVAILABILITY_KEY = "altas-horas:products:availability";
const KV_EDITS_KEY = "altas-horas:products:edits";

const availabilityFilePath =
  process.env.PRODUCTS_DATA_FILE ??
  path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    ".data",
    "products-availability.json",
  );

const editsFilePath =
  process.env.PRODUCTS_EDITS_FILE ??
  path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    ".data",
    "products-edits.json",
  );

let availabilityCache: Map<string, boolean> | null = null;
let editsCache: Map<string, ProductEditRow> | null = null;
let writeQueue = Promise.resolve();

const ensureAvailabilityLoaded = async (): Promise<Map<string, boolean>> => {
  if (availabilityCache) return availabilityCache;

  // 1. Tenta KV
  try {
    const kvData = await kvGet<AvailabilityRow[]>(KV_AVAILABILITY_KEY);
    if (kvData && Array.isArray(kvData)) {
      availabilityCache = new Map();
      for (const row of kvData) {
        if (!row?.id) continue;
        availabilityCache.set(row.id, Boolean(row.isAvailable));
      }
      return availabilityCache;
    }
  } catch (error) {
    console.warn("Erro ao carregar availability de KV:", error);
  }

  // 2. Tenta arquivo
  try {
    const file = await fs.readFile(availabilityFilePath, "utf-8");
    const parsed = JSON.parse(file) as AvailabilityRow[];
    availabilityCache = new Map();

    for (const row of parsed) {
      if (!row?.id) continue;
      availabilityCache.set(row.id, Boolean(row.isAvailable));
    }
  } catch {
    availabilityCache = new Map();
  }

  return availabilityCache;
};

const ensureEditsLoaded = async (): Promise<Map<string, ProductEditRow>> => {
  if (editsCache) return editsCache;

  // 1. Tenta KV
  try {
    const kvData = await kvGet<ProductEditRow[]>(KV_EDITS_KEY);
    if (kvData && Array.isArray(kvData)) {
      editsCache = new Map();
      for (const row of kvData) {
        if (!row?.id) continue;
        editsCache.set(row.id, row);
      }
      return editsCache;
    }
  } catch (error) {
    console.warn("Erro ao carregar edits de KV:", error);
  }

  // 2. Tenta arquivo
  try {
    const file = await fs.readFile(editsFilePath, "utf-8");
    const parsed = JSON.parse(file) as ProductEditRow[];
    editsCache = new Map();

    for (const row of parsed) {
      if (!row?.id) continue;
      editsCache.set(row.id, row);
    }
  } catch {
    editsCache = new Map();
  }

  return editsCache;
};

const persistAvailability = async (map: Map<string, boolean>) => {
  const rows: AvailabilityRow[] = Array.from(map.entries()).map(
    ([id, isAvailable]) => ({ id, isAvailable }),
  );

  // 1. Salva em KV
  try {
    await kvSet(KV_AVAILABILITY_KEY, rows);
  } catch (error) {
    console.warn("Erro ao salvar availability em KV:", error);
  }

  // 2. Salva em arquivo
  writeQueue = writeQueue
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(availabilityFilePath), { recursive: true });
        await fs.writeFile(
          availabilityFilePath,
          JSON.stringify(rows, null, 2),
          "utf-8",
        );
      } catch {
        // Mantém em memória caso o ambiente não permita escrita.
      }
    })
    .catch(() => undefined);

  await writeQueue;
};

const persistEdits = async (map: Map<string, ProductEditRow>) => {
  const rows: ProductEditRow[] = Array.from(map.values());

  // 1. Salva em KV
  try {
    await kvSet(KV_EDITS_KEY, rows);
  } catch (error) {
    console.warn("Erro ao salvar edits em KV:", error);
  }

  // 2. Salva em arquivo
  writeQueue = writeQueue
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(editsFilePath), { recursive: true });
        await fs.writeFile(
          editsFilePath,
          JSON.stringify(rows, null, 2),
          "utf-8",
        );
      } catch {
        // Mantém em memória caso o ambiente não permita escrita.
      }
    })
    .catch(() => undefined);

  await writeQueue;
};

export const listProducts = async (): Promise<Product[]> => {
  const availability = await ensureAvailabilityLoaded();
  const edits = await ensureEditsLoaded();

  return productsData.map((product) => {
    const edit = edits.get(product.id);
    return {
      id: product.id,
      name: edit?.name ?? product.name,
      description: edit?.description ?? product.description,
      price: edit?.price ?? product.price,
      image: edit?.image ?? product.image,
      category: (edit?.category ?? product.category) as Product["category"],
      isFeatured: product.isFeatured,
      isPopular: product.isPopular,
      isAvailable: availability.get(product.id) ?? product.isAvailable,
    };
  });
};

export const updateProductData = async (
  productId: string,
  updates: Partial<
    Omit<Product, "id" | "isFeatured" | "isPopular" | "isAvailable">
  >,
): Promise<Product | null> => {
  const product = productsData.find((item) => item.id === productId);
  if (!product) return null;

  const edits = await ensureEditsLoaded();
  const currentEdit = edits.get(productId) || {};

  const updated = { id: productId, ...currentEdit, ...updates };
  edits.set(productId, updated);
  await persistEdits(edits);

  // Invalidate cache
  editsCache = null;

  const availability = await ensureAvailabilityLoaded();
  return {
    id: product.id,
    name: updated.name ?? product.name,
    description: updated.description ?? product.description,
    price: updated.price ?? product.price,
    image: updated.image ?? product.image,
    category: (updated.category ?? product.category) as Product["category"],
    isFeatured: product.isFeatured,
    isPopular: product.isPopular,
    isAvailable: availability.get(product.id) ?? product.isAvailable,
  };
};

export const updateProductAvailability = async (
  productId: string,
  isAvailable: boolean,
): Promise<Product | null> => {
  const product = productsData.find((item) => item.id === productId);
  if (!product) return null;

  const availability = await ensureAvailabilityLoaded();
  availability.set(productId, isAvailable);
  await persistAvailability(availability);

  return {
    ...product,
    isAvailable,
  };
};

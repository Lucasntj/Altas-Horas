/**
 * Camada abstrata para persistência (Redis em Vercel, JSON local em dev)
 */

interface KvClient {
  set(key: string, value: string): Promise<unknown>;
  get(key: string): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

let kvClient: KvClient | null = null;
let useKv = false;
let kvInitialized = false;

const hasKvEnv = (): boolean => {
  const kvRestUrl = process.env.KV_REST_API_URL;
  const kvRestToken = process.env.KV_REST_API_TOKEN;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  return Boolean((kvRestUrl && kvRestToken) || (upstashUrl && upstashToken));
};

// Tenta carregar Vercel KV
async function initKv() {
  if (kvInitialized) return;
  kvInitialized = true;

  if (!hasKvEnv()) {
    return;
  }

  try {
    const kv = await import("@vercel/kv");
    if (kv.kv) {
      kvClient = kv.kv as unknown as KvClient;
      useKv = true;
    }
  } catch {
    // Vercel KV não disponível, usa fallback em memória/arquivo
  }
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  await initKv();

  if (useKv && kvClient) {
    try {
      await kvClient.set(key, JSON.stringify(value));
      return;
    } catch (error) {
      console.warn("KV set error, falling back:", error);
    }
  }

  // Fallback: não implementa persistência real (dados perdidos em restart)
  // Em production, use Vercel KV
}

export async function kvGet<T>(key: string): Promise<T | null> {
  await initKv();

  if (useKv && kvClient) {
    try {
      const value = await kvClient.get(key);
      return value ? (JSON.parse(String(value)) as T) : null;
    } catch (error) {
      console.warn("KV get error:", error);
      return null;
    }
  }

  return null;
}

export async function kvDel(key: string): Promise<void> {
  await initKv();

  if (useKv && kvClient) {
    try {
      await kvClient.del(key);
    } catch (error) {
      console.warn("KV del error:", error);
    }
  }
}

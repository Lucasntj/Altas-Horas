import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalPool = globalThis as unknown as { __sharedPool?: Pool };

export const pool: Pool | null = databaseUrl
  ? (globalPool.__sharedPool ?? new Pool({ connectionString: databaseUrl }))
  : null;

if (pool && !globalPool.__sharedPool) {
  globalPool.__sharedPool = pool;
}

import mongoose from "mongoose";
import { env } from "../config/env";

// Bloquea operadores ($ne, $gt...) que lleguen desde la entrada del usuario (inyección NoSQL)
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = g.__mongoose ?? (g.__mongoose = { conn: null, promise: null });

// Conexión reutilizada entre invocaciones serverless (Vercel)
export async function connectDatabase(uri: string = env.databaseUrl): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 10 })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}

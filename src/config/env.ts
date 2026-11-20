import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || "",
  cronSecret: process.env.CRON_SECRET || "",
  // Orígenes que pueden consumir la API desde el navegador (separados por coma); vacío = cualquiera
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};

export function validateEnv(): void {
  if (!env.databaseUrl) throw new Error("Falta la variable de entorno DATABASE_URL");
}

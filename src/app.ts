// Entrada de la API. Vercel la detecta automáticamente (Express zero-config: src/app.ts);
// en local se arranca con src/server.ts.
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { unwrapResolverError } from "@apollo/server/errors";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import type { Context } from "./graphql/resolvers/user.resolver";
import { UserService } from "./services/user.service";
import { AppError } from "./errors/AppError";
import { env, validateEnv } from "./config/env";
import { connectDatabase } from "./database/connection";
import { seedDatabase } from "./database/seed-data";

const apollo = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  // La API es una demo pública: se deja la introspección para explorarla desde el Sandbox
  introspection: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true, includeCookies: false })],
  formatError: (formatted, error) => {
    const original = unwrapResolverError(error);
    if (original instanceof AppError || formatted.extensions?.code !== "INTERNAL_SERVER_ERROR") {
      return { message: formatted.message, extensions: { code: formatted.extensions?.code } };
    }
    // Los errores internos no exponen detalles (ISO 27001 A.8.12)
    if (!env.isTest) console.error(original);
    return { message: "Error interno del servidor", extensions: { code: "INTERNAL_ERROR" } };
  },
});

// En serverless, Apollo se inicia una sola vez por instancia
let started: Promise<void> | null = null;
const startApollo = () => (started ??= apollo.start());

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

// El Sandbox de Apollo carga scripts y un iframe desde su CDN: se permiten solo esos orígenes
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://embeddable-sandbox.cdn.apollographql.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://apollo-server-landing-page.cdn.apollographql.com"],
        frameSrc: ["'self'", "https://sandbox.embed.apollographql.com"],
        manifestSrc: ["'self'", "https://apollo-server-landing-page.cdn.apollographql.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true }));

app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    validateEnv();
    await Promise.all([connectDatabase(), startApollo()]);
    next();
  } catch (error) {
    if (!env.isTest) console.error("Error de inicialización:", (error as Error).message);
    res.status(503).json({ errors: [{ message: "Servicio no disponible temporalmente" }] });
  }
});

app.get("/", (_req, res) => res.redirect("/graphql"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Restaura los datos de demostración una vez al día (ver vercel.json → crons)
app.get("/api/cron/reset-demo", async (req, res, next) => {
  try {
    const expected = Buffer.from(`Bearer ${env.cronSecret}`);
    const received = Buffer.from(req.headers.authorization || "");
    const ok = env.cronSecret && expected.length === received.length && crypto.timingSafeEqual(expected, received);
    if (!ok) return res.status(401).json({ message: "No autorizado" });
    res.json({ message: "Datos de demostración restaurados", ...(await seedDatabase()) });
  } catch (error) {
    next(error);
  }
});

app.use(
  "/graphql",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { errors: [{ message: "Demasiadas solicitudes, intenta de nuevo en unos minutos" }] },
  }),
  express.json({ limit: "50kb" }),
  (req: Request, res: Response, next: NextFunction) =>
    expressMiddleware(apollo, { context: async () => ({ userService: new UserService() }) })(req, res, next)
);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.too.large") return res.status(413).json({ errors: [{ message: "Consulta demasiado grande" }] });
  if (err.type === "entity.parse.failed") return res.status(400).json({ errors: [{ message: "JSON inválido" }] });
  if (!env.isTest) console.error(err);
  res.status(500).json({ errors: [{ message: "Error interno del servidor" }] });
});

export default app;

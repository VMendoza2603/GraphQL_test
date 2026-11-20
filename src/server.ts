// Arranque local: npm run dev / npm start (en Vercel se usa src/app.ts)
import app from "./app";
import { env, validateEnv } from "./config/env";
import { connectDatabase } from "./database/connection";

async function main() {
  validateEnv();
  await connectDatabase();
  app.listen(env.port, () => console.log(`API GraphQL lista en http://localhost:${env.port}/graphql`));
}

main().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exit(1);
});

// Uso: npm run seed  (borra la colección y carga los datos de ejemplo)
import { validateEnv } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./database/connection";
import { seedDatabase } from "./database/seed-data";

async function run() {
  validateEnv();
  await connectDatabase();
  console.log("Seed completado:", await seedDatabase());
  await disconnectDatabase();
}

run().catch((error) => {
  console.error("Error durante el seed:", error.message);
  process.exit(1);
});

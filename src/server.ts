import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./graphql/schema";
import { createContext } from "./graphql/context";
import { env } from "./config/env";
import { connectDatabase } from "./lib/database";

async function main() {
  await connectDatabase();

  const server = new ApolloServer({
    typeDefs: schema.typeDefs,
    resolvers: schema.resolvers,
    formatError: (formattedError) => {
      return {
        message: formattedError.message,
        code: formattedError.extensions?.code || "INTERNAL_ERROR",
        statusCode: formattedError.extensions?.statusCode || 500,
      };
    },
  });

  const { url } = await startStandaloneServer(server, {
    context: createContext,
    listen: { port: env.port },
  });

  console.log(`Servidor listo en ${url}`);
}

main().catch(console.error);

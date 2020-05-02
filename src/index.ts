import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import { resolvers } from "./resolvers";
import * as path from "path";
import { createTypeormConnection } from "./Utils/createTypeormConnection";

/* The whole process of starting the server was transformed
into an exported function to be called inside the tests */
export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, "schema.graphql")); // or .gql or glob pattern like **/*.graphql

  const server = new GraphQLServer({ typeDefs, resolvers });

  await createTypeormConnection();
  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();

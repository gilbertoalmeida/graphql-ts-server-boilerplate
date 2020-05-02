import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import { resolvers } from "./resolvers";
import * as path from "path";
import { createConnection } from "typeorm";

const typeDefs = importSchema(path.join(__dirname, "schema.graphql")); // or .gql or glob pattern like **/*.graphql

const server = new GraphQLServer({ typeDefs, resolvers });

/* connects to the database using the ormconfig file, AND sinchronizes it
so that it catches changes in the entities, for example (set as true in ormconfig)*/
createConnection().then(() => {
  server.start(() => console.log("Server is running on localhost:4000"));
});

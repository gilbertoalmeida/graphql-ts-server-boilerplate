import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";
import { createTypeormConnection } from "./Utils/createTypeormConnection";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";

/* The whole process of starting the server was transformed
into an exported function to be called inside the tests */
export const startServer = async () => {
  /* the resolvers and schemas are divided in different folders 
  inside modules, so we need to get each one */
  const schemas: GraphQLSchema[] = []; /* you can see this type by hovering over makeExecutableSchema */
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });

  await createTypeormConnection();
  /* If the node environment is test, the ormconfig has a dropSchema 
   set to true and the database drops(deletes everything inside)*/

  const port = process.env.NODE_ENV === "test" ? 0 : 4000;
  const app = await server.start({ port });

  console.log(`Server is running on localhost:${port}`);

  return app;
};

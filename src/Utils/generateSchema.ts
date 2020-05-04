import { importSchema } from "graphql-import";
import * as path from "path";
import * as fs from "fs";
import { GraphQLSchema } from "graphql";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";

export const generateSchema = () => {
  /* the resolvers and schemas are divided in different folders 
  inside modules, so we need to get each one */
  const schemas: Array<
    GraphQLSchema
  > = []; /* you can see this type by hovering over makeExecutableSchema */
  const folders = fs.readdirSync(path.join(__dirname, "../modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `../modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });
  return mergeSchemas({ schemas });
};

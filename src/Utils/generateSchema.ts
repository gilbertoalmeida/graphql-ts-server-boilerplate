import { mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import * as path from "path";
import * as fs from "fs";
import { makeExecutableSchema } from "graphql-tools";
import * as glob from "glob";

export const generateSchema = () => {
  const pathToModules = path.join(__dirname, "../modules");
  /* glob finds files. Uses the star notation of Unix. We are looking for all
  files ending with .graphql (*) in any folder and in any depth (**) */
  const graphqlTypes = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(x => fs.readFileSync(x, { encoding: "utf8" }));
  /* I am getting an array of strings, each item in the array is
    a graphql type */

  /* doing the same think for the resolvers. the ?s is so that
    it will match any character there, not matter if it is .js 
    or .ts*/
  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(resolver => require(resolver).resolvers);
  /* each resolver is exported as a const resolvers, that is where
    this resolvers comes from */

  /* merging everything together */
  return makeExecutableSchema({
    typeDefs: mergeTypes(graphqlTypes),
    resolvers: mergeResolvers(resolvers)
  });
};

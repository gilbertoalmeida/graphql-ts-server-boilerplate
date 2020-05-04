import { ResolverMap } from "../../types/graphql-utils";
import { GQL } from "../../types/schema";

/* IResolvers is getting types to ad. For the _ , for example */
export const resolvers: ResolverMap = {
  Query: {
    /* This GQL.I... thing are the types of the object. The object is in the schema
    And we get the types through the library gql2ts. Run the script in package.json
    and it creates a file with the types inside the types folder, you need to export 
    the namespace created inside, instead of just declaring */
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `oh hey ${name || "you"}`
  }
};

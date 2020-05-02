/* import { IResolvers } from "graphql-tools"; */
import { ResolverMap } from "./types/graphql-utils";

/* IResolvers is getting types to ad. For the _ , for example */
export const resolvers: ResolverMap = {
  Query: {
    /* This GQL.I... thing are the types of the object. The object is in the schema
    And we get the types through the library gql2ts. Run the script in package.json
    and it creates a file with the types inside the types folder */
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`
  },
  Mutation: {
    register: (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      console.log(email, password);
    }
  }
};

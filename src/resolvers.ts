import { IResolvers } from "graphql-tools";
import * as bcrypt from "bcryptjs";
import { User } from "./entity/User";

/* IResolvers is getting types to ad. For the _ , for example */
export const resolvers: IResolvers = {
  Query: {
    /* This GQL.I... thing are the types of the object. The object is in the schema
    And we get the types through the library gql2ts. Run the script in package.json
    and it creates a file with the types inside the types folder */
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });

      /* Hovering over this function you can see that it returns a Promisse,
      so you can use await here. If you do the same above at create, it just
      returns an object for the user, so you cannot do the same */
      await user.save();

      return true;
    }
  }
};

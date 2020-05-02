import { IResolvers } from "graphql-tools";
import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";

/* IResolvers is getting types to ad. For the _ , for example */
export const resolvers: IResolvers = {
  /* just a dummy querry, bc graphql-tools was throwing an error when
  there was only a mutation */
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    /* This GQL.I... thing are the types of the object. The object is in the schema
    And we get the types through the library gql2ts. Run the script in package.json
    and it creates a file with the types inside the types folder */
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      /* check existing email */
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: "already taken"
          }
        ];
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });

      /* Hovering over this function you can see that it returns a Promisse,
      so you can use await here. If you do the same above at create, it just
      returns an object for the user, so you cannot do the same */
      await user.save();

      return null;
    }
  }
};

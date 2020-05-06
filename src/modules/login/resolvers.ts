import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { GQL } from "../../types/schema";
import { invalidLogin, confirmEmailMessage } from "./errorMessages";

const errorResponse = [
  {
    path: "email",
    message: invalidLogin
  }
];

/* IResolvers is getting types to ad. For the _ , for example */
export const resolvers: ResolverMap = {
  /* just a dummy querry, bc graphql-tools was throwing an error when
  there was only a mutation */
  Query: {
    bye2: () => "bye"
  },
  Mutation: {
    /* This GQL.I... thing are the types of the object. The object is in the schema
    And we get the types through the library gql2ts. Run the script in package.json
    and it creates a file with the types inside the types folder, you need to export 
    the namespace created inside, instead of just declaring */
    /* redis is in the context, see startServer */
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session }
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmailMessage
          }
        ];
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return errorResponse;
      }

      /* login successfull */

      session.userId = user.id;
      /* everytime the user does a request, we can look this variable to know their id */

      return null;
    }
  }
};

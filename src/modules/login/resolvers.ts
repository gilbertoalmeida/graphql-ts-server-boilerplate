import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { GQL } from "../../types/schema";
import {
  invalidLogin,
  confirmEmailMessage,
  forgotPasswordLockedError
} from "./errorMessages";
import { userSessionIdPrefix } from "../../constants";

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
      { session, redis, req }
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

      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: forgotPasswordLockedError
          }
        ];
      }

      let validPassword;
      if (user.password) {
        validPassword = await bcrypt.compare(password, user.password);
      }

      if (!validPassword) {
        return errorResponse;
      }

      /* login successfull */

      session.userId = user.id;
      /* everytime the user does a request, we can look this variable to know their id */

      /* storing the sessions in redis to be able to logout from all */
      /* lpush creates an array and add an element or push an element to an 
      array if it already exists. So we aredoing a key of the user.id and we are
      pushing the session id to it */
      /* adding a prefix bc we might want to use the user.id in redis in the future
      and we don't wanna have the same key. So we are adding a prefix to all
      keys that concerne this session storage */
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID);
      }

      return null;
    }
  }
};

import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { createMiddleware } from "../../Utils/createMiddleware";
import middleware from "./middleware";

export const resolvers: ResolverMap = {
  Query: {
    /* middleware as the first parameter and the resolver as 
    the second*/
    me: createMiddleware(middleware, async (_, __, { session }) => {
      const loggedUser = await User.findOne({ where: { id: session.userId } });

      return loggedUser;
    })
  }
};

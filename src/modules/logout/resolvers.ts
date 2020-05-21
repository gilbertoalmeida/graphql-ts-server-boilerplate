import { ResolverMap } from "../../types/graphql-utils";
import { removeAllUserSessions } from "../../Utils/removeAllUserSessions";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;

      if (userId) {
        removeAllUserSessions(userId, redis);
        return true;
      }
      return false;
    }
  }
};

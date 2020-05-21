import { ResolverMap } from "../../types/graphql-utils";
import { redisSessionPrefix, userSessionIdPrefix } from "../../constants";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;

      if (userId) {
        /* Normally you use get to get the key from redis, but since the sessions
        IDs is a list in an array of the userID (see login resolver), we need to
        use lrange*/
        /* 0 is to start on the first one, and -1 is to get all others */
        const sessionIds = await redis.lrange(
          `${userSessionIdPrefix}${userId}`,
          0,
          -1
        );

        const promises = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < sessionIds.length; i += 1) {
          promises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`));
        }

        /* if we put await inside the for loop they will run one
        after the other, so instead we create an array of promises
        and just await for all of them in the end. This way, they
        run in parallel, and we just await for all afterwards. */
        await Promise.all(promises);

        /* deleting the key of redis that contains all the previously active sessions
        that were now deleted */
        await redis.del(`${userSessionIdPrefix}${userId}`);

        return true;
      }
      return false;
    }
  }
};

/* 

         */

import { Redis } from "ioredis";
import { removeAllUserSessions } from "./removeAllUserSessions";
import { User } from "../entity/User";

export const forgotPasswordLockAccount = async (
  userId: string,
  redis: Redis
) => {
  /* making sure they can't login anymore */
  await User.update({ id: userId }, { forgotPasswordLocked: true });

  /* logging out from everywhere */
  await removeAllUserSessions(userId, redis);
};

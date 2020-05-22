import * as yup from "yup";
import * as bcrypt from "bcryptjs";
import { ResolverMap } from "../../../types/graphql-utils";
import { GQL } from "../../../types/schema";
import { forgotPasswordLockAccount } from "../../../Utils/forgotPasswordLockAccount";
import { createForgotPasswordLink } from "../../../Utils/createForgotPasswordLink";
import { User } from "../../../entity/User";
import {
  userNotFoundError,
  expiredChangePasswordKeyError
} from "./errorMessages";
import { forgotPasswordPrefix } from "../../../constants";
import { registerPasswordValidation } from "../../../yupSchemas";
import { formatYuperror } from "../../../Utils/formatYupError";

/* field validation 
second parameter is custom message*/
const forgotPasswordSchema = yup.object().shape({
  newPassword: registerPasswordValidation
});

/* IResolvers is getting types to ad. For the _ , for example */
export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      /* At the moment we are locking the account when forgot password
      is called, this means that anybody could do it if they have the 
      email. This needs to be changed */
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: "email",
            message: userNotFoundError
          }
        ];
      }

      await forgotPasswordLockAccount(user.id, redis);
      /* TODO: add frontend url */
      await createForgotPasswordLink("", user.id, redis);
      /* TODO: send email with URL */

      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;
      const userId = await redis.get(redisKey);

      if (!userId) {
        return [
          {
            path: "key",
            message: expiredChangePasswordKeyError
          }
        ];
      }

      /* validation of the argument fields */
      try {
        await forgotPasswordSchema.validate(
          { newPassword },
          { abortEarly: false }
        );
        /* abortEarly avoids teh validation to stop on the first err
        and shows all the errors */
      } catch (err) {
        return formatYuperror(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update(
        { id: userId },
        {
          forgotPasswordLocked: false,
          password: hashedPassword
        }
      );

      const deleteKeyPromise = redis.del(redisKey);

      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    }
  }
};

import * as yup from "yup";
import { User } from "../../entity/User";
import { formatYuperror } from "../../Utils/formatYupError";
import {
  duplicateEmail,
  emailNotLongEnough,
  emailNotValid
} from "./errorMessages";
import { createConfirmEmailLink } from "../../Utils/createConfirmEmailLink";
import { ResolverMap } from "../../types/graphql-utils";
import { GQL } from "../../types/schema";
import { Context } from "graphql-yoga/dist/types";
import { sendEmail } from "../../Utils/sendEmail";
import { registerPasswordValidation } from "../../yupSchemas";

/* field validation 
second parameter is custom message*/
const registerSchema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(emailNotValid),
  password: registerPasswordValidation
});

/* IResolvers is getting types to ad. For the _ , for example */
export const resolvers: ResolverMap = {
  /* just a dummy querry, bc graphql-tools was throwing an error when
  there was only a mutation */
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    /* This GQL.I... thing are the types of the object. The object is in the schema
    And we get the types through the library gql2ts. Run the script in package.json
    and it creates a file with the types inside the types folder, you need to export 
    the namespace created inside, instead of just declaring */
    /* redis is in the context, see startServer */
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }: Context
    ) => {
      /* validation of the argument fields */
      try {
        await registerSchema.validate(args, { abortEarly: false });
        /* abortEarly avoids teh validation to stop on the first err
        and shows all the errors */
      } catch (err) {
        return formatYuperror(err);
      }

      const { email, password } = args;
      /* check existing email */
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }

      /* the hashing of the password is now happening in the entity.
      Typeworm is doing that before insert */
      const user = User.create({
        email,
        password
      });

      /* Hovering over this function you can see that it returns a Promisse,
      so you can use await here. If you do the same above at create, it just
      returns an object for the user, so you cannot do the same */
      await user.save();

      const confirmationLink = await createConfirmEmailLink(
        url,
        user.id,
        redis
      );

      if (process.env.NODE_ENV !== "test") {
        await sendEmail(email, confirmationLink);
      }

      return null;
    }
  }
};

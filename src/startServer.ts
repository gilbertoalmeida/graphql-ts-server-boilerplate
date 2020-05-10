import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";

import { createTypeormConnection } from "./Utils/createTypeormConnection";

import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { generateSchema } from "./Utils/generateSchema";

const SESSION_SECRET = "kuT6btB7G78G87Gg";
const RedisStore = connectRedis(session);

/* The whole process of starting the server was transformed
into an exported function to be called inside the tests */
export const startServer = async () => {
  const schemas = generateSchema();
  const server = new GraphQLServer({
    schema: schemas,
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session // so we can access the session object from every request for authentication
    })
  });

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "tl-id",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  /* 
  resave - // doesn't resave the session everytime the server is hit with a request
  saveUninitialized - // don't create a cookie for the user until we store some data on the session (login successful of login resolver)
  httpOnly - // javascript cannot access the cookie
  secure - // will only send the cookie in https
  */

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === "test"
        ? "*"
        : (process.env.FRONTEND_HOST as string)
  };

  /* the confirmation email link route. It will fetch back the userId stored under the random id in redis*/
  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConnection();
  /* If the node environment is test, the ormconfig has a dropSchema 
   set to true and the database drops(deletes everything inside)*/

  const port = process.env.NODE_ENV === "test" ? 0 : 4000;
  const app = await server.start({ cors, port });

  console.log(`Server is running on localhost:${port}`);

  return app;
};

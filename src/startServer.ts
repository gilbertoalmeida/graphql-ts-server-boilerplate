import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import { createTypeormConnection } from "./Utils/createTypeormConnection";
import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { generateSchema } from "./Utils/generateSchema";
import { redisSessionPrefix } from "./constants";
import * as rateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as passport from "passport";
import { Strategy } from "passport-twitter";
import { User } from "./entity/User";
import { createTestConnection } from "./testUtils/createTestConnection";
import { Connection } from "typeorm";

const SESSION_SECRET = "kuT6btB7G78G87Gg";
const RedisStore = connectRedis(session);

/* The whole process of starting the server was transformed
into an exported function to be called inside the tests */
export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    /* cleaning redis for an empty test */
    await redis.flushall();
  }

  const schemas = generateSchema();
  const server = new GraphQLServer({
    schema: schemas,
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session, // so we can access the session object from every request for authentication
      req: request /* whole request object, I wanna get the sessionID in the login */
    })
  });

  server.express.use(
    rateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    })
  );

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
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

  const connection: Connection =
    process.env.NODE_ENV === "test"
      ? await createTestConnection(true)
      : await createTypeormConnection();
  /* If the node environment is test, the ormconfig has a dropSchema 
   set to true and the database drops(deletes everything inside)*/

  /* Twitter OAuth */
  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
        callbackURL: "http://localhost:4000/auth/twitter/callback",
        includeEmail: true
      },
      async (_, __, profile, cb) => {
        /* this is what happens after the user authorizes the login,
        by default it is authorizing access to MANY things, I need to limit this */
        /* profile has many info on the user */
        const { id, emails } = profile;

        /* first I want to find if the twitterId has already signed
          in, or if the email from twitter has already signed in.
          The way to do a OR search is using a QueryBuilder. The
          weird sintax is postgras.*/

        /* when they login if there's only a twitterId, the query
          only searches for it. If there is also an email, it adds
          the first email to the query as an OR, to find one of the other */

        const query = connection
          .getRepository(User)
          .createQueryBuilder("user")
          .where("user.twitterId = :id", { id });

        let email: string | null = null;
        if (emails) {
          /* just extracting the first email */
          email = emails[0].value;
          query.orWhere("user.email = :email", { email });
        }

        let user = await query.getOne();

        if (!user) {
          /* they are login in first time ever through twitter and
          need to be registered */
          user = await User.create({
            twitterId: id,
            email
          }).save();
        } else if (!user.twitterId) {
          /* they are login in first time through twitter, but
          their email has already signed up in another way. */
          user.twitterId = id;
          user.save();
        } else {
          /* we have a twitterId, and it is just a login */
        }

        /* null is for error, which we won't have since we alredy know
      we have a user in someway above */
        /* this is the callback I can use below, whatever is put as second
      argument can be used in the callback below as req.user */
        return cb(null, { id: user.id });
      }
    )
  );

  server.express.use(passport.initialize());

  server.express.get("/auth/twitter", passport.authenticate("twitter"));

  server.express.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { session: false }),
    (req, res) => {
      // Successful authentication.
      /* I am casting these things as any because I know they are 
      going to exist. Wihtout this, ts says thay can be undefined */
      (req.session as any).userId = (req.user as any).id;
      /* set a userId, send a cookie back and creating a session */

      /* TODO: redirect to frontend */
      res.redirect("/");
    }
  );

  /* Starting server */
  const port = process.env.NODE_ENV === "test" ? 0 : 4000;
  const app = await server.start({ cors, port });

  console.log(`Server is running on localhost:${port}`);

  return app;
};

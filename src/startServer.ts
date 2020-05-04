import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";
import { createTypeormConnection } from "./Utils/createTypeormConnection";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import * as Redis from "ioredis";
import { User } from "./entity/User";

/* The whole process of starting the server was transformed
into an exported function to be called inside the tests */
export const startServer = async () => {
  /* the resolvers and schemas are divided in different folders 
  inside modules, so we need to get each one */
  const schemas: Array<
    GraphQLSchema
  > = []; /* you can see this type by hovering over makeExecutableSchema */
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  /* This is used now for the confirmation email function, it's passed as a context together with the url when we start the server
  the context can be assessed from the resolver, which is where we want to use this stuff
  The url is localhost or the website name. Basically for example http://localhost:4000 or http://my-site.com */
  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  /* the confirmation email link route. It will fetch back the userId stored under the random id in redis*/
  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update({ id: userId }, { confirmed: true });
      /* removing the key value part from redis, so that
      the link doesn't work anymore */
      await redis.del(id);
      res.send("ok");
    } else {
      res.send("invalid");
    }
  });

  await createTypeormConnection();
  /* If the node environment is test, the ormconfig has a dropSchema 
   set to true and the database drops(deletes everything inside)*/

  const port = process.env.NODE_ENV === "test" ? 0 : 4000;
  const app = await server.start({ port });

  console.log(`Server is running on localhost:${port}`);

  return app;
};

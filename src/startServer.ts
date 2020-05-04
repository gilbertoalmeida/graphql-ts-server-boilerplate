import { GraphQLServer } from "graphql-yoga";

import { createTypeormConnection } from "./Utils/createTypeormConnection";

import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { generateSchema } from "./Utils/generateSchema";

/* The whole process of starting the server was transformed
into an exported function to be called inside the tests */
export const startServer = async () => {
  const schemas = generateSchema();
  const server = new GraphQLServer({
    schema: schemas,
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  /* the confirmation email link route. It will fetch back the userId stored under the random id in redis*/
  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConnection();
  /* If the node environment is test, the ormconfig has a dropSchema 
   set to true and the database drops(deletes everything inside)*/

  const port = process.env.NODE_ENV === "test" ? 0 : 4000;
  const app = await server.start({ port });

  console.log(`Server is running on localhost:${port}`);

  return app;
};

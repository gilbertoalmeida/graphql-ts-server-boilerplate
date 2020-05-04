import { v4 } from "uuid";
import { Redis } from "ioredis";

/* passing url bc it can be localhost, or the deployed site */
export const createConfirmEmailLink = async (
  url: string,
  userId: string,
  redis: Redis
) => {
  /* the intent of this function is creating an id that is going to be sent as a link to the user to click on
  and confirm their email */
  const id = v4();

  /* Storing the userId in redis under the random id created by uuid.
  Redis stores things in key value pairs. It could also be in the database, 
  but he decided to do in redis, prob bc it is faster than requesting 
  something from than database */
  /* "ex" is for expiring, last argument is a day in seconds */
  await redis.set(id, userId, "ex", 60 * 60 * 24);

  /* when the user clicks this link, there is a route for it in startServer */
  return `${url}/confirm/${id}`;
};

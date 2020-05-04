import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConnection } from "./createTypeormConnection";
import { User } from "../entity/User";
import * as Redis from "ioredis";
import fetch from "node-fetch";

let userID: string;
let confirmationURL: string;
const redis = new Redis();

beforeAll(async () => {
  await createTypeormConnection();
  const user = await User.create({
    email: "testtest@test.com",
    password: "sdgaergae"
  }).save();

  userID = user.id;
});

describe("make sure createConfirmEmailLink works", () => {
  test("ConfirmationURL is created and can be reached", async () => {
    confirmationURL = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userID as string,
      redis
    );

    /* fetch hits the URL to confirm the email */
    const response = await fetch(confirmationURL);

    const text = await response.text();
    expect(text).toEqual("ok");
  });

  test("User is confirmed in the database", async () => {
    const user = await User.findOne({ where: { id: userID } });
    /* as user is bc user might be undefined. We could put inside
  an if (user) statement, but this is out of the scope of this
  test. If it fails to create a user, there will be a problem 
  up there already */
    expect((user as User).confirmed).toBeTruthy();
  });

  test("Key is removed from Redis", async () => {
    /* dividing the url by the /, returns an array with each part
  the last part is the redis id */
    const chunks = confirmationURL.split("");
    const redisKey = chunks[chunks.length - 1];
    const redisValue = await redis.get(redisKey);
    expect(redisValue).toBeNull();
  });
});

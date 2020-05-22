import { User } from "../../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../../Utils/TestClient";
import { createTestConnection } from "../../../testUtils/createTestConnection";

let userId: string;
let conn: Connection;
const email = "me@test.com";
const password = "asga346t3";

beforeAll(async () => {
  conn = await createTestConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("me", () => {
  test("return null if no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.me();

    expect(response.data.me).toBeNull();
  });

  test("get current user", async () => {
    /* we are creating a new TestClient for everytest to not have
    any share between test cookies */
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});

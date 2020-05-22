import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../Utils/TestClient";
import { createTestConnection } from "../../testUtils/createTestConnection";

let userId: string;
let conn: Connection;
const email = "logout@test.com";
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

describe("logout", () => {
  test("multiple sessions: same user is logged in in 2 devices and logged out from all sessions", async () => {
    const client1 = new TestClient(process.env.TEST_HOST as string);
    const client2 = new TestClient(process.env.TEST_HOST as string);

    await client1.login(email, password);
    await client2.login(email, password);

    /* expect to be the same person, just logged in different
    devices */
    expect(await client1.me()).toEqual(await client2.me());

    await client1.logout();

    const responseLogout = await client1.me();
    expect(responseLogout.data.me).toBeNull();

    /* expect both to be null now*/
    expect(await client1.me()).toEqual(await client2.me());
  });
  test("Single session: testing if a logged in user gets its session killed when loging out", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();

    const response2 = await client.me();

    expect(response2.data.me).toBeNull();
  });
});

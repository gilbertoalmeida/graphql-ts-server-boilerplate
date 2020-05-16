import { createTypeormConnection } from "../../Utils/createTypeormConnection";
import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../Utils/TestClient";

let userId: string;
let conn: Connection;
const email = "testtest@test.com";
const password = "asga346t3";

beforeAll(async () => {
  conn = await createTypeormConnection();
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
  test("testing if a logged in user gets its session killed when loging out", async () => {
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

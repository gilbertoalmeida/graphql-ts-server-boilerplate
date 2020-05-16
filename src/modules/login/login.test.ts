import { invalidLogin, confirmEmailMessage } from "./errorMessages";
import { createTypeormConnection } from "../../Utils/createTypeormConnection";
import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../Utils/TestClient";

const email = "testuser@test.com";
const password = "jalksdf";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  conn.close();
});

const loginTryWithMessage = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("login", () => {
  test("massage for failed login due to email not in the database", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    loginTryWithMessage(client, email, password, invalidLogin);
  });

  test("message for email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.register(email, password);

    loginTryWithMessage(client, email, password, confirmEmailMessage);
  });

  test("bad password message", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await User.update({ email }, { confirmed: true });

    loginTryWithMessage(client, email, "sd", invalidLogin);
  });

  test("login in with confirmed email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.login(email, password);

    expect(response.data).toEqual({
      login: null
    });
  });
});
